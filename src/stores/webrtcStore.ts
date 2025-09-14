import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import SimplePeer from 'simple-peer';
import { io, Socket } from 'socket.io-client';

interface WebRTCState {
  socket: Socket | null;
  peer: SimplePeer.Instance | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isInitiator: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Actions
  initializeSocket: (roomId: string) => void;
  createPeer: (initiator: boolean, stream?: MediaStream) => void;
  destroyPeer: () => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  cleanup: () => void;
}

export const useWebRTCStore = create<WebRTCState>()(
  devtools((set, get) => ({
    socket: null,
    peer: null,
    localStream: null,
    remoteStream: null,
    isInitiator: false,
    isConnected: false,
    isConnecting: false,

    initializeSocket: (roomId) => {
      const socket = io(process.env.NODE_ENV === 'production' ? 'wss://your-server.com' : 'ws://localhost:3001');
      
      socket.emit('join-room', roomId);
      
      socket.on('room-joined', (data) => {
        console.log('Room joined:', data);
        set({ isInitiator: data.isInitiator });
      });

      socket.on('user-joined', () => {
        console.log('User joined room');
        const { localStream } = get();
        if (localStream) {
          get().createPeer(true, localStream);
        }
      });

      socket.on('peer-signal', (data) => {
        const { peer } = get();
        if (peer) {
          peer.signal(data);
        }
      });

      socket.on('user-left', () => {
        console.log('User left room');
        get().destroyPeer();
      });

      set({ socket });
    },

    createPeer: (initiator, stream) => {
      const { socket } = get();
      if (!socket) return;

      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream,
      });

      peer.on('signal', (data) => {
        socket.emit('peer-signal', data);
      });

      peer.on('connect', () => {
        console.log('Peer connected');
        set({ isConnected: true, isConnecting: false });
      });

      peer.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        set({ remoteStream });
      });

      peer.on('close', () => {
        console.log('Peer disconnected');
        set({ isConnected: false, remoteStream: null });
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        set({ isConnecting: false });
      });

      set({ peer, isConnecting: true });
    },

    destroyPeer: () => {
      const { peer } = get();
      if (peer) {
        peer.destroy();
        set({ peer: null, isConnected: false, isConnecting: false, remoteStream: null });
      }
    },

    setLocalStream: (stream) => {
      set({ localStream: stream });
    },

    setRemoteStream: (stream) => {
      set({ remoteStream: stream });
    },

    toggleAudio: () => {
      const { localStream } = get();
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
        }
      }
    },

    toggleVideo: () => {
      const { localStream } = get();
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
        }
      }
    },

    startScreenShare: async () => {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const { peer } = get();
        if (peer) {
          // Replace video track with screen share
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peer._pc?.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }
        }

        // Handle screen share ending
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          get().stopScreenShare();
        });

        set({ localStream: screenStream });
      } catch (error) {
        console.error('Error starting screen share:', error);
      }
    },

    stopScreenShare: () => {
      // This would switch back to camera - implementation depends on your needs
      console.log('Screen share stopped');
    },

    cleanup: () => {
      const { socket, peer, localStream } = get();
      
      if (socket) {
        socket.disconnect();
      }
      
      if (peer) {
        peer.destroy();
      }
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      set({
        socket: null,
        peer: null,
        localStream: null,
        remoteStream: null,
        isConnected: false,
        isConnecting: false,
        isInitiator: false,
      });
    },
  }))
);
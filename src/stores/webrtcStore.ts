import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import SimplePeer from 'simple-peer';
import { io, Socket } from 'socket.io-client';

interface WebRTCState {
  socket: Socket | null;
  peer: SimplePeer.Instance | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  originalCameraStream: MediaStream | null; // 화면공유 전 원본 카메라 스트림
  isInitiator: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  isScreenSharing: boolean;
  
  // Actions
  initializeSocket: (roomId: string) => void;
  createPeer: (initiator: boolean, stream?: MediaStream) => void;
  destroyPeer: () => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  getUserMedia: (constraints: MediaStreamConstraints) => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  cleanup: () => void;
}

export const useWebRTCStore = create<WebRTCState>()(
  devtools((set, get) => ({
    socket: null,
    peer: null,
    localStream: null,
    remoteStream: null,
    originalCameraStream: null,
    isInitiator: false,
    isConnected: false,
    isConnecting: false,
    isScreenSharing: false,

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

    getUserMedia: async (constraints) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        set({ localStream: stream });
        
        // 피어가 이미 있다면 스트림 업데이트
        const { peer } = get();
        if (peer && peer._pc) {
          // 오디오 트랙 교체
          if (constraints.audio && stream.getAudioTracks().length > 0) {
            const audioSender = peer._pc.getSenders().find(s => s.track?.kind === 'audio');
            if (audioSender) {
              await audioSender.replaceTrack(stream.getAudioTracks()[0]);
            }
          }
          
          // 비디오 트랙 교체
          if (constraints.video && stream.getVideoTracks().length > 0) {
            const videoSender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
            if (videoSender) {
              await videoSender.replaceTrack(stream.getVideoTracks()[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error getting user media:', error);
      }
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

    toggleVideo: async () => {
      const { localStream, isScreenSharing } = get();
      if (isScreenSharing) return; // 화면공유 중에는 비디오 토글 비활성화
      
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
        }
      }
    },

    startScreenShare: async () => {
      try {
        const { localStream, peer } = get();
        
        // 현재 카메라 스트림을 백업
        if (localStream && !get().originalCameraStream) {
          set({ originalCameraStream: localStream });
        }
        
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // 피어가 있으면 비디오 트랙 교체
        if (peer && peer._pc) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const videoSender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
          
          if (videoSender && videoTrack) {
            await videoSender.replaceTrack(videoTrack);
          }
        }

        // 화면공유 종료 이벤트 처리
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          get().stopScreenShare();
        });

        set({ 
          localStream: screenStream, 
          isScreenSharing: true 
        });
      } catch (error) {
        console.error('Error starting screen share:', error);
      }
    },

    stopScreenShare: async () => {
      try {
        const { originalCameraStream, peer, localStream } = get();
        
        // 현재 화면공유 스트림 중단
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
        
        // 원본 카메라 스트림으로 복원하거나 새로 생성
        let cameraStream = originalCameraStream;
        
        if (!cameraStream || cameraStream.getTracks().length === 0) {
          // 원본이 없으면 새 카메라 스트림 생성
          const { useUserStore } = await import('./userStore');
          const { isVideoEnabled, isAudioEnabled } = useUserStore.getState();
          
          try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
              video: isVideoEnabled,
              audio: isAudioEnabled,
            });
          } catch (error) {
            console.error('Error getting camera back:', error);
            cameraStream = null;
          }
        }
        
        // 피어가 있으면 비디오 트랙 복원
        if (peer && peer._pc && cameraStream) {
          const videoTrack = cameraStream.getVideoTracks()[0];
          const videoSender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
          
          if (videoSender && videoTrack) {
            await videoSender.replaceTrack(videoTrack);
          }
        }
        
        set({ 
          localStream: cameraStream,
          isScreenSharing: false,
          originalCameraStream: null
        });
      } catch (error) {
        console.error('Error stopping screen share:', error);
      }
    },

    cleanup: () => {
      const { socket, peer, localStream, originalCameraStream } = get();
      
      if (socket) {
        socket.disconnect();
      }
      
      if (peer) {
        peer.destroy();
      }
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (originalCameraStream) {
        originalCameraStream.getTracks().forEach(track => track.stop());
      }

      set({
        socket: null,
        peer: null,
        localStream: null,
        remoteStream: null,
        originalCameraStream: null,
        isConnected: false,
        isConnecting: false,
        isInitiator: false,
        isScreenSharing: false,
      });
    },
  }))
);
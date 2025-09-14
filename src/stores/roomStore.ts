import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Participant {
  id: string;
  nickname: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  stream?: MediaStream;
}

interface Message {
  id: string;
  nickname: string;
  message: string;
  timestamp: Date;
}

interface RoomState {
  roomId: string | null;
  participants: Participant[];
  messages: Message[];
  isConnected: boolean;
  isScreenSharing: boolean;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  
  // UI States
  isChatOpen: boolean;
  isWhiteboardOpen: boolean;
  isSettingsOpen: boolean;
  
  // Actions
  setRoomId: (roomId: string) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setConnected: (connected: boolean) => void;
  setScreenSharing: (sharing: boolean) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  toggleChat: () => void;
  toggleWhiteboard: () => void;
  toggleSettings: () => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomState>()(
  devtools((set, get) => ({
    roomId: null,
    participants: [],
    messages: [],
    isConnected: false,
    isScreenSharing: false,
    remoteStream: null,
    localStream: null,
    isChatOpen: false,
    isWhiteboardOpen: false,
    isSettingsOpen: false,

    setRoomId: (roomId) => set({ roomId }),
    
    addParticipant: (participant) => 
      set((state) => ({ 
        participants: [...state.participants, participant] 
      })),
    
    removeParticipant: (participantId) =>
      set((state) => ({
        participants: state.participants.filter(p => p.id !== participantId)
      })),
    
    updateParticipant: (participantId, updates) =>
      set((state) => ({
        participants: state.participants.map(p => 
          p.id === participantId ? { ...p, ...updates } : p
        )
      })),
    
    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages, {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date()
        }]
      })),
    
    setConnected: (connected) => set({ isConnected: connected }),
    setScreenSharing: (sharing) => set({ isScreenSharing: sharing }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),
    setLocalStream: (stream) => set({ localStream: stream }),
    
    toggleChat: () => set((state) => ({ 
      isChatOpen: !state.isChatOpen,
      isWhiteboardOpen: false // Close whiteboard when opening chat
    })),
    
    toggleWhiteboard: () => set((state) => ({ 
      isWhiteboardOpen: !state.isWhiteboardOpen,
      isChatOpen: false // Close chat when opening whiteboard
    })),
    
    toggleSettings: () => set((state) => ({ 
      isSettingsOpen: !state.isSettingsOpen 
    })),
    
    clearRoom: () => set({
      roomId: null,
      participants: [],
      messages: [],
      isConnected: false,
      isScreenSharing: false,
      remoteStream: null,
      localStream: null,
      isChatOpen: false,
      isWhiteboardOpen: false,
      isSettingsOpen: false,
    }),
  }))
);
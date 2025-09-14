import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserState {
  nickname: string;
  roomName: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  selectedAudioDevice: string | null;
  selectedVideoDevice: string | null;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  
  // Actions
  setNickname: (nickname: string) => void;
  setRoomName: (roomName: string) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setSelectedAudioDevice: (deviceId: string | null) => void;
  setSelectedVideoDevice: (deviceId: string | null) => void;
  setAudioDevices: (devices: MediaDeviceInfo[]) => void;
  setVideoDevices: (devices: MediaDeviceInfo[]) => void;
  generateRandomNickname: () => void;
}

const randomNicknames = [
  '익명의 고양이', '신비한 펭귄', '멋진 드래곤', '즐거운 토끼', '친근한 팬더',
  '활발한 호랑이', '지혜로운 부엉이', '용감한 사자', '귀여운 다람쥐', '평화로운 비둘기'
];

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        nickname: '',
        roomName: '',
        isAudioEnabled: true,
        isVideoEnabled: true,
        selectedAudioDevice: null,
        selectedVideoDevice: null,
        audioDevices: [],
        videoDevices: [],

        setNickname: (nickname) => set({ nickname }),
        setRoomName: (roomName) => set({ roomName }),
        setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
        setVideoEnabled: (enabled) => set({ isVideoEnabled: enabled }),
        setSelectedAudioDevice: (deviceId) => set({ selectedAudioDevice: deviceId }),
        setSelectedVideoDevice: (deviceId) => set({ selectedVideoDevice: deviceId }),
        setAudioDevices: (devices) => set({ audioDevices: devices }),
        setVideoDevices: (devices) => set({ videoDevices: devices }),
        generateRandomNickname: () => {
          const randomIndex = Math.floor(Math.random() * randomNicknames.length);
          set({ nickname: randomNicknames[randomIndex] });
        },
      }),
      {
        name: 'user-store',
        partialize: (state) => ({ 
          nickname: state.nickname,
          isAudioEnabled: state.isAudioEnabled,
          isVideoEnabled: state.isVideoEnabled,
        }),
      }
    )
  )
);
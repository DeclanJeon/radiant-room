import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useRoomStore } from '@/stores/roomStore';
import { useWebRTCStore } from '@/stores/webrtcStore';
import { ControlBar } from '@/components/meeting/ControlBar';
import { ChatPanel } from '@/components/meeting/ChatPanel';
import { WhiteboardPanel } from '@/components/meeting/WhiteboardPanel';
import { SettingsPanel } from '@/components/meeting/SettingsPanel';
import { Camera, CameraOff, Mic, MicOff, Phone } from 'lucide-react';

const MeetingRoom = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const { nickname, isAudioEnabled, isVideoEnabled } = useUserStore();
  const { 
    isChatOpen, 
    isWhiteboardOpen, 
    isSettingsOpen,
    isConnected,
    participants 
  } = useRoomStore();
  
  const { 
    localStream, 
    remoteStream, 
    initializeSocket, 
    cleanup 
  } = useWebRTCStore();

  useEffect(() => {
    if (!roomName || !nickname) {
      navigate('/');
      return;
    }

    // Initialize WebRTC connection
    initializeSocket(roomName);

    return () => {
      cleanup();
    };
  }, [roomName, nickname]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const leaveRoom = () => {
    cleanup();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-video-bg flex flex-col">
      {/* Header */}
      <header className="bg-control-bar/80 backdrop-blur-sm border-b border-border/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-foreground">
              {decodeURIComponent(roomName || '')}
            </h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-warning'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? '연결됨' : '연결 중...'}
              </span>
            </div>
          </div>
          
          <Button 
            variant="control-danger" 
            onClick={leaveRoom}
            className="flex items-center space-x-2"
          >
            <Phone className="h-4 w-4" />
            <span>나가기</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        <div className="grid h-full">
          {/* Video Grid */}
          <div className="relative p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Local Video */}
              <div className="relative bg-muted rounded-lg overflow-hidden shadow-card">
                {isVideoEnabled && localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <div className="text-center">
                      <CameraOff className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">{nickname}</p>
                    </div>
                  </div>
                )}
                
                {/* Local Video Overlay */}
                <div className="absolute top-4 left-4">
                  <div className="bg-black/50 rounded px-2 py-1">
                    <span className="text-white text-sm">{nickname} (나)</span>
                  </div>
                </div>
                
                {/* Audio Indicator */}
                <div className="absolute top-4 right-4">
                  {isAudioEnabled ? (
                    <Mic className="h-5 w-5 text-success" />
                  ) : (
                    <MicOff className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>

              {/* Remote Video */}
              <div className="relative bg-muted rounded-lg overflow-hidden shadow-card">
                {remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl text-primary font-semibold">?</span>
                      </div>
                      <p className="text-muted-foreground">상대방을 기다리는 중...</p>
                    </div>
                  </div>
                )}
                
                {/* Remote Video Overlay */}
                {participants.length > 0 && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-black/50 rounded px-2 py-1">
                      <span className="text-white text-sm">
                        {participants[0]?.nickname || '상대방'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        {isChatOpen && <ChatPanel />}
        {isWhiteboardOpen && <WhiteboardPanel />}
        {isSettingsOpen && <SettingsPanel />}
      </main>

      {/* Control Bar */}
      <ControlBar />
    </div>
  );
};

export default MeetingRoom;
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useRoomStore } from '@/stores/roomStore';
import { useWebRTCStore } from '@/stores/webrtcStore';
import { 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  MonitorSpeaker,
  MonitorStop,
  MessageCircle,
  PenTool,
  MoreHorizontal,
  Settings
} from 'lucide-react';

export const ControlBar = () => {
  const { isAudioEnabled, isVideoEnabled, setAudioEnabled, setVideoEnabled } = useUserStore();
  const { 
    isChatOpen, 
    isWhiteboardOpen, 
    isSettingsOpen,
    isScreenSharing,
    toggleChat, 
    toggleWhiteboard, 
    toggleSettings 
  } = useRoomStore();
  
  const { 
    toggleAudio, 
    toggleVideo, 
    startScreenShare, 
    stopScreenShare,
    isScreenSharing: webRTCScreenSharing
  } = useWebRTCStore();

  const handleAudioToggle = async () => {
    toggleAudio();
    setAudioEnabled(!isAudioEnabled);
  };

  const handleVideoToggle = async () => {
    if (webRTCScreenSharing) return; // 화면공유 중에는 비디오 토글 비활성화
    
    await toggleVideo();
    setVideoEnabled(!isVideoEnabled);
  };

  const handleScreenShare = async () => {
    try {
      if (webRTCScreenSharing) {
        await stopScreenShare();
      } else {
        await startScreenShare();
      }
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  return (
    <div className="bg-control-bar/95 backdrop-blur-sm border-t border-border/30 px-6 py-4">
      <div className="flex items-center justify-center space-x-2">
        {/* Audio Control */}
        <Button
          variant={isAudioEnabled ? "control" : "control-danger"}
          size="control-icon"
          onClick={handleAudioToggle}
          className="relative"
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        {/* Video Control */}
        <Button
          variant={isVideoEnabled ? "control" : "control-danger"}
          size="control-icon"
          onClick={handleVideoToggle}
          className="relative"
        >
          {isVideoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </Button>

        {/* Screen Share */}
        <Button
          variant={webRTCScreenSharing ? "control-active" : "control"}
          size="control-icon"
          onClick={handleScreenShare}
        >
          {webRTCScreenSharing ? <MonitorStop className="h-5 w-5" /> : <MonitorSpeaker className="h-5 w-5" />}
        </Button>

        {/* Chat */}
        <Button
          variant={isChatOpen ? "control-active" : "control"}
          size="control-icon"
          onClick={toggleChat}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>

        {/* Whiteboard */}
        <Button
          variant={isWhiteboardOpen ? "control-active" : "control"}
          size="control-icon"
          onClick={toggleWhiteboard}
        >
          <PenTool className="h-5 w-5" />
        </Button>

        {/* Divider */}
        <div className="w-px h-8 bg-border/50 mx-2" />

        {/* Settings */}
        <Button
          variant={isSettingsOpen ? "control-active" : "control"}
          size="control-icon"
          onClick={toggleSettings}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserStore } from '@/stores/userStore';
import { useWebRTCStore } from '@/stores/webrtcStore';
import { Camera, CameraOff, Mic, MicOff, Settings, ArrowLeft } from 'lucide-react';

const SetupPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const {
    nickname,
    roomName,
    isAudioEnabled,
    isVideoEnabled,
    selectedAudioDevice,
    selectedVideoDevice,
    audioDevices,
    videoDevices,
    setAudioEnabled,
    setVideoEnabled,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    setAudioDevices,
    setVideoDevices,
  } = useUserStore();

  const { setLocalStream } = useWebRTCStore();

  useEffect(() => {
    // Redirect if no room name
    if (!roomName) {
      navigate('/');
      return;
    }

    // Get available devices
    getDevices();
    
    // Initialize media stream
    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      // Filter out devices with empty deviceIds and ensure we have valid devices
      const audioInputs = devices.filter(device => 
        device.kind === 'audioinput' && device.deviceId && device.deviceId.trim() !== ''
      );
      const videoInputs = devices.filter(device => 
        device.kind === 'videoinput' && device.deviceId && device.deviceId.trim() !== ''
      );
      
      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
      
      // Set default devices if none selected
      if (!selectedAudioDevice && audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
      if (!selectedVideoDevice && videoInputs.length > 0) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  };

  const initializeMedia = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: isAudioEnabled ? {
          deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined
        } : false,
        video: isVideoEnabled ? {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setLocalStream(mediaStream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!isAudioEnabled);
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!isVideoEnabled);
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const handleDeviceChange = async (deviceId: string, type: 'audio' | 'video') => {
    if (type === 'audio') {
      setSelectedAudioDevice(deviceId);
    } else {
      setSelectedVideoDevice(deviceId);
    }
    
    // Reinitialize media with new device
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    await initializeMedia();
  };

  const joinRoom = () => {
    navigate(`/room/${encodeURIComponent(roomName)}`);
  };

  return (
    <div className="min-h-screen bg-video-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>돌아가기</span>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">미팅 준비</h1>
          <div />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>미리보기</CardTitle>
                <CardDescription>
                  {nickname}님으로 "{roomName}" 방에 입장합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {isVideoEnabled ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted">
                      <CameraOff className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    <Button
                      variant={isAudioEnabled ? "control" : "control-danger"}
                      size="control-icon"
                      onClick={toggleAudio}
                    >
                      {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    <Button
                      variant={isVideoEnabled ? "control" : "control-danger"}
                      size="control-icon"
                      onClick={toggleVideo}
                    >
                      {isVideoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>장치 설정</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Microphone Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">마이크</label>
                  <Select
                    value={selectedAudioDevice || ''}
                    onValueChange={(value) => handleDeviceChange(value, 'audio')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="마이크를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioDevices.map((device, index) => (
                        <SelectItem 
                          key={device.deviceId || `audio-${index}`} 
                          value={device.deviceId || `audio-${index}`}
                        >
                          {device.label || `마이크 ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Camera Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">카메라</label>
                  <Select
                    value={selectedVideoDevice || ''}
                    onValueChange={(value) => handleDeviceChange(value, 'video')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카메라를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {videoDevices.map((device, index) => (
                        <SelectItem 
                          key={device.deviceId || `video-${index}`} 
                          value={device.deviceId || `video-${index}`}
                        >
                          {device.label || `카메라 ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Join Button */}
            <Button 
              variant="hero" 
              size="xl" 
              onClick={joinRoom}
              className="w-full"
            >
              미팅 참가하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
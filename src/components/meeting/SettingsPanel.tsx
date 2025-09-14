import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUserStore } from '@/stores/userStore';
import { useRoomStore } from '@/stores/roomStore';
import { X, Camera, Mic, Volume2 } from 'lucide-react';

export const SettingsPanel = () => {
  const {
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
  } = useUserStore();
  
  const { toggleSettings } = useRoomStore();

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-card/95 backdrop-blur-sm border-l border-border/50 flex flex-col shadow-control">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <h3 className="font-semibold text-foreground">설정</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSettings}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Audio Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground flex items-center space-x-2">
            <Mic className="h-4 w-4" />
            <span>오디오</span>
          </h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">마이크 활성화</span>
            <Switch
              checked={isAudioEnabled}
              onCheckedChange={setAudioEnabled}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">마이크 선택</label>
            <Select
              value={selectedAudioDevice || ''}
              onValueChange={setSelectedAudioDevice}
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
        </div>

        {/* Video Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground flex items-center space-x-2">
            <Camera className="h-4 w-4" />
            <span>비디오</span>
          </h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">카메라 활성화</span>
            <Switch
              checked={isVideoEnabled}
              onCheckedChange={setVideoEnabled}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">카메라 선택</label>
            <Select
              value={selectedVideoDevice || ''}
              onValueChange={setSelectedVideoDevice}
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
        </div>

        {/* Audio Output */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground flex items-center space-x-2">
            <Volume2 className="h-4 w-4" />
            <span>스피커</span>
          </h4>
          
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">출력 음량</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="100"
              className="w-full"
            />
          </div>
        </div>

        {/* Connection Info */}
        <div className="space-y-4 pt-4 border-t border-border/30">
          <h4 className="font-medium text-foreground">연결 정보</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <div>품질: 자동 조정</div>
            <div>지연시간: ~50ms</div>
            <div>해상도: 1280x720</div>
          </div>
        </div>
      </div>
    </div>
  );
};
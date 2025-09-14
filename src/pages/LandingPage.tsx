import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/stores/userStore';
import { Video, Users, Shield, Zap } from 'lucide-react';
import heroImage from '@/assets/hero-video-conference.jpg';

const LandingPage = () => {
  const navigate = useNavigate();
  const [roomNameInput, setRoomNameInput] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  
  const { setRoomName, setNickname, generateRandomNickname } = useUserStore();

  const handleJoinRoom = () => {
    if (!roomNameInput.trim()) {
      return;
    }
    
    const finalNickname = nicknameInput.trim() || generateRandomNickname();
    
    setRoomName(roomNameInput.trim());
    setNickname(typeof finalNickname === 'string' ? finalNickname : '');
    
    navigate('/setup');
  };

  const handleRandomNickname = () => {
    generateRandomNickname();
    const store = useUserStore.getState();
    setNicknameInput(store.nickname);
  };

  const features = [
    {
      icon: Video,
      title: '고품질 화상통화',
      description: 'Crystal clear video calls with adaptive quality'
    },
    {
      icon: Users,
      title: '실시간 협업',
      description: 'Whiteboard and screen sharing for seamless collaboration'
    },
    {
      icon: Shield,
      title: '보안 우선',
      description: 'End-to-end encrypted communications'
    },
    {
      icon: Zap,
      title: '즉시 연결',
      description: 'No downloads or registrations required'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">VideoConnect</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                1:1 화상회의
                <span className="block text-primary">새로운 경험</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                별도의 설치나 가입 없이 바로 시작하는 프리미엄 화상회의. 
                고품질 영상과 실시간 협업 기능을 지금 경험해보세요.
              </p>
            </div>

            {/* Join Room Form */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-card">
              <CardHeader>
                <CardTitle>지금 바로 시작하기</CardTitle>
                <CardDescription>
                  방 제목을 입력하고 화상회의를 시작하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="방 제목을 입력하세요"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="닉네임 (비워두면 랜덤 생성)"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      className="h-12 flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleRandomNickname}
                      className="h-12 px-4"
                    >
                      랜덤
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={handleJoinRoom}
                  disabled={!roomNameInput.trim()}
                  className="w-full"
                >
                  화상회의 시작하기
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Features & Hero Image */}
          <div className="space-y-8">
            {/* Hero Image */}
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Video Conference Illustration" 
                className="w-full rounded-2xl shadow-card"
              />
              <div className="absolute inset-0 bg-gradient-primary/10 rounded-2xl" />
            </div>
            
            <div className="grid gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/30 backdrop-blur-sm border-border/30 hover:bg-card/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
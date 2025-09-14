import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Video } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">페이지를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="hero" 
            size="lg" 
            onClick={() => window.location.href = '/'}
            className="flex items-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>홈으로 돌아가기</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.history.back()}
            className="flex items-center space-x-2"
          >
            <Video className="h-5 w-5" />
            <span>이전 페이지</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

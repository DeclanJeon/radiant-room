import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserStore } from '@/stores/userStore';
import { useRoomStore } from '@/stores/roomStore';
import { Send, X } from 'lucide-react';
import { format } from 'date-fns';

export const ChatPanel = () => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { nickname } = useUserStore();
  const { messages, addMessage, toggleChat } = useRoomStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      addMessage({
        nickname,
        message: message.trim(),
      });
      setMessage('');
    }
  };

  return (
    <div className="h-full w-80 bg-card/95 backdrop-blur-sm border-l border-border/50 flex flex-col shadow-control animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <h3 className="font-semibold text-foreground">채팅</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleChat}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              아직 메시지가 없습니다
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {msg.nickname}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(msg.timestamp, 'HH:mm')}
                  </span>
                </div>
                <div className={`p-3 rounded-lg text-sm ${
                  msg.nickname === nickname 
                    ? 'bg-primary text-primary-foreground ml-4' 
                    : 'bg-muted text-muted-foreground mr-4'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/30">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
            maxLength={500}
          />
          <Button
            type="submit"
            variant="control"
            size="icon"
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
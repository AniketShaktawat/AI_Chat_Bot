import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, PlusCircle } from "lucide-react";
import type { Message } from "@shared/schema";

interface ChatSidebarProps {
  sessions: { [key: string]: Message[] };
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({ 
  sessions, 
  currentSessionId,
  onSessionSelect,
  onNewChat 
}: ChatSidebarProps) {
  return (
    <div className="w-80 border-r bg-muted/50">
      <div className="p-4 border-b">
        <Button 
          variant="secondary" 
          className="w-full gap-2"
          onClick={onNewChat}
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-65px)]">
        <div className="p-2">
          {Object.entries(sessions).map(([sessionId, messages]) => {
            const firstUserMessage = messages.find(m => m.role === "user")?.content;
            const date = new Date(messages[0].timestamp).toLocaleDateString();

            return (
              <Button
                key={sessionId}
                variant={sessionId === currentSessionId ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 h-auto py-3 mb-1"
                onClick={() => onSessionSelect(sessionId)}
              >
                <MessageSquare className="h-4 w-4" />
                <div className="text-left">
                  <p className="line-clamp-1 text-sm">
                    {firstUserMessage || "New Chat"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {messages.length} messages • {date}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
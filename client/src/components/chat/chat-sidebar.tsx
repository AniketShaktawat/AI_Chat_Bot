import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, PlusCircle, Home, Trash2 } from "lucide-react";
import type { Message } from "@shared/schema";
import { format } from "date-fns";

interface ChatSidebarProps {
  sessions: { [key: string]: Message[] };
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (sessionId: string) => void;
}

export default function ChatSidebar({ 
  sessions, 
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteChat
}: ChatSidebarProps) {
  // Sort sessions by latest message timestamp
  const sortedSessions = Object.entries(sessions).sort(([, messagesA], [, messagesB]) => {
    const latestA = Math.max(...messagesA.map(m => new Date(m.timestamp).getTime()));
    const latestB = Math.max(...messagesB.map(m => new Date(m.timestamp).getTime()));
    return latestB - latestA;
  });

  return (
    <div className="w-64 border-r bg-white">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-primary mb-4">DoctAid</h1>
        <Button 
          variant="secondary" 
          className="w-full gap-2 bg-primary text-white hover:bg-primary/90"
          onClick={onNewChat}
        >
          <PlusCircle className="h-4 w-4" />
          New Consultation
        </Button>
      </div>

      <div className="px-4 py-2">
        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </nav>
      </div>

      <div className="border-t my-4" />

      <div className="px-4 py-2">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Recent Consultations</h2>
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-1">
            {sortedSessions.map(([sessionId, messages]) => {
              const firstUserMessage = messages.find(m => m.role === "user")?.content;
              const latestMessage = messages[messages.length - 1];
              const timestamp = new Date(latestMessage.timestamp);

              return (
                <div key={sessionId} className="group relative">
                  <Button
                    variant={sessionId === currentSessionId ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2 h-auto py-3",
                      sessionId === currentSessionId && "bg-primary/10"
                    )}
                    onClick={() => onSessionSelect(sessionId)}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <div className="text-left overflow-hidden">
                      <p className="line-clamp-1 text-sm">
                        {firstUserMessage || "New Consultation"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {messages.length} messages • {format(timestamp, 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(sessionId);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
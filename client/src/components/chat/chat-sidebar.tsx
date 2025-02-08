import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, PlusCircle, Home, Settings, LogOut } from "lucide-react";
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
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </nav>
      </div>

      <div className="border-t my-4" />

      <div className="px-4 py-2">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Recent Consultations</h2>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-1">
            {Object.entries(sessions).map(([sessionId, messages]) => {
              const firstUserMessage = messages.find(m => m.role === "user")?.content;
              const date = new Date(messages[0].timestamp).toLocaleDateString();

              return (
                <Button
                  key={sessionId}
                  variant={sessionId === currentSessionId ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 h-auto py-3",
                    sessionId === currentSessionId && "bg-primary/10"
                  )}
                  onClick={() => onSessionSelect(sessionId)}
                >
                  <MessageSquare className="h-4 w-4" />
                  <div className="text-left">
                    <p className="line-clamp-1 text-sm">
                      {firstUserMessage || "New Consultation"}
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

      <div className="absolute bottom-0 w-64 p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
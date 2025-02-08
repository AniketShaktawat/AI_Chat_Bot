import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, PlusCircle } from "lucide-react";
import type { Message } from "@shared/schema";

interface ChatSidebarProps {
  messages: Message[];
  onNewChat: () => void;
  onConversationSelect?: () => void;
}

export default function ChatSidebar({ messages, onNewChat, onConversationSelect }: ChatSidebarProps) {
  // Group messages by conversation (for now we have only one conversation)
  const firstUserMessage = messages.find(m => m.role === "user")?.content;

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
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-auto py-3"
            onClick={onConversationSelect}
          >
            <MessageSquare className="h-4 w-4" />
            <div className="text-left">
              <p className="line-clamp-1 text-sm">
                {firstUserMessage || "New Chat"}
              </p>
              <p className="text-xs text-muted-foreground">
                {messages.length} messages
              </p>
            </div>
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
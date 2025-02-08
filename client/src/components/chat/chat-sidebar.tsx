import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus } from "lucide-react";
import type { Message, Conversation } from "@shared/schema";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId?: number;
  messages: Message[];
  onConversationSelect: (id: number) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({ 
  conversations,
  activeConversationId,
  messages,
  onConversationSelect,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <div className="w-80 border-r bg-muted/50">
      <div className="p-4 border-b">
        <Button 
          className="w-full gap-2" 
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-65px)]">
        <div className="p-2 space-y-2">
          {conversations.map((conversation) => {
            const firstUserMessage = messages
              .filter(m => m.conversationId === conversation.id && m.role === "user")
              .at(0)?.content;

            return (
              <Button
                key={conversation.id}
                variant={activeConversationId === conversation.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 h-auto py-3"
                onClick={() => onConversationSelect(conversation.id)}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <div className="text-left">
                  <p className="line-clamp-1 text-sm">
                    {firstUserMessage || conversation.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {messages.filter(m => m.conversationId === conversation.id).length} messages
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
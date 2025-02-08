import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "@/components/chat/message-bubble";
import InputForm from "@/components/chat/input-form";
import TypingIndicator from "@/components/chat/typing-indicator";
import ChatSidebar from "@/components/chat/chat-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message, Conversation } from "@shared/schema";
import { useState } from "react";

export default function Chat() {
  const { toast } = useToast();
  const [activeConversationId, setActiveConversationId] = useState<number>();

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/conversations', activeConversationId, 'messages'],
    enabled: !!activeConversationId,
  });

  const newChatMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/conversations');
      return res.json();
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setActiveConversationId(conversation.id);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeConversationId) throw new Error("No conversation selected");
      const res = await apiRequest('POST', `/api/conversations/${activeConversationId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', activeConversationId, 'messages']
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  // Create a new chat if there are no conversations
  if (conversations.length === 0 && !newChatMutation.isPending) {
    newChatMutation.mutate();
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar 
        conversations={conversations}
        activeConversationId={activeConversationId}
        messages={messages}
        onConversationSelect={setActiveConversationId}
        onNewChat={() => newChatMutation.mutate()}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {messageMutation.isPending && <TypingIndicator />}
          </ScrollArea>
        </div>
        <InputForm 
          onSubmit={(content) => messageMutation.mutate(content)}
          isLoading={messageMutation.isPending}
        />
      </div>
    </div>
  );
}
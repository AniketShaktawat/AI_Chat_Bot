import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "@/components/chat/message-bubble";
import InputForm from "@/components/chat/input-form";
import TypingIndicator from "@/components/chat/typing-indicator";
import ChatSidebar from "@/components/chat/chat-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@shared/schema";
import { useState } from "react";

export default function Chat() {
  const { toast } = useToast();
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => 
    crypto.randomUUID()
  );

  const { data: messages = [] } = useQuery<Message[]>({ 
    queryKey: ['/api/messages']
  });

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest('POST', '/api/messages', { 
        content,
        sessionId: currentSessionId
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      setCurrentSessionId(crypto.randomUUID());
    },
    onSuccess: () => {
      toast({
        title: "New Chat Started",
        description: "You can now start a new conversation."
      });
    }
  });

  const currentMessages = messages.filter(m => m.sessionId === currentSessionId);
  const sessions = messages.reduce<{ [key: string]: Message[] }>((acc, message) => {
    if (!acc[message.sessionId]) {
      acc[message.sessionId] = [];
    }
    acc[message.sessionId].push(message);
    return acc;
  }, {});

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={setCurrentSessionId}
        onNewChat={() => clearMutation.mutate()}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {currentMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {mutation.isPending && <TypingIndicator />}
          </ScrollArea>
        </div>
        <InputForm 
          onSubmit={(content) => mutation.mutate(content)}
          isLoading={mutation.isPending}
        />
      </div>
    </div>
  );
}
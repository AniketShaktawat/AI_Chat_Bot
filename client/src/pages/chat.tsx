import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "@/components/chat/message-bubble";
import InputForm from "@/components/chat/input-form";
import TypingIndicator from "@/components/chat/typing-indicator";
import ChatSidebar from "@/components/chat/chat-sidebar";
import ProfileDialog, { type ProfileData } from "@/components/chat/profile-dialog";
import type { Message } from "@shared/schema";
import { useState, useEffect, useRef } from "react";

export default function Chat() {
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => 
    crypto.randomUUID()
  );

  const { data: messages = [] } = useQuery<Message[]>({ 
    queryKey: ['/api/messages']
  });

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      // Optimistically add user message to the UI
      const optimisticUserMessage: Message = {
        id: Date.now(),
        role: "user",
        content,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(['/api/messages'], (old = []) => 
        [...old, optimisticUserMessage]
      );

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
      // Remove the optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    }
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      setCurrentSessionId(crypto.randomUUID());
      setShowProfileDialog(true);
    },
    onSuccess: () => {
      toast({
        title: "New Consultation Started",
        description: "You can now start a new consultation."
      });
    }
  });

  const deleteChatMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest('DELETE', `/api/messages/${sessionId}`);
      if (sessionId === currentSessionId) {
        setCurrentSessionId(crypto.randomUUID());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({
        title: "Chat Deleted",
        description: "The consultation has been deleted."
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });

  const handleProfileSubmit = async (data: ProfileData) => {
    const profileContent = `Patient Profile:\n- Age: ${data.age} years\n- Gender: ${data.gender}\n- Weight: ${data.weight} kg\n- Height: ${data.height} cm`;
    mutation.mutate(profileContent);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages, mutation.isPending]);

  const currentMessages = messages.filter(m => m.sessionId === currentSessionId);
  const sessions = messages.reduce<{ [key: string]: Message[] }>((acc, message) => {
    if (!acc[message.sessionId]) {
      acc[message.sessionId] = [];
    }
    acc[message.sessionId].push(message);
    return acc;
  }, {});

  return (
    <div className="flex h-screen bg-gray-50">
      <ProfileDialog 
        open={showProfileDialog} 
        onClose={() => setShowProfileDialog(false)} 
        onSubmit={handleProfileSubmit}
      />
      <ChatSidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={setCurrentSessionId}
        onNewChat={() => clearMutation.mutate()}
        onDeleteChat={(sessionId) => deleteChatMutation.mutate(sessionId)}
      />
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Medical Consultation
          </h2>
          <p className="text-sm text-gray-500">
            Chat with our AI medical assistant
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <div ref={scrollAreaRef} className="h-full overflow-auto p-6">
            {currentMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {mutation.isPending && <TypingIndicator />}
          </div>
        </div>
        <InputForm 
          onSubmit={(content) => mutation.mutate(content)}
          isLoading={mutation.isPending}
        />
      </div>
    </div>
  );
}
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className={cn(
        "h-8 w-8",
        isUser ? "bg-primary" : "bg-secondary"
      )}>
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </Avatar>
      <Card className={cn(
        "p-4 max-w-[80%]",
        isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
      )}>
        <ReactMarkdown 
          className="prose dark:prose-invert prose-sm max-w-none"
          components={{
            pre: ({ node, ...props }) => (
              <div className="overflow-auto rounded-lg bg-muted p-4 my-2">
                <pre {...props} />
              </div>
            ),
            code: ({ node, ...props }) => (
              <code className="bg-muted px-1 py-0.5 rounded-sm" {...props} />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </Card>
    </div>
  );
}

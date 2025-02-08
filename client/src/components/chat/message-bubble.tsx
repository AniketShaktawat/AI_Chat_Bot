import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { User, Stethoscope } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn(
      "flex gap-3 mb-6",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className={cn(
        "h-8 w-8",
        isUser ? "bg-gray-200" : "bg-primary"
      )}>
        {isUser ? (
          <User className="h-5 w-5 text-gray-600" />
        ) : (
          <Stethoscope className="h-5 w-5 text-white" />
        )}
      </Avatar>
      <Card className={cn(
        "p-4 max-w-[80%] shadow-sm",
        isUser ? "bg-white" : "bg-primary/5"
      )}>
        <ReactMarkdown 
          className="prose dark:prose-invert prose-sm max-w-none"
          components={{
            pre: ({ node, ...props }) => (
              <div className="overflow-auto rounded-lg bg-gray-50 p-4 my-2">
                <pre {...props} />
              </div>
            ),
            code: ({ node, ...props }) => (
              <code className="bg-gray-50 px-1 py-0.5 rounded-sm" {...props} />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </Card>
    </div>
  );
}
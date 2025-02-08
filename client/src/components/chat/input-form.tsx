import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface InputFormProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;
    onSubmit(content);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your medical question..."
          className="resize-none bg-gray-50 border-gray-200"
          rows={1}
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !content.trim()}
          className="bg-primary hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
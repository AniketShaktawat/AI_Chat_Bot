export default function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center p-4">
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
    </div>
  );
}

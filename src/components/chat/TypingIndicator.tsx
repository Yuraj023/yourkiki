const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1 border border-primary/20">
        <span className="text-sm">🌸</span>
      </div>
      <div className="bg-card/90 text-card-foreground rounded-2xl px-5 py-3.5 shadow-sm backdrop-blur-sm border border-border/60">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

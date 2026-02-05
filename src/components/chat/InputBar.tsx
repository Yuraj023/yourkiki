import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface InputBarProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const InputBar = ({ onSendMessage, disabled }: InputBarProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-end">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Kiki..."
        disabled={disabled}
        className="min-h-[44px] sm:min-h-[48px] max-h-[100px] sm:max-h-[120px] resize-none bg-background/80 backdrop-blur-sm border-border/50 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
        rows={1}
      />
      <Button
        type="submit"
        disabled={disabled || !message.trim()}
        size="icon"
        className="h-[44px] w-[44px] sm:h-[48px] sm:w-[48px] shrink-0 rounded-2xl bg-primary hover:bg-primary/90 transition-colors shadow-sm"
      >
        <Send className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </form>
  );
};

export default InputBar;
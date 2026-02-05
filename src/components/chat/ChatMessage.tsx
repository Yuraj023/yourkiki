import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full animate-fade-in gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1 border border-primary/20">
          <span className="text-sm">🌸</span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-card/90 text-card-foreground backdrop-blur-sm border border-border/60"
        )}
      >
        {isUser ? (
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-p:leading-relaxed prose-headings:mt-3 prose-headings:mb-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-foreground prose-em:text-foreground">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <span className="text-[10px] sm:text-xs opacity-60 mt-1.5 block">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
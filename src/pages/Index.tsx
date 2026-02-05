import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatWindow from "@/components/chat/ChatWindow";
import InputBar from "@/components/chat/InputBar";
import ThemeToggle from "@/components/chat/ThemeToggle";
import OverlayMenu from "@/components/OverlayMenu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Message } from "@/types/chat";
import { sendChatMessage } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import FeedbackPopup from "@/components/FeedbackPopup";
import { 
  getOrCreateInitialConversation, 
  getConversationMessages, 
  saveMessage,
  createConversation
} from "@/services/chatPersistenceService";
import { useViewportHeight } from "@/hooks/use-viewport-height";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth(); // Also get profile
  
  // Use viewport height hook to handle mobile keyboard
  useViewportHeight();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Show feedback popup after login/signup (only once)
  useEffect(() => {
    if (user) {
      // Check if feedback has already been shown for this user
      const feedbackShown = localStorage.getItem(`feedback_shown_${user.id}`);
      const feedbackSubmitted = localStorage.getItem(`feedback_submitted_${user.id}`);
      
      // Only show if it hasn't been shown and not submitted
      if (!feedbackShown && !feedbackSubmitted) {
        const timer = setTimeout(() => {
          setShowFeedbackPopup(true);
          // Mark as shown so it doesn't appear again
          localStorage.setItem(`feedback_shown_${user.id}`, 'true');
        }, 10000); // Show after 10 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Load conversation from database
  useEffect(() => {
    const loadConversation = async () => {
      if (!user) return;
      
      try {
        // Get or create initial conversation for the user
        const conversation = await getOrCreateInitialConversation(user.id);
        if (conversation) {
          setConversationId(conversation.id);
          
          // Load messages for this conversation
          const conversationMessages = await getConversationMessages(conversation.id);
          if (conversationMessages.length > 0) {
            setMessages(conversationMessages);
          } else {
            // Authentic, girlfriend-like welcome message with user's name
            // Only use profile name if it exists and is not empty
            const userName = (profile?.name && profile.name.trim()) 
              ? profile.name.trim() 
              : (user.email?.split('@')[0] || 'there');
            setMessages([
              {
                id: "1",
                role: "assistant",
                content: `Hey ${userName}! 😊 I was just thinking about you. How are you doing today?`,
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
        toast({
          title: "Error",
          description: "Failed to load conversation history.",
          variant: "destructive",
        });
      }
    };

    loadConversation();
  }, [user, profile, toast]);

  const handleSendMessage = async (content: string) => {
    if (!user || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Save user message to database
    try {
      await saveMessage(conversationId, userMessage);
    } catch (error) {
      console.error("Error saving user message:", error);
    }

    // Update messages state with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Add typing delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Get user's name for personalization - prioritize profile name over email
      const userName = (profile?.name && profile.name.trim()) 
        ? profile.name.trim() 
        : undefined; // Don't use email name, let AI be more generic
      // Use updatedMessages instead of messages to ensure the user message is included
      const aiResponse = await sendChatMessage(updatedMessages, userName);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      // Save AI response to database
      try {
        await saveMessage(conversationId, assistantMessage);
      } catch (error) {
        console.error("Error saving AI message:", error);
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    
    try {
      // Create a new conversation, effectively clearing the chat
      const newConversation = await createConversation(user.id, 'New Chat');
      if (newConversation) {
        setConversationId(newConversation.id);
        // Authentic, girlfriend-like welcome message with user's name
        // Only use profile name if it exists and is not empty
        const userName = (profile?.name && profile.name.trim()) 
          ? profile.name.trim() 
          : (user.email?.split('@')[0] || 'there');
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: `Hey ${userName}! 😊 I was just thinking about you. How are you doing today?`,
            timestamp: new Date(),
          },
        ]);
        toast({
          title: "Conversation cleared",
          description: "Starting fresh in a new conversation!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear conversation history.",
        variant: "destructive",
      });
    }
  };

  const handleCloseFeedback = () => {
    setShowFeedbackPopup(false);
  };

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div 
      className="flex flex-col w-full bg-gradient-to-br from-background via-muted/30 to-background" 
      style={{ 
        height: 'calc(var(--vh, 1vh) * 100)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}
    >
      {/* Overlay Menu */}
      <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      
      {/* Ambient background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.1),transparent_50%)] pointer-events-none" />
      
      <header 
        className="flex items-center justify-between p-2 sm:p-4 border-b border-border/40 bg-card/70 backdrop-blur-xl flex-shrink-0" 
        style={{ zIndex: 50, position: 'relative' }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMenuOpen(true)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-secondary/80"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm border border-primary/10">
            <span className="text-base sm:text-xl">🌸</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-primary">Kiki</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleClearHistory}
            className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl transition-all"
          >
            Clear Chat
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <ChatWindow messages={messages} isLoading={isLoading} />
      </main>

      <footer 
        className="p-2.5 sm:p-3 border-t border-border/40 bg-card/60 backdrop-blur-xl flex-shrink-0" 
        style={{ zIndex: 50, position: 'relative' }}
      >
        <div className="max-w-4xl mx-auto">
          <InputBar onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </footer>
      
      {showFeedbackPopup && (
        <FeedbackPopup onClose={handleCloseFeedback} />
      )}
    </div>
  );
};

export default Index;
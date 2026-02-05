import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import OverlayMenu from "@/components/OverlayMenu";

const Feedback = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if user has already submitted feedback
    const hasSubmittedFeedback = localStorage.getItem(`feedback_submitted_${user?.id}`);
    if (hasSubmittedFeedback) {
      setShowThankYou(true);
    }
  }, [user]);

  const handleFeedbackSubmit = () => {
    // Mark feedback as submitted for this user
    if (user?.id) {
      localStorage.setItem(`feedback_submitted_${user.id}`, 'true');
    }
    setFeedbackSubmitted(true);
    setShowThankYou(true);
    
    toast({
      title: "Feedback received!",
      description: "Thank you for helping us improve Kiki.",
    });
  };

  const handleGoogleFormSubmit = () => {
    // This would be called when the Google Form is submitted
    // In a real implementation, you might use Google Forms API or a webhook
    handleFeedbackSubmit();
  };

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  if (showThankYou) {
    return (
      <div className="flex flex-col min-h-screen w-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
        {/* Overlay Menu */}
        <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        
        {/* Ambient background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.1),transparent_50%)] pointer-events-none" />
        
        <header className="relative flex items-center justify-between p-4 border-b border-border/40 bg-card/70 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-secondary/80"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm border border-primary/10">
              <span className="text-xl">🌸</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">Kiki</h1>
              <p className="text-xs text-muted-foreground">Your friendly companion</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Thank You!</CardTitle>
              <CardDescription className="mb-6">
                We really appreciate your feedback. It helps us make Kiki better for everyone.
              </CardDescription>
              <Button onClick={() => navigate("/")} className="w-full">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Overlay Menu */}
      <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      
      {/* Ambient background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.1),transparent_50%)] pointer-events-none" />
      
      <header className="relative flex items-center justify-between p-4 border-b border-border/40 bg-card/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary/80"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm border border-primary/10">
            <span className="text-xl">🌸</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">Kiki</h1>
            <p className="text-xs text-muted-foreground">Your friendly companion</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">We'd Love Your Feedback!</h1>
            <p className="text-muted-foreground">Help us improve your experience with Kiki</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share Your Experience</CardTitle>
                <CardDescription>
                  Your feedback helps us make Kiki better for everyone. It only takes a minute!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    We've created a short survey to gather your thoughts about Kiki. 
                    Your honest feedback is incredibly valuable to us.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      className="flex-1"
                      onClick={handleFeedbackSubmit}
                      asChild
                    >
                      <a 
                        href="https://docs.google.com/forms/d/e/1FAIpQLSc2WyTRDlFh9Ug6a_T3s5TFkQM-zfoERu6sWLsy4TdpWUKJ2Q/viewform?usp=header" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Take Survey
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate("/")}
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Your Feedback Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Helps us understand what you love about Kiki</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Identifies areas where we can improve</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Guides our development priorities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Ensures we're building features you actually want</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
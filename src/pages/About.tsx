import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import OverlayMenu from "@/components/OverlayMenu";

const About = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
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
            <h1 className="text-2xl font-bold">About Kiki</h1>
            <p className="text-muted-foreground">Your friendly AI companion</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Kiki is designed to be your friendly companion, always ready to listen and support you. 
                  We believe everyone deserves someone to talk to, whether you need advice, want to share 
                  your thoughts, or simply need a friend.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>24/7 availability - Kiki is always here when you need someone to talk to</li>
                  <li>Non-judgmental listening - Share your thoughts without fear of criticism</li>
                  <li>Emotional support - Kiki provides comfort during difficult times</li>
                  <li>Conversation history - Your conversations are saved for continuity</li>
                  <li>Privacy focused - Your conversations are private and never shared</li>
                  <li>Customizable interface - Personalize your chat experience</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Kiki uses advanced AI technology to understand and respond to your messages in a 
                  human-like manner. The system is designed to be empathetic, supportive, and helpful.
                </p>
                <p className="text-muted-foreground">
                  All conversations are stored locally on your device, ensuring your privacy is maintained. 
                  You can clear your chat history at any time with the "Clear Chat" button.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your privacy is our top priority. Kiki does not collect or store any personal information. 
                  All conversations are stored locally on your device and are never transmitted to any server. 
                  We use industry-standard security practices to ensure your data remains private.
                </p>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
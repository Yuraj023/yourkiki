import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import OverlayMenu from "@/components/OverlayMenu";

const Settings = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setTheme(parsedSettings.theme || "system");
      setNotifications(parsedSettings.notifications ?? true);
      setSoundEnabled(parsedSettings.soundEnabled ?? true);
      setFontSize(parsedSettings.fontSize || "medium");
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      theme,
      notifications,
      soundEnabled,
      fontSize,
    };
    localStorage.setItem("settings", JSON.stringify(settings));
    
    // Apply theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

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
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your chat experience</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select value={fontSize} onValueChange={(value: "small" | "medium" | "large") => setFontSize(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Font Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Enable notifications</Label>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound">Sound effects</Label>
                  <Switch
                    id="sound"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chat Preferences</CardTitle>
                <CardDescription>Customize your chat experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-save">Auto-save conversations</Label>
                  <Switch id="auto-save" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="typing-indicator">Show typing indicator</Label>
                  <Switch id="typing-indicator" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
              <Button onClick={saveSettings}>Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
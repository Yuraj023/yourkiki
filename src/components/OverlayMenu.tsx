import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface OverlayMenuProps {
  open: boolean;
  onClose: () => void;
}

const OverlayMenu = ({ open, onClose }: OverlayMenuProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { label: "Home", onClick: () => navigate("/") },
    { label: "Profile", onClick: () => navigate("/profile") },
    { label: "Settings", onClick: () => navigate("/settings") },
    { label: "About", onClick: () => navigate("/about") },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="left" 
        className="w-64 p-0 border-r border-border/40 bg-background"
      >
        <div className="flex flex-col h-full">
          <div className="border-b border-border/40">
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm border border-primary/10">
                <span className="text-xl">🌸</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary">Kiki</h1>
                <p className="text-xs text-muted-foreground">Your friendly companion</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Navigation
            </div>
            <nav className="space-y-1">
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start cursor-pointer"
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                >
                  <span className="mr-2 text-lg">🌸</span>
                  <span>{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
          
          <div className="border-t border-border/40 p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start cursor-pointer"
              onClick={() => {
                handleLogout();
                onClose();
              }}
            >
              <span className="mr-2 text-lg">🌸</span>
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OverlayMenu;
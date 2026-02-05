import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import EnhancedLogin from "./pages/EnhancedLogin";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Create a wrapper component to handle the initial redirect
const AppWrapper = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If user is not authenticated and not on auth-related pages, redirect to login
    if (!user && 
        location.pathname !== '/login' && 
        location.pathname !== '/reset-password' && 
        location.pathname !== '/enhanced-login') {
      window.location.href = '/login';
    }
  }, [user, location]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <SidebarProvider defaultOpen={false}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/enhanced-login" element={<EnhancedLogin />} />
          <Route path="/" element={<Index />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/feedback" element={<Feedback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
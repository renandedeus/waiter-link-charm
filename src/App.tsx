
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { useState } from "react";

// Mock authentication context (to be replaced with Supabase integration)
export const AuthContext = React.createContext({
  isAuthenticated: false,
  login: (email: string, password: string) => {},
  logout: () => {},
});

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock authentication (to be replaced with Supabase integration)
  const loginHandler = (email: string, password: string) => {
    // For demo purposes, simple validation
    if (email && password) {
      setIsAuthenticated(true);
    }
  };

  const logoutHandler = () => {
    setIsAuthenticated(false);
  };

  const authContextValue = {
    isAuthenticated,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authContextValue}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={!isAuthenticated ? <Index /> : <Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/r/:id" element={<Navigate to="/" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;

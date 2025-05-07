
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/auth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Google from "./pages/Google";
import PaymentGateway from "./pages/PaymentGateway";
import ReviewsManagement from "./pages/ReviewsManagement";
import UserSettings from "./pages/UserSettings";
import Waiters from "./pages/Waiters";
import Admin from "./pages/admin/Index";
import AdminLogin from "./pages/admin/Login";
import AdminRestaurants from "./pages/admin/Restaurants";
import AdminRestaurantDetail from "./pages/admin/RestaurantDetail";
import AdminExports from "./pages/admin/Exports";
import AdminSettings from "./pages/admin/Settings";
import AdminBackups from "./pages/admin/Backups";
import InternalFormPage from "./pages/InternalFormPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute: React.FC<{ 
  element: React.ReactNode;
  requiredAdmin?: boolean;
  redirectTo?: string;
}> = ({ 
  element, 
  requiredAdmin = false,
  redirectTo = '/' 
}) => {
  const { user, isAdmin, isLoading } = useAuth();
  
  // Show loading state if authentication is still being checked
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (requiredAdmin && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{element}</>;
};

// Admin protected route
const AdminRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  return <ProtectedRoute element={element} requiredAdmin={true} redirectTo="/admin/login" />;
};

// Client protected route
const ClientRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  return <ProtectedRoute element={element} redirectTo="/" />;
};

// Auth check for redirects based on auth state
const AuthRedirect: React.FC<{ 
  element: React.ReactNode;
  whenAuthenticated?: string;
  whenAdmin?: string;
}> = ({ 
  element, 
  whenAuthenticated,
  whenAdmin
}) => {
  const { user, isAdmin, isLoading } = useAuth();
  
  // Show loading state if authentication is still being checked
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }
  
  if (user && isAdmin && whenAdmin) {
    return <Navigate to={whenAdmin} replace />;
  }
  
  if (user && whenAuthenticated) {
    return <Navigate to={whenAuthenticated} replace />;
  }
  
  return <>{element}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<AuthRedirect element={<Index />} whenAuthenticated="/dashboard" whenAdmin="/admin" />} />
              <Route path="/r/:id" element={<Navigate to="/" />} />
              
              {/* Internal form route - directly accessible but not linked in navigation */}
              <Route path="/internal-form" element={<InternalFormPage />} />
              
              {/* Payment route - only accessible when logged in */}
              <Route path="/payment-gateway" element={<ProtectedRoute element={<PaymentGateway />} />} />
              
              {/* Client routes */}
              <Route path="/dashboard" element={<ClientRoute element={<Dashboard />} />} />
              <Route path="/waiters" element={<ClientRoute element={<Waiters />} />} />
              <Route path="/google" element={<ClientRoute element={<Google />} />} />
              <Route path="/reviews" element={<ClientRoute element={<ReviewsManagement />} />} />
              <Route path="/settings" element={<ClientRoute element={<UserSettings />} />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AuthRedirect element={<AdminLogin />} whenAdmin="/admin" />} />
              <Route path="/admin" element={<AdminRoute element={<Admin />} />} />
              <Route path="/admin/restaurants" element={<AdminRoute element={<AdminRestaurants />} />} />
              <Route path="/admin/restaurants/:id" element={<AdminRoute element={<AdminRestaurantDetail />} />} />
              <Route path="/admin/exports" element={<AdminRoute element={<AdminExports />} />} />
              <Route path="/admin/settings" element={<AdminRoute element={<AdminSettings />} />} />
              <Route path="/admin/backups" element={<AdminRoute element={<AdminBackups />} />} />
              
              {/* Not found route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import Dashboard from "./pages/Dashboard";
import ScanResults from "./pages/ScanResults";
import Authpage from "./pages/Authpage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/ui/Layout";
import FullScreenLayout from "./components/ui/FullScreenLayout";
import { ScanProvider } from "./context/ScanContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <ScanProvider>
    <Routes>
      {/* Landing Page - accessible to everyone */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth page - accessible to everyone */}
      <Route path="/auth" element={<Authpage />} />
      
      {/* Dashboard - accessible to everyone */}
      <Route path="/dashboard" element={<FullScreenLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
      
      {/* Scan Results - accessible to everyone */}
      <Route path="/scan-results/:scanId" element={<FullScreenLayout />}>
        <Route index element={<ScanResults />} />
      </Route>
      
      {/* Protected routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="profile" element={<div>Profile Page</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
      </Route>
      
      {/* 404 page */}
      <Route path="/404" element={<NotFound />} />
      
      {/* Catch all - redirect to landing page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </ScanProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="securescan-theme">
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
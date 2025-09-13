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

// Auth Route Component (redirects to dashboard if authenticated)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <ScanProvider>
    <Routes>
      {/* Landing Page - accessible to everyone */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth routes - redirects to dashboard if already authenticated */}
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <Authpage />
          </AuthRoute>
        }
      />

      {/* Dashboard - accessible to everyone (captcha for non-authenticated users) */}
      <Route path="/dashboard" element={<FullScreenLayout />}>
        <Route index element={<Dashboard />} />
      </Route>

      {/* Protected regular layout routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="scan-results/:scanId" element={<ScanResults />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Catch all - redirect to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
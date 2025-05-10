
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./common/context/AuthContext";
import { ThemeProvider } from "./common/context/ThemeContext";

// Pages
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

// Blog
import BlogPage from "./pages/blog/BlogPage";
import BlogPostPage from "./pages/blog/BlogPostPage";

// Templates
import TemplatesPage from "./pages/templates/TemplatesPage";
import TemplateDetailPage from "./pages/templates/TemplateDetailPage";

// Tools
import ToolsPage from "./pages/tools/ToolsPage";

// Auth
import AuthLayout from "./modules/auth/AuthLayout";
import LoginPage from "./modules/auth/LoginPage";
import RegisterPage from "./modules/auth/RegisterPage";

// Dashboard
import AdminLayout from "./common/layouts/AdminLayout";
import DashboardPage from "./modules/dashboard/DashboardPage";

// Membuat instansi QueryClient di luar komponen untuk menghindari re-render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 menit
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<LandingPage />} />
                
                {/* Blog Routes */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                
                {/* Templates Routes */}
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/templates/:id" element={<TemplateDetailPage />} />
                
                {/* Tools Routes */}
                <Route path="/tools" element={<ToolsPage />} />
                
                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                </Route>
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  {/* Add other dashboard routes here */}
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;


import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./common/context/AuthContext";
import { ThemeProvider } from "./common/context/ThemeContext";

// Layouts
import MainLayout from "./common/layouts/MainLayout";
import AdminLayout from "./common/layouts/AdminLayout";
import AuthLayout from "./modules/auth/AuthLayout";

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
import AIChatPage from "./pages/tools/AIChatPage";
import ImageOptimizerPage from "./pages/tools/ImageOptimizerPage";

// Auth
import LoginPage from "./modules/auth/LoginPage";
import RegisterPage from "./modules/auth/RegisterPage";

// Dashboard
import DashboardPage from "./modules/dashboard/DashboardPage";

// Membuat instansi QueryClient dengan konfigurasi yang benar
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
                {/* Root Redirect */}
                <Route path="/" element={<Index />} />
                
                {/* Main Layout Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route path="home" element={<LandingPage />} />
                  
                  {/* Blog Routes */}
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="blog/:slug" element={<BlogPostPage />} />
                  <Route path="blog/category/:categorySlug" element={<BlogPage />} />
                  
                  {/* Templates Routes */}
                  <Route path="templates" element={<TemplatesPage />} />
                  <Route path="templates/:id" element={<TemplateDetailPage />} />
                  <Route path="templates/category/:category" element={<TemplatesPage />} />
                  
                  {/* Tools Routes */}
                  <Route path="tools" element={<ToolsPage />} />
                  <Route path="tools/ai-chat" element={<AIChatPage />} />
                  <Route path="tools/image-optimizer" element={<ImageOptimizerPage />} />
                </Route>
                
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

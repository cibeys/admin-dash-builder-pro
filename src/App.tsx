
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
import BlogEditorPage from "./pages/blog/BlogEditorPage";

// Templates
import TemplatesPage from "./pages/templates/TemplatesPage";
import TemplateDetailPage from "./pages/templates/TemplateDetailPage";

// Tools
import ToolsPage from "./pages/tools/ToolsPage";
import AIChatPage from "./pages/tools/AIChatPage";
import ImageOptimizerPage from "./pages/tools/ImageOptimizerPage";
import TypingSpeedPage from "./pages/tools/TypingSpeedPage";
import CalculatorPage from "./pages/tools/CalculatorPage";
import WeatherPage from "./pages/tools/WeatherPage";
import TextToSpeechPage from "./pages/tools/TextToSpeechPage";
import VideoDownloaderPage from "./pages/tools/VideoDownloaderPage";
import CSSGeneratorsPage from "./pages/tools/CSSGeneratorsPage";

// Auth
import LoginPage from "./modules/auth/LoginPage";
import RegisterPage from "./modules/auth/RegisterPage";

// Dashboard
import DashboardPage from "./modules/dashboard/DashboardPage";

// Dashboard Blog Management
import BlogManagementPage from "./modules/dashboard/pages/BlogManagementPage";
import BlogEditPage from "./modules/dashboard/pages/BlogEditPage";

// Dashboard Template Management
import TemplateManagementPage from "./modules/dashboard/pages/TemplateManagementPage";
import TemplateEditPage from "./modules/dashboard/pages/TemplateEditPage";

// Dashboard Chat Admin
import ChatAdminPage from "./modules/dashboard/pages/ChatAdminPage";

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
                  <Route path="blog/editor/:slug?" element={<BlogEditorPage />} />
                  <Route path="blog/new" element={<BlogEditorPage />} />
                  
                  {/* Templates Routes */}
                  <Route path="templates" element={<TemplatesPage />} />
                  <Route path="templates/:id" element={<TemplateDetailPage />} />
                  <Route path="templates/category/:category" element={<TemplatesPage />} />
                  
                  {/* Tools Routes */}
                  <Route path="tools" element={<ToolsPage />} />
                  <Route path="tools/ai-chat" element={<AIChatPage />} />
                  <Route path="tools/image-optimizer" element={<ImageOptimizerPage />} />
                  <Route path="tools/typing-speed" element={<TypingSpeedPage />} />
                  <Route path="tools/calculator" element={<CalculatorPage />} />
                  <Route path="tools/weather" element={<WeatherPage />} />
                  <Route path="tools/text-to-speech" element={<TextToSpeechPage />} />
                  <Route path="tools/video-downloader" element={<VideoDownloaderPage />} />
                  <Route path="tools/css-generators" element={<CSSGeneratorsPage />} />
                </Route>
                
                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                </Route>
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  
                  {/* Blog Management Routes */}
                  <Route path="blog" element={<BlogManagementPage />} />
                  <Route path="blog/edit/:slug" element={<BlogEditPage />} />
                  <Route path="blog/new" element={<BlogEditPage />} />
                  
                  {/* Template Management Routes */}
                  <Route path="templates" element={<TemplateManagementPage />} />
                  <Route path="templates/edit/:id" element={<TemplateEditPage />} />
                  <Route path="templates/new" element={<TemplateEditPage />} />
                  
                  {/* Chat Admin Route */}
                  <Route path="chat" element={<ChatAdminPage />} />
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

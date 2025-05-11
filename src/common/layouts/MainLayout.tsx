
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MainSidebar } from './MainSidebar';
import { Breadcrumb } from '../components/Breadcrumb';
import { Toaster } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MainHeader } from '../components/Header';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  // Initialize sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-state');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'open');
    }
    setMounted(true);
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-state', sidebarOpen ? 'open' : 'closed');
    }
  }, [sidebarOpen, mounted]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <MainSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className={`flex flex-col flex-1 w-full transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        {/* Header */}
        <MainHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="container max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6" />

          {/* Main Content Area */}
          <ScrollArea className="flex-1 w-full">
            <AnimatePresence mode="wait">
              <motion.main
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.main>
            </AnimatePresence>
          </ScrollArea>
        </div>
        
        {/* Footer will be here */}
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout;

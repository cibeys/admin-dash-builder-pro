
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MainSidebar } from './MainSidebar';
import { Breadcrumb } from '../components/Breadcrumb';
import { Toaster } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <MainSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 overflow-auto",
          sidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        <ScrollArea className="h-screen w-full">
          <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Breadcrumb className="mb-6" />

            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout;

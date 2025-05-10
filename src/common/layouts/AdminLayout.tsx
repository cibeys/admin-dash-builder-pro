
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import ThemeCustomizer from '../../modules/settings/components/ThemeCustomizer';

const AdminLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onSettingsToggle={() => setCustomizerOpen(!customizerOpen)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary/30 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Theme Customizer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-background border-l border-border shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
          customizerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button 
            onClick={() => setCustomizerOpen(false)}
            className="p-2 rounded-full hover:bg-secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
          <ThemeCustomizer />
        </div>
      </div>

      {/* Settings Button */}
      <button 
        onClick={() => setCustomizerOpen(!customizerOpen)}
        className="fixed right-4 bottom-4 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform z-40"
        aria-label="Theme Settings"
      >
        <Settings size={24} />
      </button>
    </div>
  );
};

export default AdminLayout;

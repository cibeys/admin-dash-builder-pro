
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  onMenuToggle: () => void;
  onSettingsToggle: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuToggle, onSettingsToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate breadcrumb from location
  const getBreadcrumb = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const isLast = index === paths.length - 1;
      const formattedPath = path.charAt(0).toUpperCase() + path.slice(1);
      
      return (
        <React.Fragment key={path}>
          <span className={isLast ? "font-medium" : "text-muted-foreground"}>
            {formattedPath}
          </span>
          {!isLast && <span className="mx-2 text-muted-foreground">/</span>}
        </React.Fragment>
      );
    });
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="bg-background border-b border-border h-16">
      <div className="h-full flex items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuToggle}
            className="p-2 rounded-md hover:bg-secondary"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden md:flex">
            {getBreadcrumb()}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="flex items-center pl-3 pr-2 py-1.5 border border-input rounded-md bg-background text-muted-foreground">
              <Search size={16} className="mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none w-40 md:w-60"
              />
            </div>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-secondary relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-card text-card-foreground rounded-md shadow-lg border border-border z-50">
                <div className="p-3 border-b border-border">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border-b border-border hover:bg-secondary/50 cursor-pointer">
                      <p className="font-medium">New update available</p>
                      <p className="text-sm text-muted-foreground">Check out the latest features</p>
                      <p className="text-xs text-muted-foreground mt-1">10 min ago</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center">
                  <button className="text-sm text-primary">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button 
            onClick={onSettingsToggle}
            className="p-2 rounded-full hover:bg-secondary"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
          
          {/* User menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-secondary"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {user?.name?.[0] || 'U'}
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card text-card-foreground rounded-md shadow-lg border border-border z-50">
                <div className="p-3 border-b border-border">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                
                <div className="p-2">
                  <button 
                    className="flex items-center space-x-2 w-full p-2 rounded-md hover:bg-secondary text-left"
                    onClick={() => {
                      setShowUserMenu(false);
                    }}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  
                  <button 
                    className="flex items-center space-x-2 w-full p-2 rounded-md hover:bg-secondary text-left"
                    onClick={onSettingsToggle}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  
                  <button 
                    className="flex items-center space-x-2 w-full p-2 rounded-md hover:bg-destructive hover:text-destructive-foreground text-left mt-2"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

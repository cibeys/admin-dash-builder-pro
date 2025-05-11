
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  FileText,
  LayoutTemplate,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  PanelLeft,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active: boolean;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, to, active, collapsed }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center py-3 px-3 rounded-md transition-all",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground",
        collapsed ? "justify-center" : ""
      )}
    >
      <Icon size={20} />
      {!collapsed && <span className="ml-3">{label}</span>}
    </Link>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navItems = [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: Users, label: "Users", to: "/dashboard/users" },
    { icon: FileText, label: "Blog", to: "/dashboard/blog" },
    { icon: LayoutTemplate, label: "Templates", to: "/dashboard/templates" },
    { icon: Settings, label: "Settings", to: "/dashboard/settings" },
  ];
  
  const isActive = (path: string) => location.pathname === path || 
                                   location.pathname.startsWith(`${path}/`);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
      
      <aside 
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          open ? "w-64" : "w-0 md:w-20",
          "md:translate-x-0 transform",
          !open && "-translate-x-full md:translate-x-0",
          "overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-sidebar-primary">
                {open ? "TanoeLuis" : "TL"}
              </span>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={isActive(item.to)}
                collapsed={!open}
              />
            ))}
          </nav>
          
          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <div className={cn(
              "flex items-center",
              open ? "justify-between" : "justify-center"
            )}>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                  {user?.name?.[0] || 'U'}
                </div>
                
                {open && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
                    <p className="text-xs text-sidebar-foreground/70">{user?.role}</p>
                  </div>
                )}
              </div>
              
              {open && (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

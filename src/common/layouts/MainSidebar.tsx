
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/common/context/ThemeContext';
import { cn } from '@/lib/utils';
import { 
  Home, 
  LayoutTemplate, 
  FileText, 
  Download, 
  MessageSquareText,
  Calculator,
  Thermometer,
  Gauge,
  Text,
  Grid,
  ChevronDown, 
  Settings, 
  Moon, 
  Sun, 
  Monitor,
  ChevronRight,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active: boolean;
  collapsed: boolean;
  children?: {
    label: string;
    to: string;
  }[];
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, to, active, collapsed, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (children) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center w-full py-2.5 px-3 rounded-md transition-all",
            "hover:bg-primary/10",
            active ? "text-primary font-medium" : "text-foreground",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center">
            <Icon size={20} className={cn("flex-shrink-0", collapsed ? "" : "mr-3")} />
            {!collapsed && <span>{label}</span>}
          </div>
          {!collapsed && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} />
            </motion.div>
          )}
        </button>
        
        <AnimatePresence>
          {isOpen && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pl-10 pr-3 overflow-hidden"
            >
              {children.map((child, index) => (
                <Link
                  key={index}
                  to={child.to}
                  className="flex items-center text-sm py-2 hover:text-primary"
                >
                  <ChevronRight size={14} className="mr-2" />
                  {child.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={to}
            className={cn(
              "flex items-center py-2.5 px-3 rounded-md transition-all",
              "hover:bg-primary/10",
              active ? "text-primary font-medium" : "text-foreground",
              collapsed ? "justify-center" : ""
            )}
          >
            <Icon size={20} className={cn("flex-shrink-0", collapsed ? "" : "mr-3")} />
            {!collapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

interface MainSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ open, onToggle }) => {
  const location = useLocation();
  const { theme, updateThemeSetting } = useTheme();
  
  const isActive = (path: string) => location.pathname === path || 
                                   location.pathname.startsWith(`${path}/`);

  // Menu items
  const mainNavItems = [
    { icon: Home, label: "Beranda", to: "/home" },
    { 
      icon: FileText, 
      label: "Blog", 
      to: "/blog",
      children: [
        { label: "Semua Artikel", to: "/blog" },
        { label: "Web Development", to: "/blog/category/web-development" },
        { label: "UI/UX Design", to: "/blog/category/uiux-design" },
        { label: "AI & ML", to: "/blog/category/ai-ml" }
      ]
    },
    { 
      icon: LayoutTemplate, 
      label: "Templates", 
      to: "/templates",
      children: [
        { label: "Semua Template", to: "/templates" },
        { label: "Website", to: "/templates/category/website" },
        { label: "Dashboard", to: "/templates/category/dashboard" },
        { label: "Landing Page", to: "/templates/category/landing-page" }
      ]
    },
    { 
      icon: Download, 
      label: "Tools", 
      to: "/tools",
      children: [
        { label: "Downloader", to: "/tools" },
        { label: "Image Optimizer", to: "/tools/image-optimizer" },
        { label: "Kalkulator", to: "/tools/calculator" },
        { label: "Typing Speed", to: "/tools/typing-speed" },
        { label: "Cek Cuaca", to: "/tools/weather" },
        { label: "Text to Speech", to: "/tools/text-to-speech" },
        { label: "Flexbox Generator", to: "/tools/flexbox-generator" },
        { label: "Grid Generator", to: "/tools/grid-generator" },
        { label: "Random Name", to: "/tools/random-name" }
      ]
    },
    { icon: MessageSquareText, label: "AI Chat", to: "/tools/ai-chat" },
    { icon: Calculator, label: "Kalkulator", to: "/tools/calculator" },
    { icon: Gauge, label: "Typing Speed", to: "/tools/typing-speed" },
    { icon: Thermometer, label: "Cek Cuaca", to: "/tools/weather" },
    { icon: Text, label: "Text to Speech", to: "/tools/text-to-speech" },
    { icon: Grid, label: "CSS Generators", to: "/tools/css-generators" },
  ];

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
          "shadow-sm",
          open ? "w-64" : "w-0 md:w-20",
          "md:translate-x-0 transform",
          !open && "-translate-x-full md:translate-x-0",
          "overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <Link to="/" className="flex items-center">
              <span className={cn(
                "text-2xl font-bold text-primary transition-all duration-300",
                open ? "opacity-100" : "opacity-0 w-0"
              )}>
                TanoeLuis
              </span>
              <span className={cn(
                "text-2xl font-bold text-primary transition-all duration-300",
                !open ? "opacity-100 md:opacity-100" : "opacity-0 w-0"
              )}>
                TL
              </span>
            </Link>
            <button
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronRight size={18} className={open ? "rotate-180" : ""} />
            </button>
          </div>

          {/* Search bar */}
          {open && (
            <div className="px-3 py-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={isActive(item.to)}
                collapsed={!open}
                children={item.children}
              />
            ))}
          </nav>
          
          {/* Theme Switcher */}
          <div className="px-3 py-2 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-2",
                    !open && "justify-center px-2"
                  )}
                >
                  {theme.mode === 'dark' ? (
                    <Moon size={18} />
                  ) : theme.mode === 'system' ? (
                    <Monitor size={18} />
                  ) : (
                    <Sun size={18} />
                  )}
                  {open && <span>
                    {theme.mode === 'dark' ? 'Dark' : theme.mode === 'system' ? 'System' : 'Light'} Mode
                  </span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={() => updateThemeSetting('mode', 'light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateThemeSetting('mode', 'dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateThemeSetting('mode', 'system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  );
};

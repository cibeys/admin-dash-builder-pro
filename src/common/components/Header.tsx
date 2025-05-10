
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, Menu, User, Settings } from 'lucide-react';
import { useAuth } from '@/common/context/AuthContext';
import { Logo3D } from '@/components/ui/Canvas3D';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MainHeaderProps {
  onMenuToggle: () => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic will be implemented later
    console.log('Searching for:', searchTerm);
  };

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Left section with Logo and Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
          >
            <Menu />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Logo3D size={40} />
            </motion.div>
          </Link>
        </div>

        {/* Center section with Search */}
        <form 
          onSubmit={handleSearch} 
          className="hidden md:flex items-center max-w-md w-full relative"
        >
          <Input
            type="search"
            placeholder="Cari template, artikel, tools..."
            className="pl-10 pr-4 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </form>

        {/* Right section with actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={handleSearch}
          >
            <Search />
            <span className="sr-only">Search</span>
          </Button>
          
          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              <span className="sr-only">Notifications</span>
            </Button>
            
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-80 bg-card text-card-foreground rounded-xl shadow-lg border border-border z-50"
              >
                <div className="p-3 border-b border-border">
                  <h3 className="font-semibold">Notifikasi</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="p-3 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <p className="font-medium">Update terbaru tersedia</p>
                      <p className="text-sm text-muted-foreground">Lihat fitur baru yang telah ditambahkan</p>
                      <p className="text-xs text-muted-foreground mt-1">10 menit yang lalu</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center">
                  <Button variant="link" className="text-sm">Lihat semua notifikasi</Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* User section */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {user?.name?.[0] || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b border-border">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => logout()} 
                  className="text-destructive focus:text-destructive"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" asChild>
              <Link to="/auth/login">Masuk</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

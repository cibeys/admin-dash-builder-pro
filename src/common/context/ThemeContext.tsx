
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type MenuType = 'static' | 'overlay' | 'slim' | 'slim+';
export type Preset = 'aura' | 'lara' | 'nora';
export type LayoutTheme = 'color-scheme' | 'primary-color';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  surfaceColor: string;
  menuType: MenuType;
  preset: Preset;
  layoutTheme: LayoutTheme;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  updateThemeSetting: <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: '#00BFA6', // Default teal color
  surfaceColor: '#E8EAF6',
  menuType: 'slim',
  preset: 'aura',
  layoutTheme: 'color-scheme',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  updateThemeSetting: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  
  useEffect(() => {
    // Load theme from localStorage if it exists
    const savedTheme = localStorage.getItem('theme-config');
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme));
      } catch (e) {
        console.error('Failed to parse theme config', e);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    
    // Handle system preference for dark/light mode
    if (theme.mode === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      
      root.classList.remove('dark', 'light');
      root.classList.add(systemPreference);
    } else {
      root.classList.remove('dark', 'light');
      root.classList.add(theme.mode);
    }
    
    // Apply primary color as CSS variable
    root.style.setProperty('--primary', hexToHsl(theme.primaryColor));
    
    // Save to localStorage
    localStorage.setItem('theme-config', JSON.stringify(theme));
  }, [theme]);

  const updateThemeSetting = <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, updateThemeSetting }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility to convert hex color to HSL format for CSS variables
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

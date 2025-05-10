
import React from 'react';
import { useTheme, ThemeMode, MenuType, Preset, LayoutTheme } from '@/common/context/ThemeContext';

const colorOptions = [
  { name: 'Dark Blue', value: '#1E293B' },
  { name: 'Teal', value: '#00BFA6' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Lime', value: '#A3E635' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Pink', value: '#EC4899' },
];

const surfaceOptions = [
  { name: 'Teal', value: '#E6FFFA' },
  { name: 'Dark Gray', value: '#374151' },
  { name: 'Gray', value: '#4B5563' },
  { name: 'Medium Gray', value: '#6B7280' },
  { name: 'Light Gray', value: '#9CA3AF' },
  { name: 'Cool Gray', value: '#D1D5DB' },
  { name: 'Light Gray', value: '#E5E7EB' },
];

const ThemeCustomizer = () => {
  const { theme, updateThemeSetting } = useTheme();
  
  const handleModeChange = (mode: ThemeMode) => {
    updateThemeSetting('mode', mode);
  };

  const handleMenuTypeChange = (menuType: MenuType) => {
    updateThemeSetting('menuType', menuType);
  };

  const handlePresetChange = (preset: Preset) => {
    updateThemeSetting('preset', preset);
  };

  const handleLayoutThemeChange = (layoutTheme: LayoutTheme) => {
    updateThemeSetting('layoutTheme', layoutTheme);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Settings</h3>
      
      {/* Primary Color */}
      <section className="mb-6">
        <h4 className="text-lg font-medium mb-3">Primary</h4>
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => updateThemeSetting('primaryColor', color.value)}
              className={`w-10 h-10 rounded-full ${
                theme.primaryColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              style={{ backgroundColor: color.value }}
              aria-label={`Select ${color.name} color`}
            />
          ))}
        </div>
      </section>

      {/* Surface Color */}
      <section className="mb-6">
        <h4 className="text-lg font-medium mb-3">Surface</h4>
        <div className="grid grid-cols-5 gap-2">
          {surfaceOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => updateThemeSetting('surfaceColor', color.value)}
              className={`w-10 h-10 rounded-full ${
                theme.surfaceColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              style={{ backgroundColor: color.value }}
              aria-label={`Select ${color.name} surface color`}
            />
          ))}
        </div>
      </section>

      {/* Presets */}
      <section className="mb-6">
        <h4 className="text-lg font-medium mb-3">Presets</h4>
        <div className="grid grid-cols-3 gap-2">
          {(['aura', 'lara', 'nora'] as Preset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetChange(preset)}
              className={`py-2 px-4 rounded-md ${
                theme.preset === preset 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Color Scheme */}
      <section className="mb-6">
        <h4 className="text-lg font-medium mb-3">Color Scheme</h4>
        <div className="grid grid-cols-2 gap-2">
          {(['light', 'dark'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`py-2 px-4 rounded-md ${
                theme.mode === mode 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Menu Type */}
      <section className="mb-6">
        <h4 className="text-lg font-medium mb-3">Menu Type</h4>
        <div className="space-y-2">
          {(['static', 'overlay', 'slim', 'slim+'] as MenuType[]).map((type) => (
            <div key={type} className="flex items-center">
              <input
                type="radio"
                id={`menu-${type}`}
                name="menuType"
                checked={theme.menuType === type}
                onChange={() => handleMenuTypeChange(type)}
                className="w-4 h-4 text-primary border-border focus:ring-primary"
              />
              <label htmlFor={`menu-${type}`} className="ml-2 block text-sm">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Layout Theme */}
      <section className="mb-6">
        <h4 className="text-lg font-medium mb-3">Layout Theme</h4>
        <div className="space-y-2">
          {(['color-scheme', 'primary-color'] as LayoutTheme[]).map((layout) => (
            <div key={layout} className="flex items-center">
              <input
                type="radio"
                id={`layout-${layout}`}
                name="layoutTheme"
                checked={theme.layoutTheme === layout}
                onChange={() => handleLayoutThemeChange(layout)}
                className="w-4 h-4 text-primary border-border focus:ring-primary"
              />
              <label htmlFor={`layout-${layout}`} className="ml-2 block text-sm capitalize">
                {layout.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                {layout === 'primary-color' && ' (Light Only)'}
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ThemeCustomizer;

import React, { useState } from 'react';
import { Home, Swords, Wrench, Settings, Check, Palette, X } from 'lucide-react';
import { Theme } from '../types';

type NavTab = 'home' | 'calculate' | 'tools' | 'roadmap';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigate,
  currentTheme,
  onThemeChange,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const themes: { id: Theme; name: string; color: string }[] = [
    { id: 'purple', name: 'Original', color: '#a855f7' },
    { id: 'green', name: 'Matrix', color: '#10b981' },
    { id: 'blue', name: 'Ocean', color: '#3b82f6' },
  ];

  const navItems = [
    { id: 'home' as NavTab, label: 'Dashboard', icon: Home },
    { id: 'calculate' as NavTab, label: 'Battle', icon: Swords },
    { id: 'tools' as NavTab, label: 'Toolbox', icon: Wrench },
  ];

  return (
    <>
      {/* Settings Drawer Overlay */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setShowSettings(false)}
        />
      )}

      {/* Settings Drawer */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[70] md:hidden transition-transform duration-300 ease-out ${
          showSettings ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-[var(--bg-card)] border-t border-[var(--border)] rounded-t-3xl shadow-2xl p-6 pb-8">
          {/* Drawer Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-[var(--border)] rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-[var(--primary)]" />
              <h3 className="text-lg font-bold text-[var(--text-main)]">Theme Selection</h3>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Theme Options - Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  setShowSettings(false);
                }}
                className={`flex-shrink-0 flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all min-w-[100px] ${
                  currentTheme === theme.id
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border)] bg-[var(--bg-hover)] hover:border-[var(--text-muted)]'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-full shadow-lg relative"
                  style={{ backgroundColor: theme.color }}
                >
                  {currentTheme === theme.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  currentTheme === theme.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                }`}>
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--bg-card)]/95 backdrop-blur-xl border-t border-[var(--border)] shadow-2xl safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive 
                    ? 'text-[var(--primary)]' 
                    : 'text-[var(--text-muted)] active:text-[var(--text-main)]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-medium tracking-wide ${
                  isActive ? 'text-[var(--primary)]' : ''
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--primary)]" />
                )}
              </button>
            );
          })}

          {/* Settings Tab */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all text-[var(--text-muted)] active:text-[var(--text-main)]"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-wide">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
};

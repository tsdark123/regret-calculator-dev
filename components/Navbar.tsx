import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, Settings, ChevronDown, Check, Palette, Home, Calculator, Wrench, MapPin } from 'lucide-react';
import { Theme } from '../types';

interface NavbarProps {
    activeTab: 'home' | 'calculate' | 'tools' | 'roadmap';
    onNavigate: (tab: 'home' | 'calculate' | 'tools' | 'roadmap') => void;
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

const ThemeDropdownDesktop = ({ currentTheme, onThemeChange }: { currentTheme: Theme, onThemeChange: (t: Theme) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const themes: { id: Theme, name: string, color: string }[] = [
        { id: 'purple', name: 'Original', color: '#a855f7' },
        { id: 'green', name: 'Matrix', color: '#10b981' },
        { id: 'blue', name: 'Ocean', color: '#3b82f6' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-[var(--bg-card)]/80 backdrop-blur-md px-3 py-2 rounded-full border border-[var(--border)] shadow-lg hover:border-[var(--primary)] transition-all group"
            >
                <Settings className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden animate-fade-in-down py-1 z-50">
                    <div className="px-4 py-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border)] mb-1">
                        <Palette className="w-3 h-3" /> Theme
                    </div>
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                onThemeChange(t.id);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></div>
                                {t.name}
                            </div>
                            {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-[var(--primary)] group-hover:text-white" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ThemeDropdownMobile = ({ currentTheme, onThemeChange }: { currentTheme: Theme, onThemeChange: (t: Theme) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const themes: { id: Theme, name: string, color: string }[] = [
        { id: 'purple', name: 'Original', color: '#a855f7' },
        { id: 'green', name: 'Matrix', color: '#10b981' },
        { id: 'blue', name: 'Ocean', color: '#3b82f6' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-[var(--bg-card)]/80 backdrop-blur-md px-3 py-2 rounded-full border border-[var(--border)] shadow-lg hover:border-[var(--primary)] transition-all group"
            >
                <Settings className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden animate-fade-in-down py-2 z-50 flex flex-col items-center gap-1 px-2">
                    <Palette className="w-4 h-4 text-[var(--text-muted)] mb-1" />
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                onThemeChange(t.id);
                                setIsOpen(false);
                            }}
                            className="w-5 h-5 rounded-full transition-all hover:scale-110 relative"
                            style={{ backgroundColor: t.color }}
                            title={t.name}
                        >
                            {currentTheme === t.id && (
                                <div className="absolute inset-0 rounded-full border-2 border-white"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate, currentTheme, onThemeChange }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getButtonClass = (tabName: string) => {
      const baseClass = "px-4 py-1.5 text-xs font-medium rounded-full transition-colors";
      if (activeTab === tabName) {
          return `${baseClass} text-[var(--nav-active-text)] bg-[var(--nav-active-bg)]`;
      }
      return `${baseClass} text-[var(--text-muted)] hover:text-[var(--text-main)]`;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-0 md:px-6 py-4 select-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        {/* Desktop Left: Logo + Settings */}
        <div className="hidden md:flex items-center gap-3 z-20">
          <a 
            href="https://www.linkedin.com/in/sepehrz/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[var(--bg-card)]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[var(--border)] shadow-lg hover:border-[var(--primary)] transition-all"
          >
            <div className="w-6 h-6 bg-[var(--primary)] rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[var(--text-main)] text-sm tracking-tight">Sepehr Zunoubi</span>
          </a>
          <ThemeDropdownDesktop currentTheme={currentTheme} onThemeChange={onThemeChange} />
        </div>

        {/* Mobile: Combined black box with logo and nav */}
        <div className="flex md:hidden items-center justify-between w-full bg-black border-y border-black px-4 py-2.5 -mt-7 z-20">
          <a 
            href="https://www.linkedin.com/in/sepehrz/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 bg-[var(--primary)] rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[var(--text-main)] text-sm tracking-tight truncate max-w-[150px]">Sepehr Zunoubi</span>
          </a>

          {/* Mobile Nav Icons + Settings */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => onNavigate('home')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'home' ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-muted)]'}`}
            >
              <Home className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onNavigate('calculate')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'calculate' ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-muted)]'}`}
            >
              <Calculator className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onNavigate('tools')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'tools' ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-muted)]'}`}
            >
              <Wrench className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onNavigate('roadmap')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'roadmap' ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-muted)]'}`}
            >
              <MapPin className="w-5 h-5" />
            </button>
            <ThemeDropdownMobile currentTheme={currentTheme} onThemeChange={onThemeChange} />
          </div>
        </div>

        {/* Desktop Center: Links (Absolute Centered) */}
        <div className="hidden md:flex items-center gap-1 bg-[var(--bg-card)]/80 backdrop-blur-md px-2 py-1.5 rounded-full border border-[var(--border)] shadow-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button onClick={() => onNavigate('home')} className={getButtonClass('home')}>Home</button>
          <button onClick={() => onNavigate('calculate')} className={getButtonClass('calculate')}>Calculate</button>
          <button onClick={() => onNavigate('tools')} className={getButtonClass('tools')}>Tools</button>
          <button onClick={() => onNavigate('roadmap')} className={getButtonClass('roadmap')}>Roadmap</button>
        </div>

        {/* Desktop Right: Empty for balance */}
        <div className="hidden md:block w-1"></div>
      </div>
    </nav>
  );
};
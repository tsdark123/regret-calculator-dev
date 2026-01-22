import React, { useState, useRef, useEffect } from 'react';
import { Home, Calculator, Wrench, Map, Settings, ChevronDown, Check, Palette, X } from 'lucide-react';
import { Theme } from '../types';

interface MobileNavProps {
    activeTab: 'home' | 'calculate' | 'tools' | 'roadmap';
    onNavigate: (tab: 'home' | 'calculate' | 'tools' | 'roadmap') => void;
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
    activeTab, 
    onNavigate, 
    currentTheme, 
    onThemeChange 
}) => {
    const [showSettings, setShowSettings] = useState(false);

    const themes: { id: Theme, name: string, color: string }[] = [
        { id: 'purple', name: 'Original', color: '#a855f7' },
        { id: 'green', name: 'Matrix', color: '#10b981' },
        { id: 'blue', name: 'Ocean', color: '#3b82f6' },
    ];

    const navItems = [
        { id: 'home' as const, icon: Home, label: 'Home' },
        { id: 'calculate' as const, icon: Calculator, label: 'Calculate' },
        { id: 'tools' as const, icon: Wrench, label: 'Tools' },
        { id: 'roadmap' as const, icon: Map, label: 'Roadmap' },
    ];

    return (
        <>
            {/* Bottom Navigation Bar - Fixed at bottom for thumb-zone access */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                {/* Gradient fade effect at top */}
                <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-[var(--bg-main)] to-transparent pointer-events-none" />
                
                <div className="bg-[var(--bg-card)]/95 backdrop-blur-xl border-t border-[var(--border)] px-2 pb-safe">
                    <div className="flex items-center justify-around py-2">
                        {navItems.map((item) => {
                            const isActive = activeTab === item.id;
                            const Icon = item.icon;
                            
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id)}
                                    className={`flex flex-col items-center justify-center min-w-[60px] min-h-[48px] px-3 py-2 rounded-xl transition-all active:scale-95 ${
                                        isActive 
                                            ? 'bg-[var(--primary)]/15 text-[var(--primary)]' 
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'drop-shadow-[0_0_8px_var(--primary)]' : ''}`} />
                                    <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                        
                        {/* Settings Button */}
                        <button
                            onClick={() => setShowSettings(true)}
                            className="flex flex-col items-center justify-center min-w-[60px] min-h-[48px] px-3 py-2 rounded-xl transition-all active:scale-95 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        >
                            <Settings className="w-5 h-5 mb-0.5" />
                            <span className="text-[10px] font-medium">Settings</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                        onClick={() => setShowSettings(false)}
                    />
                    
                    {/* Modal Content - Slides up from bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border)] rounded-t-3xl p-6 pb-safe animate-slide-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[var(--text-main)]">Settings</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
                            >
                                <X className="w-5 h-5 text-[var(--text-muted)]" />
                            </button>
                        </div>
                        
                        {/* Theme Selection */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Palette className="w-4 h-4 text-[var(--text-muted)]" />
                                <span className="text-sm font-medium text-[var(--text-muted)]">Theme</span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                                {themes.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            onThemeChange(t.id);
                                            setShowSettings(false);
                                        }}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all min-h-[80px] ${
                                            currentTheme === t.id 
                                                ? 'border-[var(--primary)] bg-[var(--primary)]/10' 
                                                : 'border-[var(--border)] bg-[var(--bg-hover)]'
                                        }`}
                                    >
                                        <div 
                                            className="w-8 h-8 rounded-full mb-2 shadow-lg"
                                            style={{ backgroundColor: t.color }}
                                        />
                                        <span className={`text-xs font-medium ${
                                            currentTheme === t.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                                        }`}>
                                            {t.name}
                                        </span>
                                        {currentTheme === t.id && (
                                            <Check className="w-3 h-3 text-[var(--primary)] mt-1" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Link to LinkedIn */}
                        <a
                            href="https://www.linkedin.com/in/sepehrz/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center py-3 bg-[var(--bg-hover)] rounded-xl text-[var(--text-muted)] text-sm font-medium hover:text-[var(--text-main)] transition-colors"
                        >
                            Created by Sepehr Zunoubi
                        </a>
                    </div>
                </div>
            )}
        </>
    );
};

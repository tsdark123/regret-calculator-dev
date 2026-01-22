import React, { useEffect } from 'react';
import { Construction } from 'lucide-react';

export const MobileMaintenance: React.FC = () => {
    // Lock scrolling when this component is mounted
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-[var(--bg-main)] flex flex-col items-center justify-center px-8 overflow-hidden">
            {/* Subtle ambient glow */}
            <div 
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
            />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-sm animate-fade-in">
                {/* Icon Container - Rounded square with gradient styling */}
                <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-[var(--primary)]/20 to-transparent border border-[var(--primary)]/30 shadow-lg shadow-[var(--primary)]/10">
                    <Construction className="w-12 h-12 text-[var(--primary)]" />
                </div>
                
                {/* Main Heading */}
                <h1 className="text-3xl font-bold text-[var(--text-main)] mb-4">
                    Under Construction
                </h1>
                
                {/* Primary Subtext */}
                <p className="text-[var(--text-muted)] text-sm text-center mb-4 max-w-xs leading-relaxed">
                    Mobile support will be added in a future update.<br/>Stay tuned.
                </p>
                
                {/* Divider */}
                <div className="w-16 h-px bg-[var(--border)] mb-4" />
                
                {/* Secondary Explanation */}
                <p className="text-[var(--text-muted)]/70 text-xs text-center max-w-xs leading-relaxed mb-10">
                    We apologize that it isn't available right now. This view is temporarily 
                    under maintenance while we build a better experience.
                </p>
                
                {/* Status Badge with Pulsing Dot */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[var(--card-bg)] border border-[var(--border)]">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--text-muted)] uppercase">
                        Work in Progress
                    </span>
                </div>
            </div>
            
            {/* Footer */}
            <a
                href="https://www.linkedin.com/in/sepehrz/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-8 text-[var(--text-muted)]/50 text-xs hover:text-[var(--primary)] transition-colors"
            >
                Created by Sepehr Zunoubi
            </a>
        </div>
    );
};

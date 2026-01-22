import React from 'react';
import { Wrench } from 'lucide-react';

export const MobileMaintenance: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-[var(--bg-main)] flex flex-col items-center justify-center px-8 animate-fade-in">
            {/* Subtle ambient glow */}
            <div 
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
            />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                {/* Icon */}
                <div className="mb-8 p-5 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                    <Wrench className="w-10 h-10 text-[var(--primary)]" />
                </div>
                
                {/* Heading */}
                <h1 className="text-2xl font-bold text-[var(--text-main)] mb-3">
                    Coming Soon
                </h1>
                
                {/* Subtext */}
                <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">
                    Mobile experience is under construction
                </p>
                
                {/* Divider */}
                <div className="w-12 h-px bg-[var(--border)] mb-6" />
                
                {/* Encouragement */}
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                    For the best experience, please visit on a desktop computer
                </p>
            </div>
            
            {/* Footer */}
            <a
                href="https://www.linkedin.com/in/sepehrz/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-8 text-[var(--text-muted)] text-xs hover:text-[var(--primary)] transition-colors"
            >
                Created by Sepehr Zunoubi
            </a>
        </div>
    );
};

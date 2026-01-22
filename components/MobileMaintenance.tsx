
import React, { useEffect } from 'react';
import { Hammer, Wrench } from 'lucide-react';

export const MobileMaintenance: React.FC = () => {
  useEffect(() => {
    // Strictly lock scroll on mount
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Prevent default touch behavior to stop rubber-banding on iOS
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0c0d10] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden overscroll-none touch-none">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#a855f7] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      {/* Icon Group */}
      <div className="mb-12 relative animate-float">
        <div className="w-28 h-28 bg-[#121214] rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/5 relative z-10 overflow-hidden backdrop-blur-sm">
            {/* Inner subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent"></div>
            
            <div className="relative w-full h-full opacity-90">
                 <Wrench className="w-9 h-9 text-[#a855f7] absolute top-6 left-7 -scale-x-100 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                 <Hammer className="w-9 h-9 text-[#3b82f6] absolute bottom-6 right-7 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            </div>
        </div>
        {/* Glow behind box */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#a855f7] opacity-20 blur-[50px] -z-10 rounded-full"></div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-4 tracking-tight animate-fade-in-up drop-shadow-md">Under Construction</h1>
      
      <p className="text-[#94a3b8] text-sm mb-12 leading-relaxed max-w-[280px] animate-fade-in-up delay-100 font-medium tracking-wide">
        Mobile support will be added in a future update. <br/> Stay tuned.
      </p>

      <p className="text-[#52525b] text-[10px] max-w-[260px] mx-auto mb-20 leading-relaxed font-medium animate-fade-in-up delay-200">
        We apologize that it isn't something right now. This view is temporarily under maintenance while we build a better experience.
      </p>

      {/* Badge */}
      <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#121214] rounded-full border border-white/5 shadow-xl animate-fade-in-up delay-300">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse"></div>
        <span className="text-[10px] font-bold text-[#71717a] tracking-[0.2em] font-mono">WORK IN PROGRESS</span>
      </div>
    </div>
  );
};

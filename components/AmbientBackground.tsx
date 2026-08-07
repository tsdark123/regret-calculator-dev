import React from 'react';

// A small decorative line chart SVG
const MiniChart1 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 50" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M0 40 Q 20 45, 40 20 T 80 30 T 100 10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M0 40 L 100 40" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
    <circle cx="100" cy="10" r="3" fill="currentColor" />
  </svg>
);

// A small decorative bar chart SVG
const MiniChart2 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 50" className={className} fill="currentColor">
    <rect x="10" y="20" width="10" height="30" rx="2" opacity="0.4" />
    <rect x="30" y="10" width="10" height="40" rx="2" opacity="0.6" />
    <rect x="50" y="25" width="10" height="25" rx="2" opacity="0.3" />
    <rect x="70" y="5" width="10" height="45" rx="2" opacity="0.8" />
  </svg>
);

// Abstract donut chart
const MiniChart3 = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 50 50" className={className} fill="none" stroke="currentColor" strokeWidth="8">
        <circle cx="25" cy="25" r="15" strokeOpacity="0.2" />
        <path d="M25 10 A 15 15 0 0 1 40 25" strokeLinecap="round" />
    </svg>
);

export const AmbientBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* 1. Floating Chart Top Left - Desktop only */}
      <div className="hidden md:block absolute top-[5vh] left-[5%] w-64 h-32 text-purple-500/10 rotate-[-8deg] animate-float">
         <MiniChart1 className="w-full h-full" />
      </div>

      {/* 2. Floating Bar Chart Right - Desktop only */}
      <div className="hidden md:block absolute top-[25vh] right-[2%] w-48 h-48 text-slate-700/20 animate-float-delayed">
         <MiniChart2 className="w-full h-full" />
      </div>
      
      {/* 3. Center Abstract Donut - Desktop only */}
      <div className="hidden md:block absolute top-[70vh] left-[10%] w-24 h-24 text-slate-600/10 animate-spin-slow duration-[20s] z-20 pointer-events-none">
          <MiniChart3 className="w-full h-full" />
      </div>

      {/* 4. Deep Background Ticker Lines - Desktop only */}
      <div className="hidden md:block absolute top-[15vh] left-0 right-0 w-[100vw] h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" style={{ marginLeft: 'calc(-50vw + 50%)' }} />
      <div className="hidden md:block absolute top-[85vh] left-0 right-0 w-[100vw] h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" style={{ marginLeft: 'calc(-50vw + 50%)' }} />
      
      {/* 5. Random Particles - Desktop only */}
      <div className="hidden md:block absolute top-[20vh] left-[40%] w-1.5 h-1.5 bg-purple-500 rounded-full blur-[1px] opacity-30 animate-pulse" />
      <div className="hidden md:block absolute top-[55vh] right-[30%] w-2 h-2 bg-blue-500 rounded-full blur-[2px] opacity-20 animate-float" />
    </div>
  );
};
import React from 'react';

export const BackgroundGraph: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-15">
      <svg
        className="w-full h-full opacity-30"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0 }} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Animated Path 1 with Looping - Now spans full width */}
        <path
          d="M-10,75 C20,68 40,82 60,56 S85,62 110,25"
          stroke="url(#grad1)"
          strokeWidth="0.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
          className="animate-draw-loop"
        />

        {/* Faint Echo Path */}
        <path
          d="M-10,78 C20,71 40,85 60,59 S85,65 110,28"
          stroke="#a855f7"
          strokeWidth="0.2"
          strokeOpacity="0.2"
          fill="none"
          className="animate-pulse-slow"
        />
      </svg>
      
      {/* Floating Particles/Dots */}
      <div className="absolute top-[30%] left-[20%] w-2 h-2 bg-purple-500 rounded-full blur-[2px] animate-float opacity-40"></div>
      <div className="absolute top-[60%] left-[70%] w-3 h-3 bg-blue-500 rounded-full blur-[3px] animate-float-delayed opacity-30"></div>
      <div className="absolute top-[40%] right-[15%] w-1.5 h-1.5 bg-white rounded-full blur-[1px] animate-pulse opacity-50"></div>
    </div>
  );
};
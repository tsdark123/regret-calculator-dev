import React from 'react';

export const BackgroundGraph: React.FC = () => {
  return (
    <div className="hidden md:block fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none" style={{ zIndex: -15 }}>
      <svg
        className="w-full h-full opacity-30"
        viewBox="0 0 1920 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0 }} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Animated Path 1 with Looping - Spans full viewport width */}
        <path
          d="M-100,600 C300,550 600,650 960,450 S1400,500 2020,200"
          stroke="url(#grad1)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
          className="animate-draw-loop"
        />

        {/* Faint Echo Path */}
        <path
          d="M-100,620 C300,570 600,670 960,470 S1400,520 2020,220"
          stroke="#a855f7"
          strokeWidth="1.5"
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
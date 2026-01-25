import React from 'react';
import { motion } from 'framer-motion';

// Ocean theme: Bioluminescent flow with slow-moving gradients + caustic noise
export const OceanBackground: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {/* Bioluminescent gradient orbs */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
        animate={{
          x: ['-10%', '60%', '20%', '-10%'],
          y: ['10%', '40%', '70%', '10%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
          willChange: 'transform',
        }}
        animate={{
          x: ['80%', '30%', '70%', '80%'],
          y: ['60%', '20%', '50%', '60%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
        animate={{
          x: ['40%', '10%', '50%', '40%'],
          y: ['80%', '30%', '10%', '80%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[180px] h-[180px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          filter: 'blur(45px)',
          willChange: 'transform',
        }}
        animate={{
          x: ['20%', '70%', '40%', '20%'],
          y: ['30%', '60%', '20%', '30%'],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Water surface caustic effect - SVG animated pattern */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        style={{ mixBlendMode: 'soft-light' }}
      >
        <defs>
          <filter id="caustic">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="3"
              seed="5"
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                dur="20s"
                values="0.015;0.025;0.015"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#oceanGradient)" 
          filter="url(#caustic)"
        />
        <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </svg>

      {/* Subtle wave texture overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'turbulence\' baseFrequency=\'0.02\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          opacity: 0.025,
          mixBlendMode: 'overlay',
          willChange: 'transform',
        }}
      />
    </div>
  );
};

export default OceanBackground;

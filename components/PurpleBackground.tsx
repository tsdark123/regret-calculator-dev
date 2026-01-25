import React from 'react';
import { motion } from 'framer-motion';

// Purple theme: Cosmic/nebula effect with floating orbs and stardust
export const PurpleBackground: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {/* Nebula gradient orbs */}
      <motion.div
        className="absolute w-[280px] h-[280px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
          willChange: 'transform',
        }}
        animate={{
          x: ['5%', '50%', '25%', '5%'],
          y: ['15%', '35%', '65%', '15%'],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-[220px] h-[220px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
          filter: 'blur(45px)',
          willChange: 'transform',
        }}
        animate={{
          x: ['70%', '35%', '60%', '70%'],
          y: ['55%', '25%', '45%', '55%'],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(192, 132, 252, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
        animate={{
          x: ['30%', '15%', '55%', '30%'],
          y: ['75%', '40%', '15%', '75%'],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[160px] h-[160px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
          filter: 'blur(35px)',
          willChange: 'transform',
        }}
        animate={{
          x: ['55%', '80%', '40%', '55%'],
          y: ['20%', '50%', '30%', '20%'],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Stardust particles effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.15 + Math.random() * 0.15,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Subtle cosmic noise texture */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          opacity: 0.025,
          mixBlendMode: 'overlay',
          willChange: 'transform',
        }}
      />

      {/* Top ambient glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)',
          willChange: 'transform',
        }}
      />
    </div>
  );
};

export default PurpleBackground;

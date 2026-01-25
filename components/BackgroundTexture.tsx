import React from 'react';

// Global background texture wrapper
// Applies a fixed, pointer-events-none noise overlay at 2-4% opacity
// Uses mix-blend-mode: overlay to interact with theme colors
export const BackgroundTexture: React.FC = () => {
  return (
    <div 
      className="md:hidden fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {/* Primary noise texture */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Secondary subtle grain for depth */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='15' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          opacity: 0.02,
          mixBlendMode: 'soft-light',
        }}
      />
    </div>
  );
};

export default BackgroundTexture;

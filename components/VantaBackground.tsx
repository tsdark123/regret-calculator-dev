import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Vanta needs to be loaded dynamically
declare global {
  interface Window {
    VANTA?: {
      DOTS: (config: any) => { destroy: () => void };
    };
  }
}

interface VantaBackgroundProps {
  theme: 'purple' | 'green' | 'blue';
  className?: string;
}

// Theme color mapping
const getThemeColors = (theme: 'purple' | 'green' | 'blue') => {
  switch (theme) {
    case 'green':
      return {
        color: 0x10b981,  // Emerald 500
        color2: 0x059669, // Emerald 600
        backgroundColor: 0x0c0d10,
      };
    case 'blue':
      return {
        color: 0x2563eb,  // Blue 600
        color2: 0x1d4ed8, // Blue 700
        backgroundColor: 0xf0f9ff, // Light blue bg
      };
    case 'purple':
    default:
      return {
        color: 0xa855f7,  // Purple 500
        color2: 0x9333ea, // Purple 600
        backgroundColor: 0x0c0d10,
      };
  }
};

export const VantaBackground: React.FC<VantaBackgroundProps> = ({ theme, className = '' }) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy: () => void } | null>(null);
  const [vantaLoaded, setVantaLoaded] = useState(false);

  // Load Vanta script dynamically
  useEffect(() => {
    if (window.VANTA) {
      setVantaLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.dots.min.js';
    script.async = true;
    script.onload = () => setVantaLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount if needed
    };
  }, []);

  // Initialize/update Vanta effect
  useEffect(() => {
    if (!vantaLoaded || !vantaRef.current || !window.VANTA) return;

    // Destroy previous effect if exists
    if (vantaEffect.current) {
      vantaEffect.current.destroy();
    }

    const colors = getThemeColors(theme);

    // Make THREE available globally for Vanta
    (window as any).THREE = THREE;

    vantaEffect.current = window.VANTA.DOTS({
      el: vantaRef.current,
      THREE: THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: colors.color,
      color2: colors.color2,
      backgroundColor: colors.backgroundColor,
      size: 2.5,
      spacing: 25,
      showLines: false,
    });

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, [vantaLoaded, theme]);

  return (
    <div 
      ref={vantaRef} 
      className={`absolute inset-0 -z-10 opacity-40 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

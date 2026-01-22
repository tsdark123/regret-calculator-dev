import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import DOTS from 'vanta/dist/vanta.dots.min';

interface VantaBackgroundProps {
  theme: 'purple' | 'green' | 'blue';
  className?: string;
}

// Theme color mapping
const getThemeColors = (theme: 'purple' | 'green' | 'blue') => {
  switch (theme) {
    case 'green':
      return {
        color: 0x10b981,
        color2: 0x059669,
        backgroundColor: 0x0c0d10,
      };
    case 'blue':
      return {
        color: 0x2563eb,
        color2: 0x1d4ed8,
        backgroundColor: 0xf0f9ff,
      };
    case 'purple':
    default:
      return {
        color: 0xa855f7,
        color2: 0x9333ea,
        backgroundColor: 0x0c0d10,
      };
  }
};

export const VantaBackground: React.FC<VantaBackgroundProps> = ({ theme, className = '' }) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!vantaRef.current) return;

    // Cleanup previous effect before creating new one
    if (vantaEffect) {
      vantaEffect.destroy();
    }

    const colors = getThemeColors(theme);

    // Initialize Vanta with THREE passed directly
    const effect = DOTS({
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

    setVantaEffect(effect);

    // Cleanup on unmount
    return () => {
      if (effect) {
        effect.destroy();
      }
    };
  }, [theme]);

  return (
    <div 
      ref={vantaRef} 
      className={`absolute inset-0 -z-10 opacity-40 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

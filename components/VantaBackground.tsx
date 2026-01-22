import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import DOTS from 'vanta/dist/vanta.dots.min';

interface VantaBackgroundProps {
  theme: 'purple' | 'green' | 'blue';
  className?: string;
}

// Theme color mapping - using bright, visible colors
const getThemeColors = (theme: 'purple' | 'green' | 'blue') => {
  switch (theme) {
    case 'green':
      return {
        color: 0x10b981,
        color2: 0x059669,
        backgroundColor: 0x1a1a1a,
      };
    case 'blue':
      return {
        color: 0x3498db,
        color2: 0x2980b9,
        backgroundColor: 0x1a1a1a,
      };
    case 'purple':
    default:
      return {
        color: 0x9b59b6,
        color2: 0x8e44ad,
        backgroundColor: 0x1a1a1a,
      };
  }
};

export const VantaBackground: React.FC<VantaBackgroundProps> = ({ theme, className = '' }) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    if (!vantaRef.current) return;

    // Safely cleanup previous effect before creating new one
    if (vantaEffect.current) {
      try {
        vantaEffect.current.destroy();
      } catch (e) {
        // Ignore cleanup errors - expected in React 19 Strict Mode
      }
      vantaEffect.current = null;
    }

    const colors = getThemeColors(theme);

    try {
      // Initialize Vanta with THREE passed explicitly
      vantaEffect.current = DOTS({
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
    } catch (error) {
      console.warn('Failed to initialize Vanta:', error);
    }

    // Cleanup on unmount - wrapped in try-catch for React 19 Strict Mode
    return () => {
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (e) {
          // Ignore removeChild errors from React 19 double-mount cleanup
        }
        vantaEffect.current = null;
      }
    };
  }, [theme]);

  return (
    <div 
      ref={vantaRef} 
      className={className}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
};

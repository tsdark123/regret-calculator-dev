import React, { useEffect, useRef, useState } from 'react';

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

// Load script dynamically
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export const VantaBackground: React.FC<VantaBackgroundProps> = ({ theme, className = '' }) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Three.js and Vanta scripts
  useEffect(() => {
    const loadVanta = async () => {
      try {
        // Load Three.js first
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        // Then load Vanta
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.dots.min.js');
        setIsLoaded(true);
      } catch (error) {
        console.warn('Failed to load Vanta scripts:', error);
      }
    };

    loadVanta();
  }, []);

  // Initialize/update Vanta effect when loaded or theme changes
  useEffect(() => {
    if (!isLoaded || !vantaRef.current) return;

    const VANTA = (window as any).VANTA;
    if (!VANTA?.DOTS) return;

    // Destroy previous effect
    if (vantaEffect.current) {
      vantaEffect.current.destroy();
    }

    const colors = getThemeColors(theme);

    vantaEffect.current = VANTA.DOTS({
      el: vantaRef.current,
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
  }, [isLoaded, theme]);

  return (
    <div 
      ref={vantaRef} 
      className={`absolute inset-0 -z-10 opacity-40 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

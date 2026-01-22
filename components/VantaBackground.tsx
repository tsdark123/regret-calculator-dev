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

// Safely load script with error boundary
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    } catch (err) {
      reject(err);
    }
  });
};

export const VantaBackground: React.FC<VantaBackgroundProps> = ({ theme, className = '' }) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Load scripts on mount
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.dots.min.js');
        
        if (isMounted) {
          setIsReady(true);
        }
      } catch (error) {
        console.warn('Vanta background unavailable:', error);
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Vanta when ready
  useEffect(() => {
    if (!isReady || hasError || !vantaRef.current) return;

    try {
      const VANTA = (window as any).VANTA;
      if (!VANTA?.DOTS) {
        console.warn('VANTA.DOTS not available');
        return;
      }

      // Cleanup previous
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
    } catch (error) {
      console.warn('Failed to initialize Vanta:', error);
      setHasError(true);
    }

    return () => {
      try {
        if (vantaEffect.current) {
          vantaEffect.current.destroy();
          vantaEffect.current = null;
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [isReady, hasError, theme]);

  // Don't render anything if there's an error
  if (hasError) {
    return null;
  }

  return (
    <div 
      ref={vantaRef} 
      className={`absolute inset-0 -z-10 opacity-40 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

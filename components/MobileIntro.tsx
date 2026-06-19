import React, { useState, useEffect } from 'react';
import { SpiralAnimation } from './ui/spiral-animation';

interface MobileIntroProps {
  onComplete: () => void;
}

export const MobileIntro: React.FC<MobileIntroProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 6600); // Auto-fade after 6.6s

    return () => {
      clearTimeout(t1);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 w-full h-full overflow-hidden bg-[#0a0a0f] z-[100] transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Spiral Animation Background */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>
    </div>
  );
};

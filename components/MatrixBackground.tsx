import React, { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

// Matrix theme: Vertical stream effect with green hex characters
export const MatrixBackground: React.FC = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      fpsLimit: 60,
      particles: {
        number: {
          value: 50,
          density: {
            enable: true,
            width: 400,
            height: 800,
          },
        },
        color: {
          value: ['#00ff00', '#00cc00', '#009900', '#22ff22'],
        },
        shape: {
          type: 'char',
          options: {
            char: {
              value: ['0', '1', 'A', 'B', 'C', 'D', 'E', 'F', '零', '一', '二', '三', '四', '五'],
              font: 'monospace',
              weight: '400',
            },
          },
        },
        opacity: {
          value: { min: 0.02, max: 0.08 },
          animation: {
            enable: true,
            speed: 0.5,
            sync: false,
          },
        },
        size: {
          value: { min: 8, max: 16 },
        },
        move: {
          enable: true,
          speed: { min: 1, max: 3 },
          direction: 'bottom',
          straight: true,
          outModes: {
            default: 'out',
            top: 'out',
            bottom: 'out',
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <div 
      className="md:hidden fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    >
      {/* Matrix particles layer */}
      <Particles
        id="matrix-particles"
        options={options}
        className="w-full h-full"
      />
      
      {/* Digital grain overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          opacity: 0.04,
          mixBlendMode: 'overlay',
          willChange: 'transform',
        }}
      />
      
      {/* Green ambient glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 0, 0.03) 0%, transparent 60%)',
          willChange: 'transform',
        }}
      />
    </div>
  );
};

export default MatrixBackground;

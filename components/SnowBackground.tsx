import React, { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { Theme } from "../types";

interface SnowBackgroundProps {
  theme: Theme;
}

export const SnowBackground = React.memo(function SnowBackground({ theme }: SnowBackgroundProps) {
  const [init, setInit] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    }).catch((error) => {
      console.error("SnowBackground: Failed to initialize particles engine", error);
    });
  }, []);

  const particleColor = useMemo(() => {
    if (theme === "blue") {
      return "#94a3b8";
    }
    return "#ffffff";
  }, [theme]);

  const particleOpacity = useMemo(() => {
    if (theme === "blue") {
      return { min: 0.1, max: 0.2 };
    }
    return { min: 0.1, max: 0.4 };
  }, [theme]);

  const particleSize = useMemo(() => {
    if (isMobile) {
      return { min: 1.7, max: 3 };
    }
    return { min: 0.5, max: 1.5 };
  }, [isMobile]);

  const options: ISourceOptions = useMemo(
    () => ({
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
          },
        },
        color: {
          value: particleColor,
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: particleOpacity,
        },
        size: {
          value: particleSize,
        },
        shadow: {
          enable: true,
          color: particleColor,
          blur: 5,
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: "bottom",
          random: false,
          straight: false,
          outModes: {
            default: "out",
            bottom: "out",
            top: "out",
          },
          wobble: {
            enable: true,
            distance: 15,
            speed: 1,
          },
        },
      },
      interactivity: {
        events: {
          onClick: {
            enable: false,
          },
          onHover: {
            enable: false,
          },
        },
      },
    }),
    [particleColor, particleOpacity, particleSize]
  );

  if (!init) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ 
        zIndex: 1,
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      <Particles 
        id="snow-particles" 
        options={options}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
});

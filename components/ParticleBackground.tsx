import React, { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine, ISourceOptions } from '@tsparticles/engine';

interface ParticleBackgroundProps {
    theme?: 'purple' | 'green' | 'blue';
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ theme = 'purple' }) => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    // Neutral purple that works across themes
    const particleColor = theme === 'green' 
        ? 'rgba(74, 222, 128, 0.4)' 
        : theme === 'blue' 
            ? 'rgba(96, 165, 250, 0.4)' 
            : 'rgba(168, 85, 247, 0.4)';
    
    const linkColor = theme === 'green' 
        ? 'rgba(74, 222, 128, 0.15)' 
        : theme === 'blue' 
            ? 'rgba(96, 165, 250, 0.15)' 
            : 'rgba(168, 85, 247, 0.15)';

    const options: ISourceOptions = {
        fullScreen: false,
        background: {
            color: {
                value: 'transparent',
            },
        },
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: 'repulse',
                },
                resize: {
                    enable: true,
                },
            },
            modes: {
                repulse: {
                    distance: 100,
                    duration: 0.4,
                    speed: 0.5,
                },
            },
        },
        particles: {
            color: {
                value: particleColor,
            },
            links: {
                color: linkColor,
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
            },
            move: {
                direction: 'none',
                enable: true,
                outModes: {
                    default: 'bounce',
                },
                random: true,
                speed: 0.8,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    height: 800,
                    width: 800,
                },
                value: 60,
            },
            opacity: {
                value: {
                    min: 0.3,
                    max: 0.7,
                },
                animation: {
                    enable: true,
                    speed: 0.5,
                    sync: false,
                },
            },
            shape: {
                type: 'circle',
            },
            size: {
                value: {
                    min: 1,
                    max: 3,
                },
            },
        },
        detectRetina: true,
    };

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={options}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
            }}
        />
    );
};

import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
}

interface ParticleBackgroundProps {
    theme?: 'purple' | 'green' | 'blue';
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ theme = 'purple' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number>();

    const getColors = useCallback(() => {
        switch (theme) {
            case 'green':
                return { particle: 'rgba(74, 222, 128, 0.5)', link: 'rgba(74, 222, 128, 0.12)' };
            case 'blue':
                return { particle: 'rgba(96, 165, 250, 0.5)', link: 'rgba(96, 165, 250, 0.12)' };
            default:
                return { particle: 'rgba(168, 85, 247, 0.5)', link: 'rgba(168, 85, 247, 0.12)' };
        }
    }, [theme]);

    const initParticles = useCallback((width: number, height: number) => {
        const particleCount = Math.floor((width * height) / 15000);
        const particles: Particle[] = [];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.4 + 0.3,
            });
        }
        
        particlesRef.current = particles;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.offsetWidth;
                canvas.height = parent.offsetHeight;
                initParticles(canvas.width, canvas.height);
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        const colors = getColors();
        const linkDistance = 120;
        const repulseDistance = 150;
        const repulseStrength = 8;
        const spazDistance = 80;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particlesRef.current;

            // Update and draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Mouse interaction
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < spazDistance && dist > 0) {
                    // Intense "spaz out" effect when very close
                    const spazIntensity = (spazDistance - dist) / spazDistance;
                    p.vx += (Math.random() - 0.5) * spazIntensity * 4;
                    p.vy += (Math.random() - 0.5) * spazIntensity * 4;
                    // Also push away
                    p.vx += (dx / dist) * spazIntensity * repulseStrength * 0.1;
                    p.vy += (dy / dist) * spazIntensity * repulseStrength * 0.1;
                    // Temporarily increase opacity for visual feedback
                    p.opacity = Math.min(1, p.opacity + spazIntensity * 0.3);
                } else if (dist < repulseDistance && dist > 0) {
                    // Gentler repulsion in outer ring
                    const force = (repulseDistance - dist) / repulseDistance;
                    p.vx += (dx / dist) * force * repulseStrength * 0.03;
                    p.vy += (dy / dist) * force * repulseStrength * 0.03;
                }

                // Fade opacity back to normal
                p.opacity += (0.5 - p.opacity) * 0.02;

                // Apply velocity with damping
                p.vx *= 0.96;
                p.vy *= 0.96;
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Keep in bounds
                p.x = Math.max(0, Math.min(canvas.width, p.x));
                p.y = Math.max(0, Math.min(canvas.height, p.y));

                // Draw particle with glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = colors.particle;
                ctx.shadowBlur = 8;
                ctx.shadowColor = colors.particle;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Draw links to nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const ldx = p.x - p2.x;
                    const ldy = p.y - p2.y;
                    const ldist = Math.sqrt(ldx * ldx + ldy * ldy);

                    if (ldist < linkDistance) {
                        const opacity = (1 - ldist / linkDistance) * 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = colors.link.replace('0.12', opacity.toFixed(2));
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [getColors, initParticles]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'auto',
            }}
        />
    );
};

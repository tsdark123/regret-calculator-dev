import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    rotation: number;
    rotationSpeed: number;
}

interface ParticleBackgroundProps {
    theme?: 'purple' | 'green' | 'blue';
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ theme = 'purple' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number>();

    const getColor = useCallback(() => {
        switch (theme) {
            case 'green':
                return 'rgba(74, 222, 128, 0.4)';
            case 'blue':
                return 'rgba(96, 165, 250, 0.4)';
            default:
                return 'rgba(168, 85, 247, 0.4)';
        }
    }, [theme]);

    const initParticles = useCallback((width: number, height: number) => {
        const particleCount = Math.floor((width * height) / 12000);
        const particles: Particle[] = [];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 8 + 4,
                opacity: Math.random() * 0.3 + 0.2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
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
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles(canvas.width, canvas.height);
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

        const particleColor = getColor();
        const repulseDistance = 200;
        const repulseStrength = 12;
        const spazDistance = 100;

        // Helper to draw a triangle
        const drawTriangle = (x: number, y: number, size: number, rotation: number, opacity: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size * 0.866, size * 0.5);
            ctx.lineTo(-size * 0.866, size * 0.5);
            ctx.closePath();
            ctx.fillStyle = particleColor.replace('0.4', opacity.toFixed(2));
            ctx.shadowBlur = 10;
            ctx.shadowColor = particleColor;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particlesRef.current;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Mouse interaction
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < spazDistance && dist > 0) {
                    // Intense "spaz out" effect when very close
                    const spazIntensity = (spazDistance - dist) / spazDistance;
                    p.vx += (Math.random() - 0.5) * spazIntensity * 6;
                    p.vy += (Math.random() - 0.5) * spazIntensity * 6;
                    p.rotationSpeed += (Math.random() - 0.5) * spazIntensity * 0.3;
                    // Push away
                    p.vx += (dx / dist) * spazIntensity * repulseStrength * 0.15;
                    p.vy += (dy / dist) * spazIntensity * repulseStrength * 0.15;
                    // Increase opacity
                    p.opacity = Math.min(0.8, p.opacity + spazIntensity * 0.4);
                } else if (dist < repulseDistance && dist > 0) {
                    // Gentler repulsion in outer ring
                    const force = (repulseDistance - dist) / repulseDistance;
                    p.vx += (dx / dist) * force * repulseStrength * 0.04;
                    p.vy += (dy / dist) * force * repulseStrength * 0.04;
                }

                // Fade opacity back to normal
                p.opacity += (0.35 - p.opacity) * 0.02;
                // Slow down rotation
                p.rotationSpeed *= 0.98;

                // Apply velocity with damping
                p.vx *= 0.95;
                p.vy *= 0.95;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;

                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Keep in bounds
                p.x = Math.max(0, Math.min(canvas.width, p.x));
                p.y = Math.max(0, Math.min(canvas.height, p.y));

                // Draw triangle
                drawTriangle(p.x, p.y, p.size, p.rotation, p.opacity);
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
    }, [getColor, initParticles]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'auto',
            }}
        />
    );
};

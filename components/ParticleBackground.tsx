import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
}

interface ParticleBackgroundProps {
    theme?: 'purple' | 'green' | 'blue';
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = React.memo(({ theme = 'purple' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number>();
    const isPausedRef = useRef(false);
    const prefersReducedMotionRef = useRef(false);
    const isMobileRef = useRef(false);

    // Theme-aware colors
    const getThemeColors = (theme: string) => {
        switch (theme) {
            case 'green':
                return {
                    particle: 'rgba(34, 197, 94, 0.15)',
                    link: 'rgba(34, 197, 94, 0.1)',
                };
            case 'blue':
                return {
                    particle: 'rgba(59, 130, 246, 0.15)',
                    link: 'rgba(59, 130, 246, 0.1)',
                };
            case 'purple':
            default:
                return {
                    particle: 'rgba(155, 89, 182, 0.15)',
                    link: 'rgba(155, 89, 182, 0.1)',
                };
        }
    };

    const initParticles = useCallback((width: number, height: number) => {
        // Much lower density than before: previous /18000 created O(n³) triangle work
        // that crippled larger screens. /50000 keeps the effect smooth while still visible.
        const particleCount = Math.min(80, Math.floor((width * height) / 50000));
        const particles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 1.5,
            });
        }

        particlesRef.current = particles;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const colors = getThemeColors(theme);

        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        prefersReducedMotionRef.current = reducedMotionQuery.matches;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles(canvas.width, canvas.height);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        isMobileRef.current = window.innerWidth < 1024;

        const handleMouseMove = (e: MouseEvent) => {
            if (isMobileRef.current) return;
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            if (isMobileRef.current) return;
            mouseRef.current = { x: -1000, y: -1000 };
        };

        const handleVisibility = () => {
            isPausedRef.current = document.hidden;
            scheduleIfNeeded();
        };

        const handleMotionChange = () => {
            prefersReducedMotionRef.current = reducedMotionQuery.matches;
            scheduleIfNeeded();
        };

        reducedMotionQuery.addEventListener('change', handleMotionChange);
        document.addEventListener('visibilitychange', handleVisibility);

        if (!isMobileRef.current) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseleave', handleMouseLeave);
        }

        const linkDistance = 140;
        const grabDistance = 160;
        const repulseDistance = 100;
        const repulseStrength = 6;
        const spazDistance = 50;

        const drawParticle = (p: Particle) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = colors.particle;
            ctx.fill();
        };

        const drawLinksAndParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particlesRef.current;
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;

            ctx.lineWidth = 1;

            // First pass: draw links and mouse grab lines
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < linkDistance * linkDistance) {
                        const dist = Math.sqrt(distSq);
                        const opacity = (1 - dist / linkDistance) * 0.15;
                        ctx.globalAlpha = opacity;
                        ctx.strokeStyle = colors.link;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                const dxMouse = p1.x - mouseX;
                const dyMouse = p1.y - mouseY;
                const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;

                if (distMouseSq < grabDistance * grabDistance && mouseX > 0) {
                    const distMouse = Math.sqrt(distMouseSq);
                    const grabOpacity = (1 - distMouse / grabDistance) * 0.2;
                    ctx.globalAlpha = grabOpacity;
                    ctx.strokeStyle = colors.link;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.stroke();
                }
            }

            ctx.globalAlpha = 1;

            for (let i = 0; i < particles.length; i++) {
                drawParticle(particles[i]);
            }
        };

        const drawStatic = () => {
            drawLinksAndParticles();
        };

        const animate = () => {
            const particles = particlesRef.current;
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                const dx = p.x - mouseX;
                const dy = p.y - mouseY;
                const distSq = dx * dx + dy * dy;

                if (distSq > 0 && distSq < spazDistance * spazDistance) {
                    const dist = Math.sqrt(distSq);
                    const spazIntensity = (spazDistance - dist) / spazDistance;
                    p.vx += (Math.random() - 0.5) * spazIntensity * 5;
                    p.vy += (Math.random() - 0.5) * spazIntensity * 5;
                    p.vx += (dx / dist) * spazIntensity * repulseStrength * 0.2;
                    p.vy += (dy / dist) * spazIntensity * repulseStrength * 0.2;
                } else if (distSq > 0 && distSq < repulseDistance * repulseDistance) {
                    const dist = Math.sqrt(distSq);
                    const force = (repulseDistance - dist) / repulseDistance;
                    p.vx += (dx / dist) * force * repulseStrength * 0.05;
                    p.vy += (dy / dist) * force * repulseStrength * 0.05;
                }

                p.vx *= 0.96;
                p.vy *= 0.96;
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                p.x = Math.max(0, Math.min(canvas.width, p.x));
                p.y = Math.max(0, Math.min(canvas.height, p.y));
            }

            drawLinksAndParticles();

            if (!isPausedRef.current && !prefersReducedMotionRef.current) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        const scheduleIfNeeded = () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = undefined;
            }

            if (prefersReducedMotionRef.current) {
                drawStatic();
                return;
            }

            if (!isPausedRef.current) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        scheduleIfNeeded();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (!isMobileRef.current) {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseleave', handleMouseLeave);
            }
            reducedMotionQuery.removeEventListener('change', handleMotionChange);
            document.removeEventListener('visibilitychange', handleVisibility);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [initParticles, theme]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
});

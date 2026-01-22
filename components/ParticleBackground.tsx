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

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ theme = 'purple' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number>();

    // Premium purple color: #9b59b6 at 0.3 opacity
    const particleColor = 'rgba(155, 89, 182, 0.3)';
    const linkColor = 'rgba(155, 89, 182, 0.2)';
    const triangleFillColor = 'rgba(155, 89, 182, 0.08)';

    const initParticles = useCallback((width: number, height: number) => {
        const particleCount = Math.floor((width * height) / 18000);
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

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles(canvas.width, canvas.height);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        const linkDistance = 150;
        const grabDistance = 180;
        const repulseDistance = 120;
        const repulseStrength = 8;
        const spazDistance = 60;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particlesRef.current;
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;

            // First pass: Draw triangle fills and links between particles
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx12 = p1.x - p2.x;
                    const dy12 = p1.y - p2.y;
                    const dist12 = Math.sqrt(dx12 * dx12 + dy12 * dy12);

                    if (dist12 < linkDistance) {
                        // Check for a third particle to form a triangle
                        for (let k = j + 1; k < particles.length; k++) {
                            const p3 = particles[k];
                            const dx13 = p1.x - p3.x;
                            const dy13 = p1.y - p3.y;
                            const dist13 = Math.sqrt(dx13 * dx13 + dy13 * dy13);
                            
                            const dx23 = p2.x - p3.x;
                            const dy23 = p2.y - p3.y;
                            const dist23 = Math.sqrt(dx23 * dx23 + dy23 * dy23);

                            if (dist13 < linkDistance && dist23 < linkDistance) {
                                // Draw filled triangle
                                const avgOpacity = (1 - dist12 / linkDistance) * 
                                                   (1 - dist13 / linkDistance) * 
                                                   (1 - dist23 / linkDistance);
                                ctx.beginPath();
                                ctx.moveTo(p1.x, p1.y);
                                ctx.lineTo(p2.x, p2.y);
                                ctx.lineTo(p3.x, p3.y);
                                ctx.closePath();
                                ctx.fillStyle = triangleFillColor.replace('0.08', (0.08 * avgOpacity).toFixed(3));
                                ctx.fill();
                            }
                        }

                        // Draw link between p1 and p2
                        const opacity = (1 - dist12 / linkDistance) * 0.4;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = linkColor.replace('0.2', opacity.toFixed(2));
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                // Grab effect: Draw lines from particles to mouse cursor
                const dxMouse = p1.x - mouseX;
                const dyMouse = p1.y - mouseY;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                
                if (distMouse < grabDistance && mouseX > 0) {
                    const grabOpacity = (1 - distMouse / grabDistance) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = linkColor.replace('0.2', grabOpacity.toFixed(2));
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // Second pass: Update physics and draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Mouse interaction - repulse + spaz
                const dx = p.x - mouseX;
                const dy = p.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < spazDistance && dist > 0) {
                    // Intense "spaz out" effect when very close
                    const spazIntensity = (spazDistance - dist) / spazDistance;
                    p.vx += (Math.random() - 0.5) * spazIntensity * 5;
                    p.vy += (Math.random() - 0.5) * spazIntensity * 5;
                    // Push away
                    p.vx += (dx / dist) * spazIntensity * repulseStrength * 0.2;
                    p.vy += (dy / dist) * spazIntensity * repulseStrength * 0.2;
                } else if (dist < repulseDistance && dist > 0) {
                    // Gentler repulsion in outer ring
                    const force = (repulseDistance - dist) / repulseDistance;
                    p.vx += (dx / dist) * force * repulseStrength * 0.05;
                    p.vy += (dy / dist) * force * repulseStrength * 0.05;
                }

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

                // Draw circle particle with glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.shadowBlur = 6;
                ctx.shadowColor = particleColor;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [initParticles]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    );
};

'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      const target = Math.min(70, Math.round((width * height) / 28000));
      if (particlesRef.current.length !== target) {
        particlesRef.current = Array.from({ length: target }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 0.6 + Math.random() * 1.6,
          alpha: 0.25 + Math.random() * 0.45,
        }));
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(document.body);

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      const ps = particlesRef.current;
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }

      // connecting lines
      const maxDist = 130;
      ctx.lineWidth = 1;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i];
          const b = ps[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxDist * maxDist) {
            const t = 1 - Math.sqrt(d2) / maxDist;
            ctx.strokeStyle = `rgba(180, 165, 230, ${0.12 * t})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // particles
      for (const p of ps) {
        ctx.fillStyle = `rgba(200, 180, 240, ${p.alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Static gradient base */}
      <div className="absolute inset-0 bg-[hsl(var(--background))]" />

      {/* Animated orbs */}
      <div className="absolute -left-32 top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--brand-indigo)/0.25)] blur-[120px] animate-pulse-glow" />
      <div
        className="absolute -right-32 top-[40%] h-[32rem] w-[32rem] rounded-full bg-[hsl(var(--brand-violet)/0.25)] blur-[140px] animate-pulse-glow"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute left-1/3 bottom-[-10%] h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--brand-indigo)/0.18)] blur-[120px] animate-pulse-glow"
        style={{ animationDelay: '4s' }}
      />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Subtle grid */}
      <div className="absolute inset-0 ek-grid opacity-[0.18] dark:opacity-[0.12]" />
    </div>
  );
}

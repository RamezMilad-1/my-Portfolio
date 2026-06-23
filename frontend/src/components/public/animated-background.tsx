'use client';

import { useEffect, useRef, useState } from 'react';

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
  // Skip the canvas particle layer on phones / coarse pointers. The orbs +
  // grid still render, so the background never looks empty — but we avoid
  // the per-frame canvas work on the hardware least able to absorb it.
  const [canDrawCanvas, setCanDrawCanvas] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isMobile = window.matchMedia(
      '(pointer: coarse), (max-width: 768px)',
    ).matches;
    setCanDrawCanvas(!isMobile);
  }, []);

  useEffect(() => {
    if (!canDrawCanvas) return;
    if (typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let visible = !document.hidden;
    // Frame throttling — on Hi-DPI screens the canvas is large; skipping
    // every other frame still reads as smooth motion on subtle particles
    // and halves GPU upload cost.
    const throttle = dpr > 1;
    let oddFrame = false;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(36, Math.round((width * height) / 60000));
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
    window.addEventListener('resize', resize, { passive: true });

    const onVisibilityChange = () => {
      visible = !document.hidden;
      if (visible && rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const maxDist = 130;
    const maxDistSq = maxDist * maxDist;

    const tick = () => {
      if (!visible) {
        rafRef.current = null;
        return;
      }
      if (throttle) {
        oddFrame = !oddFrame;
        if (oddFrame) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      }

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

      const cellSize = maxDist;
      const cols = Math.max(1, Math.ceil(width / cellSize));
      const rows = Math.max(1, Math.ceil(height / cellSize));
      const buckets: number[][] = new Array(cols * rows);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const cx = Math.min(cols - 1, Math.max(0, Math.floor(p.x / cellSize)));
        const cy = Math.min(rows - 1, Math.max(0, Math.floor(p.y / cellSize)));
        const key = cy * cols + cx;
        (buckets[key] ?? (buckets[key] = [])).push(i);
      }

      ctx.lineWidth = 1;
      const neighborOffsets = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
        [-1, 1],
      ];

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const key = cy * cols + cx;
          const here = buckets[key];
          if (!here) continue;
          for (const [dx, dy] of neighborOffsets) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
            const there = buckets[ny * cols + nx];
            if (!there) continue;
            const sameCell = dx === 0 && dy === 0;
            for (let ai = 0; ai < here.length; ai++) {
              const a = ps[here[ai]];
              const startBj = sameCell ? ai + 1 : 0;
              for (let bj = startBj; bj < there.length; bj++) {
                const b = ps[there[bj]];
                const ddx = a.x - b.x;
                const ddy = a.y - b.y;
                const d2 = ddx * ddx + ddy * ddy;
                if (d2 < maxDistSq) {
                  const t = 1 - Math.sqrt(d2) / maxDist;
                  ctx.strokeStyle = `rgba(180, 165, 230, ${0.12 * t})`;
                  ctx.beginPath();
                  ctx.moveTo(a.x, a.y);
                  ctx.lineTo(b.x, b.y);
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

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
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [canDrawCanvas]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-32 top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--brand-indigo)/0.25)] blur-[120px] animate-pulse-glow" />
      <div
        className="absolute -right-28 top-[56%] h-[40rem] w-[40rem] rounded-full bg-[hsl(var(--brand-violet)/0.12)] blur-[220px] animate-pulse-glow-subtle"
        style={{ animationDelay: '-2s' }}
      />
      <div
        className="absolute left-1/3 bottom-[-10%] h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--brand-indigo)/0.18)] blur-[120px] animate-pulse-glow"
        style={{ animationDelay: '-4s' }}
      />

      {canDrawCanvas ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ background: 'transparent' }}
        />
      ) : null}

      {/* Subtle grid */}
      <div className="absolute inset-0 ek-grid opacity-[0.18] dark:opacity-[0.12]" />
    </div>
  );
}

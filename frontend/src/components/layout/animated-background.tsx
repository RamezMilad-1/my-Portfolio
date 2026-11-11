'use client';

import { useEffect, useRef } from 'react';
import { useMediaQuery } from '@/lib/use-media-query';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

/** Redraws at most ~30 times a second — the particles drift far too slowly to need more. */
const FRAME_BUDGET_MS = 1000 / 30;
/** Drawing pauses while the visitor scrolls, handing the whole frame budget to scrolling. */
const SCROLL_IDLE_MS = 150;
const LINK_DISTANCE = 130;

/**
 * Fixed page background: blurred glow orbs plus, on desktop, a drifting particle network.
 * The canvas is skipped on touch devices, small screens and for reduced-motion users.
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawParticles = useMediaQuery(
    '(pointer: fine) and (min-width: 769px) and (prefers-reduced-motion: no-preference)',
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!drawParticles || !canvas || !ctx) return;

    // 1.5× instead of the full device pixel ratio: faint 1–2px dots look identical, and each
    // frame pushes ~44% fewer pixels on 2× screens.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let lastFrame = 0;
    let lastScroll = -Infinity;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(36, Math.round((width * height) / 60000));
      if (particles.length !== count) {
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 0.6 + Math.random() * 1.6,
          alpha: 0.25 + Math.random() * 0.45,
        }));
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }

      // Bucket particles into a grid so only neighbours are compared for connecting lines.
      const cols = Math.max(1, Math.ceil(width / LINK_DISTANCE));
      const rows = Math.max(1, Math.ceil(height / LINK_DISTANCE));
      const buckets: number[][] = [];
      particles.forEach((p, index) => {
        const cx = Math.min(cols - 1, Math.max(0, Math.floor(p.x / LINK_DISTANCE)));
        const cy = Math.min(rows - 1, Math.max(0, Math.floor(p.y / LINK_DISTANCE)));
        (buckets[cy * cols + cx] ??= []).push(index);
      });

      ctx.lineWidth = 1;
      const neighbours = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
        [-1, 1],
      ];
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const here = buckets[cy * cols + cx];
          if (!here) continue;
          for (const [dx, dy] of neighbours) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
            const there = buckets[ny * cols + nx];
            if (!there) continue;
            const sameCell = dx === 0 && dy === 0;
            for (let i = 0; i < here.length; i++) {
              const a = particles[here[i]];
              for (let j = sameCell ? i + 1 : 0; j < there.length; j++) {
                const b = particles[there[j]];
                const distance = Math.hypot(a.x - b.x, a.y - b.y);
                if (distance >= LINK_DISTANCE) continue;
                ctx.strokeStyle = `rgba(180, 165, 230, ${0.12 * (1 - distance / LINK_DISTANCE)})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = `rgba(200, 180, 240, ${p.alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - lastFrame < FRAME_BUDGET_MS || now - lastScroll < SCROLL_IDLE_MS) return;
      lastFrame = now;
      draw();
    };

    const start = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const onVisibilityChange = () => (document.hidden ? stop() : start());
    const onScroll = () => {
      lastScroll = performance.now();
    };

    resize();
    start();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [drawParticles]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 top-[-10%] h-[28rem] w-[28rem] animate-pulse-glow rounded-full bg-brand-indigo/25 blur-[120px]" />
      <div
        className="absolute -right-28 top-[56%] h-[40rem] w-[40rem] animate-pulse-glow-subtle rounded-full bg-brand-violet/12 blur-[220px]"
        style={{ animationDelay: '-2s' }}
      />
      <div
        className="absolute bottom-[-10%] left-1/3 h-[28rem] w-[28rem] animate-pulse-glow rounded-full bg-brand-indigo/18 blur-[120px]"
        style={{ animationDelay: '-4s' }}
      />
      {drawParticles ? <canvas ref={canvasRef} className="absolute inset-0" /> : null}
    </div>
  );
}

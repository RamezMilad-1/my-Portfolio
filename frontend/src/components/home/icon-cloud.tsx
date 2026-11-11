'use client';

import { memo, useEffect, useRef } from 'react';

/** CSS size of the canvas; the backing store is scaled by the device pixel ratio. */
const SIZE = 300;
const ICON_RADIUS = 20;

interface Point {
  x: number;
  y: number;
  z: number;
}

/** Spreads `count` points evenly over a sphere (Fibonacci lattice). */
function spherePoints(count: number): Point[] {
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * increment;
    return { x: Math.cos(phi) * r * 100, y: y * 100, z: Math.sin(phi) * r * 100 };
  });
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Interactive 3D cloud of logos: drifts with the pointer, can be dragged, and spins an icon to
 * the front when clicked. Animates only while visible; stays still for reduced-motion users.
 */
function IconCloudCanvas({ images }: { images: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const points = spherePoints(images.length);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rotation = { x: 0, y: 0 };
    let target: {
      x: number;
      y: number;
      from: { x: number; y: number };
      start: number;
      duration: number;
    } | null = null;
    // Off-center start, so the cloud drifts on load; the pointer steers it once it moves.
    let pointer = { x: 0, y: 0 };
    let drag: { x: number; y: number } | null = null;
    let frame = 0;
    let inView = false;
    let cancelled = false;

    // Each logo is pre-rendered once into a small circular sprite.
    const sprites = images.map((src) => {
      const sprite = document.createElement('canvas');
      sprite.width = ICON_RADIUS * 2 * dpr;
      sprite.height = ICON_RADIUS * 2 * dpr;
      const image = new Image();
      image.onload = () => {
        const spriteCtx = sprite.getContext('2d');
        if (!spriteCtx) return;
        spriteCtx.scale(dpr, dpr);
        spriteCtx.beginPath();
        spriteCtx.arc(ICON_RADIUS, ICON_RADIUS, ICON_RADIUS, 0, Math.PI * 2);
        spriteCtx.clip();
        spriteCtx.drawImage(image, 0, 0, ICON_RADIUS * 2, ICON_RADIUS * 2);
        if (!frame) draw();
      };
      image.src = src;
      return { sprite, ready: () => image.complete && image.naturalWidth > 0 };
    });

    const project = (point: Point) => {
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const x = point.x * cosY - point.z * sinY;
      const z = point.x * sinY + point.z * cosY;
      const y = point.y * cosX + z * sinX;
      return { x: SIZE / 2 + x, y: SIZE / 2 + y, z, scale: (z + 200) / 300 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      points.forEach((point, index) => {
        const { sprite, ready } = sprites[index];
        if (!ready()) return;
        const p = project(point);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.scale, p.scale);
        ctx.globalAlpha = Math.max(0.2, Math.min(1, (p.z + 150) / 200));
        ctx.drawImage(sprite, -ICON_RADIUS, -ICON_RADIUS, ICON_RADIUS * 2, ICON_RADIUS * 2);
        ctx.restore();
      });
    };

    const step = (now: number) => {
      if (target) {
        const progress = Math.min(1, (now - target.start) / target.duration);
        const eased = easeOutCubic(progress);
        rotation = {
          x: target.from.x + (target.x - target.from.x) * eased,
          y: target.from.y + (target.y - target.from.y) * eased,
        };
        if (progress >= 1) target = null;
      } else if (!drag && !reducedMotion) {
        const dx = pointer.x - SIZE / 2;
        const dy = pointer.y - SIZE / 2;
        const speed = 0.003 + (Math.hypot(dx, dy) / Math.hypot(SIZE / 2, SIZE / 2)) * 0.01;
        rotation = { x: rotation.x + (dy / SIZE) * speed, y: rotation.y + (dx / SIZE) * speed };
      }
      draw();
      // With reduced motion the loop only runs while a click-to-focus spin is in progress.
      const idle = reducedMotion && !target;
      frame = cancelled || idle ? 0 : requestAnimationFrame(step);
    };

    const start = () => {
      if (!frame && inView && !document.hidden) frame = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const localPoint = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMouseDown = (event: MouseEvent) => {
      const click = localPoint(event);
      const hit = points.find((point) => {
        const p = project(point);
        return Math.hypot(click.x - p.x, click.y - p.y) < ICON_RADIUS * p.scale;
      });
      if (hit) {
        const x = -Math.atan2(hit.y, Math.hypot(hit.x, hit.z));
        const y = Math.atan2(hit.x, hit.z);
        const distance = Math.hypot(x - rotation.x, y - rotation.y);
        target = {
          x,
          y,
          from: rotation,
          start: performance.now(),
          duration: Math.min(2000, Math.max(800, distance * 1000)),
        };
        start();
      }
      drag = { x: event.clientX, y: event.clientY };
    };
    const onMouseMove = (event: MouseEvent) => {
      pointer = localPoint(event);
      if (!drag) return;
      rotation = {
        x: rotation.x + (event.clientY - drag.y) * 0.002,
        y: rotation.y + (event.clientX - drag.x) * 0.002,
      };
      drag = { x: event.clientX, y: event.clientY };
      if (reducedMotion) draw();
    };
    const onMouseUp = () => {
      drag = null;
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      if (inView && !reducedMotion) start();
      else stop();
    });
    observer.observe(canvas);
    const onVisibilityChange = () => (document.hidden ? stop() : !reducedMotion && start());

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      stop();
      observer.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [images]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{ width: SIZE, height: SIZE }}
      className="rounded-lg"
      role="img"
      aria-label="Interactive 3D cloud of technology logos"
    />
  );
}

export const IconCloud = memo(IconCloudCanvas);

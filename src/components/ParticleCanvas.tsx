"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface ParticleCanvasProps {
  className?: string;
  /** subtle=true → uses muted white/gray tones and lower alpha (for HOD/dark sections) */
  subtle?: boolean;
}

const VIVID_COLORS  = ["#3b82f6", "#60a5fa", "#93c5fd", "#1d4ed8", "#7dd3fc"];
const SUBTLE_COLORS = ["#ffffff", "#e0e7ff", "#bfdbfe", "#c7d2fe", "#dde4f5"];

export default function ParticleCanvas({ className = "", subtle = false }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  // Stable ref so effect dep array never changes size
  const subtleRef = useRef(subtle);
  subtleRef.current = subtle;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let particles: Particle[] = [];

    const isSubtle       = subtleRef.current;
    const GRID           = 40;
    const ATTRACT_RADIUS = 150;
    const ATTRACT_STR    = isSubtle ? 0.038 : 0.062;
    const DAMPING        = 0.87;
    const RETURN_STR     = 0.04;
    const MAX_ALPHA      = isSubtle ? 0.28 : 0.90;
    const PROXIMITY_BOOST= isSubtle ? 0.30 : 0.55;
    const COLORS         = isSubtle ? SUBTLE_COLORS : VIVID_COLORS;

    function buildParticles() {
      particles = [];
      const cols = Math.ceil(W / GRID);
      const rows = Math.ceil(H / GRID);
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const ox = c * GRID;
          const oy = r * GRID;
          particles.push({
            x: ox, y: oy, ox, oy,
            vx: 0, vy: 0,
            size: Math.random() * 1.2 + 0.5,
            alpha: isSubtle
              ? Math.random() * 0.10 + 0.04   // very dim at rest
              : Math.random() * 0.35 + 0.08,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      }
    }

    function resize() {
      W = canvas!.offsetWidth;
      H = canvas!.offsetHeight;
      canvas!.width  = W * devicePixelRatio;
      canvas!.height = H * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
      buildParticles();
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      const rect = canvas!.getBoundingClientRect();
      const mx = mouse.current.x - rect.left;
      const my = mouse.current.y - rect.top;

      for (const p of particles) {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ATTRACT_RADIUS) {
          const force = (ATTRACT_RADIUS - dist) / ATTRACT_RADIUS;
          p.vx += dx * force * ATTRACT_STR;
          p.vy += dy * force * ATTRACT_STR;
        }

        p.vx += (p.ox - p.x) * RETURN_STR;
        p.vy += (p.oy - p.y) * RETURN_STR;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x  += p.vx;
        p.y  += p.vy;

        const proximity    = dist < ATTRACT_RADIUS ? 1 - dist / ATTRACT_RADIUS : 0;
        const finalAlpha   = Math.min(p.alpha + proximity * PROXIMITY_BOOST, MAX_ALPHA);
        const finalSize    = p.size + proximity * 2.5;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, finalSize, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = finalAlpha;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    window.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

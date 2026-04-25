"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number; y: number;
  vx: number; vy: number;
  ox: number; oy: number;
}

const NODE_COUNT   = 80;
const CONNECT_DIST = 140;
const CURSOR_R     = 160;   // radius of cursor influence
const PUSH_STR     = 0.55;  // how hard nodes push away from cursor
const DAMPING      = 0.88;
const RETURN_STR   = 0.025;
const WANDER       = 0.06;

export default function NeuralNetCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let W = 0, H = 0;
    let nodes: Node[] = [];

    function build() {
      nodes = Array.from({ length: NODE_COUNT }, () => {
        const x = Math.random() * W;
        const y = Math.random() * H;
        return { x, y, ox: x, oy: y, vx: 0, vy: 0 };
      });
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(devicePixelRatio, devicePixelRatio);
      build();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      /* Update node physics */
      for (const n of nodes) {
        const dx = n.x - mx;
        const dy = n.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        /* Push away from cursor */
        if (dist < CURSOR_R && dist > 0) {
          const force = (CURSOR_R - dist) / CURSOR_R;
          n.vx += (dx / dist) * force * PUSH_STR;
          n.vy += (dy / dist) * force * PUSH_STR;
        }

        /* Slow random wander */
        n.vx += (Math.random() - 0.5) * WANDER;
        n.vy += (Math.random() - 0.5) * WANDER;

        /* Spring return to origin */
        n.vx += (n.ox - n.x) * RETURN_STR;
        n.vy += (n.oy - n.y) * RETURN_STR;

        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x  += n.vx;
        n.y  += n.vy;

        /* Soft boundary */
        if (n.x < 0)  { n.x = 0;  n.vx *= -0.4; }
        if (n.x > W)  { n.x = W;  n.vx *= -0.4; }
        if (n.y < 0)  { n.y = 0;  n.vy *= -0.4; }
        if (n.y > H)  { n.y = H;  n.vy *= -0.4; }
      }

      /* Draw edges */
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d > CONNECT_DIST) continue;

          /* Brighten lines near cursor */
          const midX    = (a.x + b.x) / 2;
          const midY    = (a.y + b.y) / 2;
          const toCursor = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2);
          const boost    = toCursor < CURSOR_R ? (1 - toCursor / CURSOR_R) * 0.25 : 0;

          const alpha = (1 - d / CONNECT_DIST) * 0.10 + boost;
          ctx.strokeStyle = `rgba(80, 110, 160, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      /* Draw nodes */
      for (const n of nodes) {
        const toCursor = Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2);
        const boost    = toCursor < CURSOR_R ? (1 - toCursor / CURSOR_R) : 0;
        const alpha    = 0.12 + boost * 0.35;
        const r        = 1.4 + boost * 2;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80, 120, 200, ${alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    const onMove = (e: MouseEvent) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    const onLeave = () => { mouse.current.x = -9999; mouse.current.y = -9999; };

    window.addEventListener("resize",    resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    resize();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}

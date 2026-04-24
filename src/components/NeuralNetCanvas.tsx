"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
}

const NODE_COUNT = 55;
const CONNECTION_DIST = 160;
const CURSOR_ATTRACT_RADIUS = 180;
const CURSOR_STRENGTH = 0.018;
const DRIFT_DAMPING = 0.94;
const RETURN_STRENGTH = 0.008;
const NODE_WANDER = 0.18; // random wander per frame

export default function NeuralNetCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;
    let nodes: Node[] = [];

    function buildNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => {
        const x = Math.random() * W;
        const y = Math.random() * H;
        return {
          x, y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.8 + 0.8,
        };
      });
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(devicePixelRatio, devicePixelRatio);
      buildNodes();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Update nodes
      for (const n of nodes) {
        // Cursor attraction
        const dx = mx - n.x;
        const dy = my - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CURSOR_ATTRACT_RADIUS && dist > 0) {
          const force = (CURSOR_ATTRACT_RADIUS - dist) / CURSOR_ATTRACT_RADIUS;
          n.vx += dx * force * CURSOR_STRENGTH;
          n.vy += dy * force * CURSOR_STRENGTH;
        }

        // Slow random wander
        n.vx += (Math.random() - 0.5) * NODE_WANDER;
        n.vy += (Math.random() - 0.5) * NODE_WANDER;

        // Return to base position (very gently)
        n.vx += (n.baseX - n.x) * RETURN_STRENGTH;
        n.vy += (n.baseY - n.y) * RETURN_STRENGTH;

        // Damping
        n.vx *= DRIFT_DAMPING;
        n.vy *= DRIFT_DAMPING;

        n.x += n.vx;
        n.y += n.vy;

        // Soft boundary bounce
        if (n.x < 0) { n.x = 0; n.vx *= -0.5; }
        if (n.x > W) { n.x = W; n.vx *= -0.5; }
        if (n.y < 0) { n.y = 0; n.vy *= -0.5; }
        if (n.y > H) { n.y = H; n.vy *= -0.5; }
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(100, 130, 180, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const dx = mouse.current.x - n.x;
        const dy = mouse.current.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = dist < CURSOR_ATTRACT_RADIUS ? (1 - dist / CURSOR_ATTRACT_RADIUS) : 0;
        const alpha = 0.12 + proximity * 0.25;
        const r = n.radius + proximity * 2;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 150, 210, ${alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    resize();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
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

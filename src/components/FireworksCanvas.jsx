import React, { useEffect, useRef } from 'react';

export default function FireworksCanvas({ active = true, density = 'normal' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const colors = [
      '#f7c948', // Gold
      '#ff2a85', // Festive Pink
      '#ff6b35', // Orange
      '#06d6a0', // Teal
      '#b5179e', // Purple
      '#7209b7', // Indigo
      '#ffe082', // Light gold
      '#ffffff', // White sparkle
    ];

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        this.size = Math.random() * 2.2 + 1;
        this.gravity = 0.04;
      }

      update() {
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function createFirework(x, y) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const count = density === 'high' ? 55 : 35;
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
      }
    }

    let lastFireworkTime = 0;
    const interval = density === 'high' ? 900 : 1800;

    const render = (time) => {
      ctx.clearRect(0, 0, width, height);

      if (time - lastFireworkTime > interval) {
        // Random position in upper 65% of screen
        const x = Math.random() * (width * 0.8) + width * 0.1;
        const y = Math.random() * (height * 0.5) + height * 0.1;
        createFirework(x, y);
        lastFireworkTime = time;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}

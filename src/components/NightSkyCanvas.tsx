import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export const NightSkyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Color palettes for celestial stars
    const starColors = [
      'rgba(240, 245, 255, ',
      'rgba(210, 230, 255, ',
      'rgba(255, 250, 230, ',
      'rgba(180, 220, 255, ',
      'rgba(255, 240, 215, ',
    ];

    let stars: Star[] = [];
    const initStars = () => {
      const starCount = Math.floor((width * height) / 3600); // Dense yet performant distribution
      stars = [];
      for (let i = 0; i < Math.min(starCount, 300); i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.3,
          baseAlpha: Math.random() * 0.6 + 0.25,
          twinkleSpeed: Math.random() * 0.03 + 0.008,
          phase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    initStars();

    // Meteors
    let meteors: Meteor[] = [];
    let lastMeteorTime = Date.now();

    const spawnMeteor = () => {
      const angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1); // approx 45 degrees
      meteors.push({
        x: Math.random() * (width * 0.8),
        y: Math.random() * (height * 0.35),
        length: Math.random() * 80 + 60,
        speed: Math.random() * 7 + 9,
        angle,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 40 + 50,
      });
    };

    let time = 0;

    const render = () => {
      time += 0.016;

      ctx.clearRect(0, 0, width, height);

      // Deep space gradient backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, width * 0.5, height);
      bgGrad.addColorStop(0, '#04060d');
      bgGrad.addColorStop(0.4, '#070c1a');
      bgGrad.addColorStop(0.7, '#080d21');
      bgGrad.addColorStop(1, '#050711');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Soft nebula celestial cloud
      const nebulaGrad = ctx.createRadialGradient(
        width * 0.25,
        height * 0.2,
        20,
        width * 0.25,
        height * 0.2,
        width * 0.5
      );
      nebulaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
      nebulaGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.03)');
      nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Stars with sine-wave twinkling
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const currentAlpha = s.baseAlpha + Math.sin(time * 30 * s.twinkleSpeed + s.phase) * 0.25;
        const clampedAlpha = Math.max(0.08, Math.min(1, currentAlpha));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${clampedAlpha})`;
        ctx.fill();

        // Extra flare on brighter stars
        if (s.radius > 1.3 && clampedAlpha > 0.6) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${s.color}${clampedAlpha * 0.15})`;
          ctx.fill();
        }
      }

      // Spawn meteors periodically (every 4-7 seconds)
      const now = Date.now();
      if (now - lastMeteorTime > 4500 && Math.random() < 0.015) {
        spawnMeteor();
        lastMeteorTime = now;
      }

      // Render Meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life++;
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;

        const lifeRatio = m.life / m.maxLife;
        m.alpha = Math.max(0, 1 - lifeRatio);

        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const meteorGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        meteorGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        meteorGrad.addColorStop(0.7, `rgba(186, 230, 253, ${m.alpha * 0.4})`);
        meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha * 0.95})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Small bright head point
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
        ctx.fill();

        if (m.life >= m.maxLife || m.x > width + 100 || m.y > height + 100) {
          meteors.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

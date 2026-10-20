import React, { useRef, useEffect } from 'react';

export interface Racer {
  id: string;
  name: string;
  progress: number; // 0 to 100
  wpm: number;
  color: string;
  isUser?: boolean;
  isNitro?: boolean;
  hasError?: boolean;
  avatar?: string;
}

interface RaceTrackProps {
  racers: Racer[];
}

export const RaceTrack: React.FC<RaceTrackProps> = ({ racers }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particleOffset = 0;

    const render = () => {
      // Dynamic canvas sizing
      const width = canvas.clientWidth;
      const laneCount = Math.max(racers.length, 2);
      const laneHeight = Math.min(65, Math.max(48, Math.floor(220 / laneCount)));
      const height = laneCount * laneHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);
      particleOffset = (particleOffset + 2) % 40;

      // Draw Lanes
      for (let i = 0; i < laneCount; i++) {
        const y = i * laneHeight;

        // Asphalt lane
        ctx.fillStyle = i % 2 === 0 ? '#111827' : '#0f172a';
        ctx.fillRect(0, y, width, laneHeight);

        // Grid / Lane divider
        if (i < laneCount - 1) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([12, 10]);
          ctx.lineDashOffset = -particleOffset;
          ctx.beginPath();
          ctx.moveTo(0, y + laneHeight);
          ctx.lineTo(width, y + laneHeight);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Finish Line Checkered Pattern
        const finishX = width - 40;
        const checkSize = 6;
        for (let cy = y; cy < y + laneHeight; cy += checkSize) {
          for (let cx = finishX; cx < finishX + 16; cx += checkSize) {
            ctx.fillStyle = ((cx / checkSize + cy / checkSize) % 2 === 0) ? '#ffffff' : '#020617';
            ctx.fillRect(cx, cy, checkSize, checkSize);
          }
        }
      }

      // Draw Racers
      racers.forEach((racer, index) => {
        const y = index * laneHeight + laneHeight / 2;
        const startX = 65;
        const endX = width - 75;
        const currentX = startX + ((endX - startX) * Math.min(100, Math.max(0, racer.progress))) / 100;

        // Draw Player Name & WPM Tag
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillStyle = racer.isUser ? '#38bdf8' : '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(
          `${racer.isUser ? '⭐ YOU' : racer.name} [${racer.wpm} WPM]`,
          10,
          y - 8
        );

        // Draw Nitro Flames or Error Smoke
        if (racer.isNitro) {
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(currentX - 24 - Math.random() * 8, y, 6 + Math.random() * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(currentX - 18, y, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (racer.hasError) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.arc(currentX - 16, y - 4, 5, 0, Math.PI * 2);
          ctx.arc(currentX - 22, y - 8, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Car Body
        drawCar(ctx, currentX, y, racer.color, racer.isUser ?? false);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [racers]);

  // Procedural Futuristic Racing Car
  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isUser: boolean) => {
    ctx.save();
    ctx.translate(x, y);

    // Car Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels (4 sleek black tires)
    ctx.fillStyle = '#020617';
    ctx.fillRect(-14, -13, 8, 4);
    ctx.fillRect(8, -13, 8, 4);
    ctx.fillRect(-14, 9, 8, 4);
    ctx.fillRect(8, 9, 8, 4);

    // Main Chassis
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-16, -9, 34, 18, 5);
    ctx.fill();

    // Windshield (dark glass)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-4, -6, 12, 12, 3);
    ctx.fill();

    // Headlights (glowing cyan / yellow)
    ctx.fillStyle = isUser ? '#38bdf8' : '#f59e0b';
    ctx.shadowColor = isUser ? '#38bdf8' : '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.fillRect(16, -7, 2, 4);
    ctx.fillRect(16, 3, 2, 4);

    // User crown / accent
    if (isUser) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-2, -2, 4, 4);
    }

    ctx.restore();
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-[#0b0f19] shadow-2xl relative">
      <canvas ref={canvasRef} className="w-full block" />
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { ROAD_NODES, ROAD_EDGES, roadGraph } from '../game/world/RoadGraph';
import { NavPath } from '../game/types';
import { Maximize2 } from 'lucide-react';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  playerHeading: number;
  activePath: NavPath | null;
  targetCoords: [number, number] | null;
  currentDistrictName: string;
  onOpenFullMap: () => void;
}

const NODE_MAP = new Map<string, typeof ROAD_NODES[0]>();
ROAD_NODES.forEach((n) => NODE_MAP.set(n.id, n));

export const Minimap: React.FC<MinimapProps> = ({
  playerX,
  playerZ,
  playerHeading,
  activePath,
  targetCoords,
  currentDistrictName,
  onOpenFullMap
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const zoom = 0.55; // Pixels per meter

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Center on player
    ctx.translate(centerX, centerY);

    // Draw all road edges
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ROAD_EDGES.forEach((edge) => {
      const from = NODE_MAP.get(edge.from);
      const to = NODE_MAP.get(edge.to);
      if (from && to) {
        const x1 = (from.x - playerX) * zoom;
        const y1 = (from.z - playerZ) * zoom;
        const x2 = (to.x - playerX) * zoom;
        const y2 = (to.z - playerZ) * zoom;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });

    // Draw active GPS navigational route line (A* route)
    if (activePath && activePath.nodes.length > 1) {
      ctx.strokeStyle = '#10b981'; // Emerald route
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let i = 0; i < activePath.nodes.length; i++) {
        const n = activePath.nodes[i];
        const nx = (n.x - playerX) * zoom;
        const ny = (n.z - playerZ) * zoom;
        if (i === 0) ctx.moveTo(nx, ny);
        else ctx.lineTo(nx, ny);
      }
      ctx.stroke();
    }

    // Draw target marker
    if (targetCoords) {
      const tx = (targetCoords[0] - playerX) * zoom;
      const ty = (targetCoords[1] - playerZ) * zoom;

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(tx, ty, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw player rickshaw triangle
    ctx.fillStyle = '#ef4444'; // Red pointer
    ctx.save();
    ctx.rotate(playerHeading);
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.lineTo(-6, -7);
    ctx.lineTo(0, -4);
    ctx.lineTo(6, -7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // Outer subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  }, [playerX, playerZ, playerHeading, activePath, targetCoords]);

  return (
    <div className="relative group bg-slate-900/90 rounded-2xl border border-white/20 shadow-2xl p-2 backdrop-blur-none pointer-events-auto">
      <div className="flex items-center justify-between pb-1 px-1 border-b border-white/10 mb-1">
        <span className="text-[11px] font-bold text-amber-400 font-['Hind_Siliguri'] truncate max-w-[110px]">
          {currentDistrictName}
        </span>
        <button
          onClick={onOpenFullMap}
          className="text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
          title="Open Full Dhaka Map (M)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={140}
        height={140}
        className="rounded-xl w-[140px] h-[140px] block"
      />
    </div>
  );
};

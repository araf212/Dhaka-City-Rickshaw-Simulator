import React, { useRef, useEffect } from 'react';
import { ROAD_NODES, ROAD_EDGES, DHAKA_DISTRICTS } from '../game/world/RoadGraph';
import { DistrictId } from '../game/types';
import { X, Navigation, MapPin } from 'lucide-react';

interface FullMapModalProps {
  playerX: number;
  playerZ: number;
  onClose: () => void;
  onSelectDestination: (nodeId: string) => void;
  onFastTravel: (districtId: DistrictId) => void;
}

export const FullMapModal: React.FC<FullMapModalProps> = ({
  playerX,
  playerZ,
  onClose,
  onSelectDestination,
  onFastTravel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Map bounds: X from -220 to 220, Z from -240 to 240
    const scale = 0.95;
    const toScreenX = (x: number) => width / 2 + x * scale;
    const toScreenY = (z: number) => height / 2 + z * scale;

    // Draw district bounding zones with soft color fills
    Object.values(DHAKA_DISTRICTS).forEach((dist) => {
      const cx = toScreenX(dist.center[0]);
      const cy = toScreenY(dist.center[1]);

      ctx.fillStyle = `${dist.color}15`;
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `${dist.color}40`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // District label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dist.banglaName, cx, cy - 8);
      ctx.font = '600 11px sans-serif';
      ctx.fillStyle = dist.color;
      ctx.fillText(dist.name, cx, cy + 8);
    });

    // Draw road edges
    const nodeMap = new Map<string, typeof ROAD_NODES[0]>();
    ROAD_NODES.forEach((n) => nodeMap.set(n.id, n));

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ROAD_EDGES.forEach((edge) => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(toScreenX(from.x), toScreenY(from.z));
        ctx.lineTo(toScreenX(to.x), toScreenY(to.z));
        ctx.stroke();
      }
    });

    // Draw nodes
    ROAD_NODES.forEach((node) => {
      const sx = toScreenX(node.x);
      const sy = toScreenY(node.z);

      ctx.fillStyle = node.isIntersection ? '#f59e0b' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(sx, sy, node.isIntersection ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();

      if (node.isIntersection && node.name) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '10px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(node.name, sx + 8, sy + 3);
      }
    });

    // Draw player rickshaw marker
    const px = toScreenX(playerX);
    const py = toScreenY(playerZ);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('YOU (আপনি)', px + 12, py + 4);
  }, [playerX, playerZ]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scale = 0.95;
    const worldX = (clickX - canvas.width / 2) / scale;
    const worldZ = (clickY - canvas.height / 2) / scale;

    // Find nearest road node
    let nearest = ROAD_NODES[0];
    let minDist = Infinity;
    ROAD_NODES.forEach((n) => {
      const d = Math.hypot(n.x - worldX, n.z - worldZ);
      if (d < minDist) {
        minDist = d;
        nearest = n;
      }
    });

    if (nearest && minDist < 30) {
      onSelectDestination(nearest.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative bg-slate-900 border border-white/20 rounded-3xl w-full max-w-4xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Navigation className="w-6 h-6 text-emerald-400" />
              <span>ঢাকা সিটি রুট ম্যাপ</span>
              <span className="text-slate-400 text-sm font-normal">| Dhaka City Road Navigation</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any intersection to set GPS route, or select a district below to fast travel.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 flex justify-center items-center py-4 overflow-auto">
          <canvas
            ref={canvasRef}
            width={640}
            height={460}
            onClick={handleCanvasClick}
            className="rounded-2xl border border-white/10 shadow-inner cursor-crosshair max-w-full"
          />
        </div>

        {/* District Fast-Travel bar */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-amber-400" />
            Districts:
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.values(DHAKA_DISTRICTS).map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  onFastTravel(d.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-emerald-500/50 transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.banglaName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

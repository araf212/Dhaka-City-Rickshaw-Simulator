import React from 'react';
import { Bell, Camera, Map, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileControlsProps {
  onInput: (action: 'forward' | 'backward' | 'left' | 'right' | 'brake', pressed: boolean) => void;
  onRingBell: () => void;
  onToggleCamera: () => void;
  onOpenMap: () => void;
  onResetRickshaw: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onInput,
  onRingBell,
  onToggleCamera,
  onOpenMap,
  onResetRickshaw
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 select-none">
      {/* Top quick actions */}
      <div className="flex justify-end gap-2 pointer-events-auto">
        <button
          onClick={onResetRickshaw}
          className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 text-white flex items-center justify-center active:scale-95 transition"
          title="Reset Rickshaw"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </button>
        <button
          onClick={onToggleCamera}
          className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 text-white flex items-center justify-center active:scale-95 transition"
          title="Toggle Camera View (C)"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
        </button>
        <button
          onClick={onOpenMap}
          className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/20 text-white flex items-center justify-center active:scale-95 transition"
          title="Open Map (M)"
        >
          <Map className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* Bottom driving controls */}
      <div className="flex justify-between items-end pb-2">
        {/* Left: Steering D-Pad */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onTouchStart={(e) => { e.preventDefault(); onInput('left', true); }}
            onTouchEnd={() => onInput('left', false)}
            onMouseDown={() => onInput('left', true)}
            onMouseUp={() => onInput('left', false)}
            className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/20 text-white flex items-center justify-center active:bg-amber-500 active:text-slate-950 active:scale-95 transition shadow-xl"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onInput('right', true); }}
            onTouchEnd={() => onInput('right', false)}
            onMouseDown={() => onInput('right', true)}
            onMouseUp={() => onInput('right', false)}
            className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-white/20 text-white flex items-center justify-center active:bg-amber-500 active:text-slate-950 active:scale-95 transition shadow-xl"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

        {/* Right: Pedal, Brake, Bell */}
        <div className="flex items-end gap-3 pointer-events-auto">
          {/* Bell & Reverse Column */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onRingBell}
              className="w-13 h-13 rounded-2xl bg-amber-500/90 border border-amber-300 text-slate-950 flex flex-col items-center justify-center active:scale-90 transition shadow-lg"
              title="Ring Bell (B)"
            >
              <Bell className="w-5 h-5 fill-slate-950" />
              <span className="text-[9px] font-black uppercase">ট্রিং</span>
            </button>
            <button
              onTouchStart={(e) => { e.preventDefault(); onInput('backward', true); }}
              onTouchEnd={() => onInput('backward', false)}
              onMouseDown={() => onInput('backward', true)}
              onMouseUp={() => onInput('backward', false)}
              className="w-13 h-13 rounded-2xl bg-slate-900/80 border border-white/20 text-slate-300 flex flex-col items-center justify-center active:bg-slate-700 active:scale-95 transition shadow-lg"
              title="Reverse Push"
            >
              <ArrowDown className="w-5 h-5" />
              <span className="text-[9px] font-bold">REV</span>
            </button>
          </div>

          {/* Brake Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onInput('brake', true); }}
            onTouchEnd={() => onInput('brake', false)}
            onMouseDown={() => onInput('brake', true)}
            onMouseUp={() => onInput('brake', false)}
            className="w-16 h-16 rounded-2xl bg-rose-600/90 border border-rose-400 text-white flex flex-col items-center justify-center active:scale-95 transition shadow-xl font-bold"
          >
            <span className="text-xs uppercase tracking-wider">ব্রেক</span>
            <span className="text-[9px] text-rose-200">BRAKE</span>
          </button>

          {/* Large Pedal Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onInput('forward', true); }}
            onTouchEnd={() => onInput('forward', false)}
            onMouseDown={() => onInput('forward', true)}
            onMouseUp={() => onInput('forward', false)}
            className="w-20 h-20 rounded-3xl bg-emerald-500 border-2 border-emerald-300 text-slate-950 flex flex-col items-center justify-center active:bg-emerald-400 active:scale-95 transition shadow-2xl font-black"
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
            <span className="text-xs font-black tracking-tight">প্যাডেল</span>
          </button>
        </div>
      </div>
    </div>
  );
};

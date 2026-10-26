import React, { useEffect } from 'react';
import { Play, Compass, ShieldCheck, Sparkles, Navigation } from 'lucide-react';

interface GameShellProps {
  onStartGame: (mode: 'career' | 'freeroam') => void;
  onOpenGarage: () => void;
}

export const GameShell: React.FC<GameShellProps> = ({ onStartGame, onOpenGarage }) => {
  // Listen for Enter / Space to start immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onStartGame('career');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-6 sm:p-12 select-none bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>MRT Line 6 & Dhaka Road Graph Active</span>
        </div>

        <button
          onClick={onOpenGarage}
          className="px-4 py-2 rounded-xl bg-slate-900/80 border border-white/20 text-amber-400 hover:text-white hover:bg-slate-800 transition text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Sparkles className="w-4 h-4" />
          <span>Workshop & Art (গ্যারেজ)</span>
        </button>
      </div>

      {/* Hero Centerpiece: Bespoke Title Lockup */}
      <div className="max-w-2xl my-auto">
        {/* Bespoke SVG Title Lockup */}
        <div className="mb-4">
          <svg viewBox="0 0 520 120" className="w-full max-w-[460px] h-auto drop-shadow-2xl">
            {/* Background Rickshaw Decorative Ribbon */}
            <path
              d="M 10 95 Q 260 85 510 95 L 490 115 Q 260 105 30 115 Z"
              fill="#059669"
              opacity="0.8"
            />
            {/* Bengali Calligraphy Main Title */}
            <text
              x="260"
              y="55"
              textAnchor="middle"
              className="font-black text-amber-400"
              style={{
                fontFamily: "'Hind Siliguri', sans-serif",
                fontSize: '44px',
                fontWeight: 800,
                fill: '#facc15'
              }}
            >
              ঢাকা সিটি রিকশা
            </text>
            {/* Subtitle English */}
            <text
              x="260"
              y="85"
              textAnchor="middle"
              className="tracking-[0.25em] font-extrabold"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '18px',
                letterSpacing: '0.22em',
                fill: '#f8fafc'
              }}
            >
              DHAKA RICKSHAW SIMULATOR
            </text>
          </svg>
        </div>

        <p className="text-slate-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-normal">
          Drive through authentic connected districts of Dhaka — Dhanmondi, Shahbagh, Farmgate, Old Dhaka & Gulshan. Experience realistic pedal mechanics, passenger fares, green CNG traffic, and elevated Metro Rail overhead.
        </p>

        {/* Start CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onStartGame('career')}
            className="group px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition-all shadow-xl hover:shadow-amber-500/25 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950 group-hover:scale-110 transition-transform" />
            <span>যাত্রী সেবা শুরু করুন (Start Career)</span>
          </button>

          <button
            onClick={() => onStartGame('freeroam')}
            className="px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 font-bold text-base transition flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
          >
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>মুক্ত রাইড (Free Roam)</span>
          </button>
        </div>

        {/* Subtext CTA shortcut */}
        <p className="text-xs text-amber-400/80 mt-3 font-mono">
          Press <strong className="text-white bg-slate-800 px-2 py-0.5 rounded border border-white/10">SPACE</strong> or <strong className="text-white bg-slate-800 px-2 py-0.5 rounded border border-white/10">ENTER</strong> to ride
        </p>
      </div>

      {/* Flat Control-Hint Line across Bottom */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-amber-400 font-bold">CONTROLS:</span>
          <span>WASD / Arrows Steer & Pedal</span>
          <span className="text-slate-600">·</span>
          <span>B Ring Bell</span>
          <span className="text-slate-600">·</span>
          <span>Space Brake / Accept</span>
          <span className="text-slate-600">·</span>
          <span>C Camera</span>
          <span className="text-slate-600">·</span>
          <span>M Map</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          5 Connected Districts · 100% Procedural WebGL & Web Audio
        </div>
      </div>
    </div>
  );
};

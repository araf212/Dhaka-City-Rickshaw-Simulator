import React, { useState } from 'react';
import { gameState } from '../game/state/GameState';
import { soundManager } from '../game/audio/SoundManager';
import { Play, RotateCcw, Home, Volume2, Shield, Eye, Smartphone, Keyboard, X } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnToTitle: () => void;
  onSettingsChanged: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onReturnToTitle,
  onSettingsChanged
}) => {
  const [quality, setQuality] = useState(gameState.settings.graphicsQuality);
  const [density, setDensity] = useState(gameState.settings.trafficDensity);
  const [soundVol, setSoundVol] = useState(gameState.settings.soundVolume);
  const [touchControls, setTouchControls] = useState(gameState.settings.touchControls);

  const handleQualityChange = (q: 'low' | 'medium' | 'high') => {
    gameState.settings.graphicsQuality = q;
    gameState.saveToStorage();
    setQuality(q);
    onSettingsChanged();
  };

  const handleDensityChange = (d: 'sparse' | 'normal' | 'dense') => {
    gameState.settings.trafficDensity = d;
    gameState.saveToStorage();
    setDensity(d);
    onSettingsChanged();
  };

  const handleTouchToggle = (enabled: boolean) => {
    gameState.settings.touchControls = enabled;
    gameState.saveToStorage();
    setTouchControls(enabled);
    onSettingsChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative bg-slate-900 border border-white/20 rounded-3xl w-full max-w-xl p-6 shadow-2xl flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-black text-white">খেলা বিরতি (PAUSED)</h2>
            <p className="text-xs text-slate-400">Dhaka City Rickshaw Simulator Settings</p>
          </div>
          <button
            onClick={onResume}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings options */}
        <div className="space-y-4 text-sm">
          {/* Graphics Quality */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Graphics Quality (গ্রাফিক্স মান):</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                    quality === q ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Traffic Density */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Traffic Density (যানবাহনের ঘনত্ব):</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['sparse', 'normal', 'dense'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDensityChange(d)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                    density === d ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* On-screen touch controls */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-white/10">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-xs font-bold text-white block">Mobile Touch Controls</span>
                <span className="text-[11px] text-slate-400">Show on-screen pedals and steering buttons</span>
              </div>
            </div>
            <button
              onClick={() => handleTouchToggle(!touchControls)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                touchControls ? 'bg-sky-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {touchControls ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Controls hint reminder */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-white/10 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Keyboard className="w-4 h-4" /> PC Keyboard Controls:
            </span>
            <p className="text-[11px] text-slate-400">
              <strong className="text-white">W / Up</strong> Pedal · <strong className="text-white">A / D</strong> Steer · <strong className="text-white">S / Down</strong> Brake/Reverse · <strong className="text-white">B</strong> Bell · <strong className="text-white">C</strong> Camera · <strong className="text-white">M</strong> Route Map
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Resume Game (খেলা চালিয়ে যান)</span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRestart}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset Position</span>
            </button>
            <button
              onClick={onReturnToTitle}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-sky-400" />
              <span>Title Screen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

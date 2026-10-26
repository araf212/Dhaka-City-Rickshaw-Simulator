import React, { useState } from 'react';
import { CameraMode, WeatherPreset, PassengerMission, DistrictId } from '../game/types';
import { Minimap } from './Minimap';
import { NavPath } from '../game/types';
import {
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Camera,
  Bell,
  Coins,
  Wrench,
  Settings,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  Navigation
} from 'lucide-react';

interface HUDOverlayProps {
  speedKmh: number;
  cashTaka: number;
  currentDistrictName: string;
  currentDistrictBangla: string;
  cameraMode: CameraMode;
  weatherPreset: WeatherPreset;
  isMuted: boolean;
  activeMission: PassengerMission | null;
  pendingOffer: PassengerMission | null;
  canPickup: boolean;
  canDropoff: boolean;
  distanceToTarget: number;
  playerX: number;
  playerZ: number;
  playerHeading: number;
  activePath: NavPath | null;
  onSetCameraMode: (mode: CameraMode) => void;
  onSetWeatherPreset: (preset: WeatherPreset) => void;
  onToggleMute: () => void;
  onRingBell: () => void;
  onAcceptMission: () => void;
  onDropoffPassenger: () => void;
  onOpenGarage: () => void;
  onOpenSettings: () => void;
  onOpenFullMap: () => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  speedKmh,
  cashTaka,
  currentDistrictName,
  currentDistrictBangla,
  cameraMode,
  weatherPreset,
  isMuted,
  activeMission,
  pendingOffer,
  canPickup,
  canDropoff,
  distanceToTarget,
  playerX,
  playerZ,
  playerHeading,
  activePath,
  onSetCameraMode,
  onSetWeatherPreset,
  onToggleMute,
  onRingBell,
  onAcceptMission,
  onDropoffPassenger,
  onOpenGarage,
  onOpenSettings,
  onOpenFullMap
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const targetCoords: [number, number] | null = activeMission
    ? activeMission.dropCoords
    : pendingOffer
    ? pendingOffer.pickupCoords
    : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none font-sans">
      {/* Top Bar: Left (Speed & District) and Right (Cash & Quick Actions) */}
      <div className="flex justify-between items-start gap-4">
        {/* Left Cluster */}
        <div className="flex items-center gap-3">
          {/* Speedometer cluster */}
          <div className="bg-slate-900/90 border border-white/20 rounded-2xl p-3 shadow-xl pointer-events-auto flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tabular-nums tracking-tight">
              {Math.abs(speedKmh).toFixed(0)}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">KM/H</span>
              <span className="text-[10px] font-semibold text-emerald-400">গতি</span>
            </div>
          </div>

          {/* District Name Badge */}
          <div className="bg-slate-900/90 border border-white/20 rounded-2xl px-4 py-2.5 shadow-xl pointer-events-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentDistrictName}</span>
            </div>
            <div className="text-base font-bold text-white font-['Hind_Siliguri']">
              {currentDistrictBangla}
            </div>
          </div>
        </div>

        {/* Right Cluster */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Cash Taka readout */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400/80 block leading-none">টাকা</span>
              <span className="text-lg font-black text-white font-mono tabular-nums leading-tight">
                ৳ {cashTaka}
              </span>
            </div>
          </div>

          {/* Garage Shop Button */}
          <button
            onClick={onOpenGarage}
            className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-white/20 text-amber-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center shadow-xl cursor-pointer"
            title="Rickshaw Garage & Art Workshop"
          >
            <Wrench className="w-5 h-5" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-white/20 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-center shadow-xl cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-white/20 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center justify-center shadow-xl cursor-pointer"
            title="Settings & Controls"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Middle: Mission Passenger Prompt Banner */}
      <div className="flex justify-center pointer-events-none my-auto">
        {canPickup && pendingOffer && !activeMission && (
          <div className="bg-slate-900/95 border-2 border-amber-400 rounded-2xl p-4 shadow-2xl max-w-md w-full pointer-events-auto transform animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                  যাত্রী ডাকছে (Passenger Request)
                </span>
                <p className="text-base font-bold text-white font-['Hind_Siliguri'] mt-0.5">
                  "{pendingOffer.dialogueBengali}"
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{pendingOffer.dialogueEnglish}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-emerald-400 font-mono">
                  ৳{pendingOffer.fareTaka}
                </span>
                <span className="block text-[10px] text-slate-400">+{pendingOffer.tipPotential} বকশিশ</span>
              </div>
            </div>
            <button
              onClick={onAcceptMission}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ভাড়া নিন (Accept Fare)</span>
              <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded font-mono">[SPACE / TAP]</span>
            </button>
          </div>
        )}

        {activeMission && (
          <div className="bg-slate-900/95 border border-emerald-500/50 rounded-2xl px-5 py-3 shadow-2xl pointer-events-auto flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Destination:</span>
                <span className="text-sm font-bold text-white font-['Hind_Siliguri']">
                  {activeMission.dropLandmark}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs">
                <span className="text-emerald-400 font-mono font-bold">
                  {distanceToTarget}m away
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  Fare: ৳{activeMission.fareTaka}
                </span>
              </div>
            </div>

            {canDropoff && (
              <button
                onClick={onDropoffPassenger}
                className="ml-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>নামিয়ে দিন (Drop Off)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Area: Minimap on Bottom-Right + Unified Collapsible Dock in Center */}
      <div className="relative flex justify-between items-end">
        {/* Left: Quick Bell trigger for PC */}
        <div className="hidden sm:block pointer-events-auto">
          <button
            onClick={onRingBell}
            className="px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-white/20 text-amber-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2 shadow-xl cursor-pointer"
          >
            <Bell className="w-4 h-4 fill-amber-400" />
            <span className="text-xs font-bold">ঘণ্টা বাজান (B)</span>
          </button>
        </div>

        {/* Center: Unified Collapsible Bottom Dock (Zero Viewport Occlusion compliant!) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-auto max-w-[94vw] flex flex-col items-center">
          {/* Collapse Toggle Tab */}
          <button
            onClick={() => setDockCollapsed(!dockCollapsed)}
            className="px-4 py-1 rounded-t-xl bg-slate-900/90 border-t border-x border-white/20 text-slate-400 hover:text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition shadow-md"
          >
            {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{dockCollapsed ? 'Controls' : 'Hide'}</span>
          </button>

          {/* Dock Body */}
          {!dockCollapsed && (
            <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3">
              {/* Weather Presets */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => onSetWeatherPreset('sunny')}
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                    weatherPreset === 'sunny' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Sunny Day"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSetWeatherPreset('golden_hour')}
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                    weatherPreset === 'golden_hour' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Golden Afternoon"
                >
                  <Sunset className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSetWeatherPreset('neon_night')}
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                    weatherPreset === 'neon_night' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Dhaka Neon Night"
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSetWeatherPreset('monsoon_rain')}
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                    weatherPreset === 'monsoon_rain' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Monsoon Rain (বর্ষা)"
                >
                  <CloudRain className="w-4 h-4" />
                </button>
              </div>

              <div className="w-[1px] h-6 bg-white/10" />

              {/* Camera Views */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => onSetCameraMode('chase')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    cameraMode === 'chase' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Chase
                </button>
                <button
                  onClick={() => onSetCameraMode('first_person')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    cameraMode === 'first_person' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rider
                </button>
                <button
                  onClick={() => onSetCameraMode('tactical')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    cameraMode === 'tactical' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Drone
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: GPS Minimap */}
        <div className="pointer-events-auto">
          <Minimap
            playerX={playerX}
            playerZ={playerZ}
            playerHeading={playerHeading}
            activePath={activePath}
            targetCoords={targetCoords}
            currentDistrictName={currentDistrictName}
            onOpenFullMap={onOpenFullMap}
          />
        </div>
      </div>
    </div>
  );
};

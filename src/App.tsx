/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameShell } from './components/GameShell';
import { HUDOverlay } from './components/HUDOverlay';
import { MobileControls } from './components/MobileControls';
import { GarageModal } from './components/GarageModal';
import { FullMapModal } from './components/FullMapModal';
import { PauseMenu } from './components/PauseMenu';
import { CameraMode, WeatherPreset, DistrictId, RickshawCustomization } from './game/types';
import { gameState } from './game/state/GameState';
import { soundManager } from './game/audio/SoundManager';
import { DHAKA_DISTRICTS } from './game/world/RoadGraph';

type GameScreen = 'title' | 'playing' | 'paused' | 'garage' | 'map';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [cameraMode, setCameraMode] = useState<CameraMode>('chase');
  const [weatherPreset, setWeatherPreset] = useState<WeatherPreset>('sunny');
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [cashTaka, setCashTaka] = useState(gameState.stats.moneyTaka);

  // Telemetry updated from simulation loop
  const [telemetry, setTelemetry] = useState<{
    speedKmh: number;
    playerX: number;
    playerZ: number;
    playerHeading: number;
    districtId: DistrictId;
    districtName: string;
    districtBangla: string;
    canPickup: boolean;
    canDropoff: boolean;
    distanceToTarget: number;
    activePath: any;
    activeMission: any;
    pendingOffer: any;
  }>({
    speedKmh: 0,
    playerX: 0,
    playerZ: 0,
    playerHeading: 0,
    districtId: 'shahbagh',
    districtName: 'Shahbagh & TSC',
    districtBangla: 'শাহবাগ ও টিএসসি',
    canPickup: false,
    canDropoff: false,
    distanceToTarget: 0,
    activePath: null,
    activeMission: null,
    pendingOffer: null
  });

  // Mobile / touch mode detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // References for zero-latency continuous inputs
  const gameInputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    bellTrigger: false
  });

  const physicsRef = useRef<any>(null);
  const missionRef = useRef<any>(null);
  const weatherRef = useRef<any>(null);

  // Check touch support on mount
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch || gameState.settings.touchControls);
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input elements
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const code = e.code;

      if (code === 'KeyW' || code === 'ArrowUp') {
        gameInputRef.current.forward = true;
      }
      if (code === 'KeyS' || code === 'ArrowDown') {
        gameInputRef.current.backward = true;
      }
      if (code === 'KeyA' || code === 'ArrowLeft') {
        gameInputRef.current.left = true;
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        gameInputRef.current.right = true;
      }
      if (code === 'Space') {
        gameInputRef.current.brake = true;
        // Also trigger mission accept/dropoff if near beacon
        if (screen === 'playing') {
          if (telemetry.canPickup) {
            handleAcceptMission();
          } else if (telemetry.canDropoff) {
            handleDropoffPassenger();
          }
        }
      }
      if (code === 'KeyB') {
        gameInputRef.current.bellTrigger = true;
      }
      if (code === 'KeyC') {
        setCameraMode((prev) => (prev === 'chase' ? 'first_person' : prev === 'first_person' ? 'tactical' : 'chase'));
      }
      if (code === 'KeyM') {
        setScreen((prev) => (prev === 'map' ? 'playing' : 'map'));
      }
      if (code === 'Escape') {
        if (screen === 'playing') setScreen('paused');
        else if (screen === 'paused' || screen === 'map' || screen === 'garage') setScreen('playing');
      }
      if (code === 'KeyR') {
        handleResetRickshaw();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') gameInputRef.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') gameInputRef.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') gameInputRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') gameInputRef.current.right = false;
      if (code === 'Space') gameInputRef.current.brake = false;
    };

    const handleBlur = () => {
      // Clear held keys on window blur to avoid stuck input
      gameInputRef.current.forward = false;
      gameInputRef.current.backward = false;
      gameInputRef.current.left = false;
      gameInputRef.current.right = false;
      gameInputRef.current.brake = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [screen, telemetry.canPickup, telemetry.canDropoff]);

  const handleStartGame = (mode: 'career' | 'freeroam') => {
    soundManager.ringRickshawBell('double_ding');
    setScreen('playing');
  };

  const handleRingBell = useCallback(() => {
    gameInputRef.current.bellTrigger = true;
  }, []);

  const handleAcceptMission = useCallback(() => {
    if (missionRef.current) {
      const ok = missionRef.current.acceptPassenger();
      if (ok) {
        soundManager.ringRickshawBell(gameState.customization.bellType);
      }
    }
  }, []);

  const handleDropoffPassenger = useCallback(() => {
    if (missionRef.current) {
      const result = missionRef.current.completeMission();
      if (result) {
        gameState.addMoney(result.fareEarned + result.tipEarned);
        setCashTaka(gameState.stats.moneyTaka);
      }
    }
  }, []);

  const handleResetRickshaw = useCallback(() => {
    if (physicsRef.current) {
      const currentDist = DHAKA_DISTRICTS[telemetry.districtId];
      physicsRef.current.resetPosition(currentDist.center[0], currentDist.center[1]);
    }
  }, [telemetry.districtId]);

  const handleFastTravel = useCallback((districtId: DistrictId) => {
    const dist = DHAKA_DISTRICTS[districtId];
    if (dist && physicsRef.current) {
      physicsRef.current.resetPosition(dist.center[0], dist.center[1]);
      soundManager.ringRickshawBell('classic_brass');
    }
  }, []);

  const handleCustomizationChanged = useCallback((custom: RickshawCustomization) => {
    if (physicsRef.current) {
      physicsRef.current.updateCustomization(custom);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  }, [isMuted]);

  const handleMobileInput = useCallback((action: 'forward' | 'backward' | 'left' | 'right' | 'brake', pressed: boolean) => {
    gameInputRef.current[action] = pressed;
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas
        isPlaying={screen === 'playing'}
        cameraMode={cameraMode}
        weatherPreset={weatherPreset}
        onTelemetryUpdate={setTelemetry}
        gameInputRef={gameInputRef}
        physicsRef={physicsRef}
        missionRef={missionRef}
        weatherRef={weatherRef}
      />

      {/* Screen 1: Title Screen / Shell */}
      {screen === 'title' && (
        <GameShell
          onStartGame={handleStartGame}
          onOpenGarage={() => setScreen('garage')}
        />
      )}

      {/* Screen 2: Playing HUD */}
      {screen === 'playing' && (
        <>
          <HUDOverlay
            speedKmh={telemetry.speedKmh}
            cashTaka={cashTaka}
            currentDistrictName={telemetry.districtName}
            currentDistrictBangla={telemetry.districtBangla}
            cameraMode={cameraMode}
            weatherPreset={weatherPreset}
            isMuted={isMuted}
            activeMission={telemetry.activeMission}
            pendingOffer={telemetry.pendingOffer}
            canPickup={telemetry.canPickup}
            canDropoff={telemetry.canDropoff}
            distanceToTarget={telemetry.distanceToTarget}
            playerX={telemetry.playerX}
            playerZ={telemetry.playerZ}
            playerHeading={telemetry.playerHeading}
            activePath={telemetry.activePath}
            onSetCameraMode={setCameraMode}
            onSetWeatherPreset={setWeatherPreset}
            onToggleMute={handleToggleMute}
            onRingBell={handleRingBell}
            onAcceptMission={handleAcceptMission}
            onDropoffPassenger={handleDropoffPassenger}
            onOpenGarage={() => setScreen('garage')}
            onOpenSettings={() => setScreen('paused')}
            onOpenFullMap={() => setScreen('map')}
          />

          {/* On-Screen Mobile Touch Controls when on mobile / enabled */}
          {(isTouchDevice || gameState.settings.touchControls) && (
            <MobileControls
              onInput={handleMobileInput}
              onRingBell={handleRingBell}
              onToggleCamera={() =>
                setCameraMode((prev) => (prev === 'chase' ? 'first_person' : prev === 'first_person' ? 'tactical' : 'chase'))
              }
              onOpenMap={() => setScreen('map')}
              onResetRickshaw={handleResetRickshaw}
            />
          )}
        </>
      )}

      {/* Modal: Pause & Settings */}
      {screen === 'paused' && (
        <PauseMenu
          onResume={() => setScreen('playing')}
          onRestart={handleResetRickshaw}
          onReturnToTitle={() => setScreen('title')}
          onSettingsChanged={() => {
            setIsTouchDevice(gameState.settings.touchControls);
          }}
        />
      )}

      {/* Modal: Garage / Workshop */}
      {screen === 'garage' && (
        <GarageModal
          onClose={() => setScreen('playing')}
          onCustomizationChanged={handleCustomizationChanged}
        />
      )}

      {/* Modal: Full Dhaka Road Map */}
      {screen === 'map' && (
        <FullMapModal
          playerX={telemetry.playerX}
          playerZ={telemetry.playerZ}
          onClose={() => setScreen('playing')}
          onSelectDestination={(nodeId) => {
            // Set navigation route
          }}
          onFastTravel={handleFastTravel}
        />
      )}
    </div>
  );
}

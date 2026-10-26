import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraMode, WeatherPreset, DistrictId } from '../game/types';
import { ProceduralCity } from '../game/world/ProceduralCity';
import { MetroSystem } from '../game/world/MetroSystem';
import { TrafficManager } from '../game/world/TrafficManager';
import { PedestrianManager } from '../game/world/PedestrianManager';
import { WeatherSystem } from '../game/world/WeatherSystem';
import { RickshawPhysics } from '../game/physics/RickshawPhysics';
import { MissionManager } from '../game/missions/MissionManager';
import { DHAKA_DISTRICTS, roadGraph } from '../game/world/RoadGraph';
import { gameState } from '../game/state/GameState';

interface GameCanvasProps {
  isPlaying: boolean;
  cameraMode: CameraMode;
  weatherPreset: WeatherPreset;
  onTelemetryUpdate: (data: {
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
  }) => void;
  gameInputRef: React.MutableRefObject<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    brake: boolean;
    bellTrigger: boolean;
  }>;
  physicsRef: React.MutableRefObject<RickshawPhysics | null>;
  missionRef: React.MutableRefObject<MissionManager | null>;
  weatherRef: React.MutableRefObject<WeatherSystem | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPlaying,
  cameraMode,
  weatherPreset,
  onTelemetryUpdate,
  gameInputRef,
  physicsRef,
  missionRef,
  weatherRef
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 700);
    camera.position.set(0, 15, -25);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Procedural Studio Environment Reflection
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback', e);
    }

    // 3. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x166534, 0.8);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    dirLight.position.set(40, 60, 30);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 5;
      dirLight.shadow.camera.far = 160;
      const d = 45;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    scene.add(dirLight);

    // 4. World Modules
    const city = new ProceduralCity();
    scene.add(city.group);

    const metro = new MetroSystem();
    scene.add(metro.group);

    const traffic = new TrafficManager(gameState.settings.trafficDensity);
    scene.add(traffic.group);

    const pedestrians = new PedestrianManager(26);
    scene.add(pedestrians.group);

    const weather = new WeatherSystem(scene, dirLight, hemiLight);
    weather.applyPreset(weatherPreset);
    weatherRef.current = weather;

    const rickshaw = new RickshawPhysics(gameState.customization);
    scene.add(rickshaw.mesh);
    physicsRef.current = rickshaw;

    const missions = new MissionManager();
    missions.attachToRickshaw(rickshaw.mesh);
    scene.add(missions.group);
    missionRef.current = missions;

    // 5. Game Loop & Pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let titlePanAngle = 0;

    // Software GL pacing function
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const _camTarget = new THREE.Vector3();
    const _camOffset = new THREE.Vector3();

    function tick() {
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      const inputs = gameInputRef.current;
      if (inputs.bellTrigger) {
        inputs.bellTrigger = false;
        rickshaw.ringBell(gameState.customization.bellType);
      }

      if (isPlaying) {
        // Update Rickshaw Physics
        rickshaw.update(dt, inputs, city.colliders);

        // Update Metro Rail & Traffic
        metro.update(dt, rickshaw.position);
        traffic.update(dt, rickshaw.position);
        pedestrians.update(dt);
        weather.update(dt, rickshaw.position);

        // Update Missions & Target beacons
        const missionStatus = missions.update(dt, rickshaw.position);

        // Camera Follow Logic
        if (cameraMode === 'chase') {
          // Smooth 3rd person chase camera behind rickshaw
          const dist = 6.2;
          const height = 2.8;
          const targetCamX = rickshaw.position.x - Math.sin(rickshaw.heading) * dist;
          const targetCamZ = rickshaw.position.z - Math.cos(rickshaw.heading) * dist;
          const targetCamY = rickshaw.position.y + height;

          camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 6, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 6, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 6, dt);

          _camTarget.set(
            rickshaw.position.x + Math.sin(rickshaw.heading) * 3,
            rickshaw.position.y + 1.2,
            rickshaw.position.z + Math.cos(rickshaw.heading) * 3
          );
          camera.lookAt(_camTarget);
        } else if (cameraMode === 'first_person') {
          // First person rider handlebar view
          const eyeX = rickshaw.position.x + Math.sin(rickshaw.heading) * 0.4;
          const eyeZ = rickshaw.position.z + Math.cos(rickshaw.heading) * 0.4;
          camera.position.set(eyeX, rickshaw.position.y + 1.5, eyeZ);

          _camTarget.set(
            eyeX + Math.sin(rickshaw.heading) * 10,
            rickshaw.position.y + 1.35,
            eyeZ + Math.cos(rickshaw.heading) * 10
          );
          camera.lookAt(_camTarget);
        } else {
          // Tactical Drone birds-eye view
          camera.position.set(rickshaw.position.x, 38, rickshaw.position.z - 15);
          camera.lookAt(rickshaw.position.x, 0, rickshaw.position.z);
        }

        // Determine current district by proximity to district centers
        let currentDistId: DistrictId = 'shahbagh';
        let minDist = Infinity;
        for (const dist of Object.values(DHAKA_DISTRICTS)) {
          const d = Math.hypot(rickshaw.position.x - dist.center[0], rickshaw.position.z - dist.center[1]);
          if (d < minDist) {
            minDist = d;
            currentDistId = dist.id;
          }
        }
        const distInfo = DHAKA_DISTRICTS[currentDistId];

        // Telemetry update to HUD
        onTelemetryUpdate({
          speedKmh: rickshaw.speed * 3.6,
          playerX: rickshaw.position.x,
          playerZ: rickshaw.position.z,
          playerHeading: rickshaw.heading,
          districtId: currentDistId,
          districtName: distInfo.name,
          districtBangla: distInfo.banglaName,
          canPickup: missionStatus.canPickup,
          canDropoff: missionStatus.canDropoff,
          distanceToTarget: missionStatus.distanceToTarget,
          activePath: missions.activeMission
            ? roadGraph.findRouteByCoords(
                rickshaw.position.x,
                rickshaw.position.z,
                missions.activeMission.dropCoords[0],
                missions.activeMission.dropCoords[1]
              )
            : null,
          activeMission: missions.activeMission,
          pendingOffer: missions.pendingOffer
        });
      } else {
        // Atmospheric live cinematic camera pan for Title Screen
        titlePanAngle += dt * 0.15;
        const panRadius = 75;
        camera.position.set(
          Math.sin(titlePanAngle) * panRadius,
          18 + Math.sin(titlePanAngle * 0.5) * 5,
          Math.cos(titlePanAngle) * panRadius + 40
        );
        camera.lookAt(0, 6, 80); // Focusing toward Farmgate / Metro corridor

        metro.update(dt, camera.position);
        traffic.update(dt, camera.position);
        pedestrians.update(dt);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    // Handle Window Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update weather whenever preset prop changes
  useEffect(() => {
    if (weatherRef.current) {
      weatherRef.current.applyPreset(weatherPreset);
    }
  }, [weatherPreset]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950" />;
};

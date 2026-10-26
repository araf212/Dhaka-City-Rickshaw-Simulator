import * as THREE from 'three';
import { WeatherPreset } from '../types';
import { soundManager } from '../audio/SoundManager';

export class WeatherSystem {
  public currentPreset: WeatherPreset = 'sunny';
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private scene: THREE.Scene;
  private rainParticles: THREE.Points | null = null;
  private rainCoords: Float32Array | null = null;

  constructor(scene: THREE.Scene, dirLight: THREE.DirectionalLight, hemiLight: THREE.HemisphereLight) {
    this.scene = scene;
    this.dirLight = dirLight;
    this.hemiLight = hemiLight;

    this.setupRainSystem();
    this.applyPreset('sunny');
  }

  private setupRainSystem() {
    const rainCount = 1800;
    const geometry = new THREE.BufferGeometry();
    this.rainCoords = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      this.rainCoords[i * 3] = (Math.random() - 0.5) * 160;
      this.rainCoords[i * 3 + 1] = Math.random() * 45;
      this.rainCoords[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.rainCoords, 3));

    const material = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0.65
    });

    this.rainParticles = new THREE.Points(geometry, material);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  public applyPreset(preset: WeatherPreset) {
    this.currentPreset = preset;

    if (preset === 'sunny') {
      this.scene.background = new THREE.Color(0x7dd3fc); // Sky blue
      this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.005);
      this.dirLight.color.setHex(0xfffbeb);
      this.dirLight.intensity = 1.4;
      this.hemiLight.color.setHex(0x93c5fd);
      this.hemiLight.groundColor.setHex(0x166534);
      this.hemiLight.intensity = 0.8;
      if (this.rainParticles) this.rainParticles.visible = false;
      soundManager.setRainIntensity(0);
    } else if (preset === 'golden_hour') {
      this.scene.background = new THREE.Color(0xfdba74); // Warm amber
      this.scene.fog = new THREE.FogExp2(0xfed7aa, 0.006);
      this.dirLight.color.setHex(0xfb923c);
      this.dirLight.intensity = 1.6;
      this.hemiLight.color.setHex(0xfde047);
      this.hemiLight.groundColor.setHex(0x9a3412);
      this.hemiLight.intensity = 0.7;
      if (this.rainParticles) this.rainParticles.visible = false;
      soundManager.setRainIntensity(0);
    } else if (preset === 'neon_night') {
      this.scene.background = new THREE.Color(0x090d16); // Deep night navy
      this.scene.fog = new THREE.FogExp2(0x0f172a, 0.007);
      this.dirLight.color.setHex(0x38bdf8);
      this.dirLight.intensity = 0.35;
      this.hemiLight.color.setHex(0x1e293b);
      this.hemiLight.groundColor.setHex(0x020617);
      this.hemiLight.intensity = 0.4;
      if (this.rainParticles) this.rainParticles.visible = false;
      soundManager.setRainIntensity(0);
    } else if (preset === 'monsoon_rain') {
      this.scene.background = new THREE.Color(0x475569); // Overcast monsoon slate
      this.scene.fog = new THREE.FogExp2(0x64748b, 0.009);
      this.dirLight.color.setHex(0x94a3b8);
      this.dirLight.intensity = 0.6;
      this.hemiLight.color.setHex(0x64748b);
      this.hemiLight.groundColor.setHex(0x1e293b);
      this.hemiLight.intensity = 0.5;
      if (this.rainParticles) this.rainParticles.visible = true;
      soundManager.setRainIntensity(1.0);
    }
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    if (this.currentPreset === 'monsoon_rain' && this.rainParticles && this.rainCoords) {
      this.rainParticles.position.x = playerPos.x;
      this.rainParticles.position.z = playerPos.z;

      const posAttr = this.rainParticles.geometry.attributes.position as THREE.BufferAttribute;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i) - 48.0 * delta;
        if (y < 0) {
          y = 40 + Math.random() * 5;
        }
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  }
}

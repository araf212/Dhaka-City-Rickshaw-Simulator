import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager';

export class MetroSystem {
  public group: THREE.Group = new THREE.Group();
  private trainGroup: THREE.Group = new THREE.Group();
  private trainProgress: number = 0; // 0 to 1
  private trainSpeed: number = 0.04;
  private trackWaypoints: THREE.Vector3[] = [];
  private stationStops: Array<{ progress: number; name: string; waitTimer: number }> = [];
  private isWaitingAtStation: boolean = false;
  private lastRumbleDist: number = Infinity;

  constructor() {
    this.setupCorridor();
    this.buildViaductPillars();
    this.buildElevatedStations();
    this.buildMetroTrain();
  }

  private setupCorridor() {
    // Metro MRT Line 6 corridor from Shahbagh to Bijoy Sarani / Farmgate
    this.trackWaypoints = [
      new THREE.Vector3(0, 8.5, -40),   // South terminal near Shahbagh
      new THREE.Vector3(0, 8.5, 20),    // Shahbagh station
      new THREE.Vector3(0, 8.5, 70),    // Banglamotor
      new THREE.Vector3(0, 8.5, 110),   // Karwan Bazar
      new THREE.Vector3(0, 8.5, 160),   // Farmgate Metro Station
      new THREE.Vector3(10, 8.5, 220),  // Bijoy Sarani turn
      new THREE.Vector3(15, 8.5, 270)   // North terminus
    ];

    this.stationStops = [
      { progress: 0.12, name: 'Shahbagh Station', waitTimer: 0 },
      { progress: 0.65, name: 'Farmgate Metro Station', waitTimer: 0 }
    ];
  }

  private buildViaductPillars() {
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8,
      metalness: 0.1
    });

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.8
    });

    // Elevated viaduct concrete deck
    for (let i = 0; i < this.trackWaypoints.length - 1; i++) {
      const p1 = this.trackWaypoints[i];
      const p2 = this.trackWaypoints[i + 1];
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const len = p1.distanceTo(p2);
      const angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);

      // Deck Box
      const deckGeo = new THREE.BoxGeometry(6.2, 0.8, len);
      const deckMesh = new THREE.Mesh(deckGeo, concreteMat);
      deckMesh.position.set(mid.x, 8.1, mid.z);
      deckMesh.rotation.y = angle;
      deckMesh.castShadow = true;
      deckMesh.receiveShadow = true;
      this.group.add(deckMesh);

      // Side crash barrier walls
      [-2.9, 2.9].forEach((side) => {
        const wallGeo = new THREE.BoxGeometry(0.35, 1.2, len);
        const wallMesh = new THREE.Mesh(wallGeo, concreteMat);
        const normX = Math.cos(angle) * side;
        const normZ = -Math.sin(angle) * side;
        wallMesh.position.set(mid.x + normX, 8.9, mid.z + normZ);
        this.group.add(wallMesh);
      });

      // Steel double tracks
      [-1.2, -0.6, 0.6, 1.2].forEach((railOffset) => {
        const railGeo = new THREE.BoxGeometry(0.12, 0.15, len);
        const railMesh = new THREE.Mesh(railGeo, railMat);
        const normX = Math.cos(angle) * railOffset;
        const normZ = -Math.sin(angle) * railOffset;
        railMesh.position.set(mid.x + normX, 8.55, mid.z + normZ);
        this.group.add(railMesh);
      });
    }

    // Heavy concrete Y-pillars supporting the elevated track
    for (let i = 0; i < this.trackWaypoints.length; i++) {
      const p = this.trackWaypoints[i];
      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(p.x, 0, p.z);

      // Main vertical pillar
      const colGeo = new THREE.CylinderGeometry(1.0, 1.2, 7.5, 8);
      const colMesh = new THREE.Mesh(colGeo, concreteMat);
      colMesh.position.y = 3.75;
      colMesh.castShadow = true;
      pillarGroup.add(colMesh);

      // Flaring top T-cap
      const capGeo = new THREE.BoxGeometry(5.8, 0.9, 2.0);
      const capMesh = new THREE.Mesh(capGeo, concreteMat);
      capMesh.position.y = 7.7;
      capMesh.castShadow = true;
      pillarGroup.add(capMesh);

      this.group.add(pillarGroup);
    }
  }

  private buildElevatedStations() {
    // Farmgate Elevated Metro Station
    const stationGroup = new THREE.Group();
    stationGroup.position.set(0, 8.5, 160);

    // Platform decks
    const platMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.6 }); // MRT Teal Green
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, transparent: true, opacity: 0.7 });

    const platformGeo = new THREE.BoxGeometry(14, 0.5, 36);
    const platform = new THREE.Mesh(platformGeo, platMat);
    platform.position.y = -0.2;
    stationGroup.add(platform);

    // Station curved roof canopy
    const roofGeo = new THREE.CylinderGeometry(7.5, 7.5, 36, 16, 1, false, 0, Math.PI);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x115e59, roughness: 0.4, side: THREE.DoubleSide });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = Math.PI / 2;
    roof.position.y = 4.2;
    stationGroup.add(roof);

    // Modern glass sidewall panels
    [-6.8, 6.8].forEach((x) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 36), glassMat);
      wall.position.set(x, 1.8, 0);
      stationGroup.add(wall);
    });

    // Elevated station sign banner
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#047857';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ফার্মগেট মেট্রোরেল স্টেশন', 256, 52);
    ctx.font = '600 20px "Outfit", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('FARMGATE METRO STATION (MRT LINE 6)', 256, 92);

    const signTex = new THREE.CanvasTexture(canvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2.2, 0.3),
      new THREE.MeshStandardMaterial({ map: signTex })
    );
    sign.position.set(0, 2.2, -18.2);
    stationGroup.add(sign);

    this.group.add(stationGroup);
  }

  private buildMetroTrain() {
    this.trainGroup = new THREE.Group();

    // Dhaka Metro Rail train cars (Silver body with Emerald Green stripe and red accents)
    const carLen = 14;
    const carWidth = 2.8;
    const carHeight = 2.7;

    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.3,
      metalness: 0.7
    });

    const greenStripeMat = new THREE.MeshStandardMaterial({
      color: 0x059669, // Dhaka Metro green
      roughness: 0.4
    });

    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9
    });

    // 3 connected cars
    for (let c = 0; c < 3; c++) {
      const car = new THREE.Group();
      car.position.z = c * (carLen + 0.6);

      // Car body
      const body = new THREE.Mesh(new THREE.BoxGeometry(carWidth, carHeight, carLen), silverMat);
      body.position.y = carHeight / 2 + 0.3;
      body.castShadow = true;
      car.add(body);

      // Emerald Green beltline stripe
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(carWidth + 0.05, 0.45, carLen), greenStripeMat);
      stripe.position.y = 1.35;
      car.add(stripe);

      // Continuous side tinted windows
      [-carWidth / 2 - 0.02, carWidth / 2 + 0.02].forEach((x) => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, carLen * 0.85), windowMat);
        win.position.set(x, 1.8, 0);
        car.add(win);
      });

      // Front car nose cone and headlights
      if (c === 0) {
        const nose = new THREE.Mesh(
          new THREE.ConeGeometry(1.6, 2.2, 4),
          greenStripeMat
        );
        nose.rotation.x = -Math.PI / 2;
        nose.rotation.y = Math.PI / 4;
        nose.position.set(0, 1.6, -carLen / 2 - 0.8);
        car.add(nose);

        // Bright headlights
        [-0.8, 0.8].forEach((lx) => {
          const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          light.position.set(lx, 1.3, -carLen / 2 - 0.2);
          car.add(light);
        });
      }

      this.trainGroup.add(car);
    }

    this.group.add(this.trainGroup);
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    if (this.isWaitingAtStation) {
      const activeStop = this.stationStops.find((s) => s.waitTimer > 0);
      if (activeStop) {
        activeStop.waitTimer -= delta;
        if (activeStop.waitTimer <= 0) {
          this.isWaitingAtStation = false;
        }
        return;
      }
    }

    // Advance train along track progress
    this.trainProgress = (this.trainProgress + this.trainSpeed * delta) % 1.0;

    // Check station stops
    for (const stop of this.stationStops) {
      if (Math.abs(this.trainProgress - stop.progress) < 0.015 && stop.waitTimer <= 0) {
        this.isWaitingAtStation = true;
        stop.waitTimer = 5.0; // 5-second passenger boarding wait
        break;
      }
    }

    // Interpolate train position along waypoints
    const totalWaypoints = this.trackWaypoints.length - 1;
    const scaledP = this.trainProgress * totalWaypoints;
    const segIndex = Math.min(totalWaypoints - 1, Math.floor(scaledP));
    const segProgress = scaledP - segIndex;

    const p1 = this.trackWaypoints[segIndex];
    const p2 = this.trackWaypoints[segIndex + 1];

    if (p1 && p2) {
      const currentPos = p1.clone().lerp(p2, segProgress);
      this.trainGroup.position.copy(currentPos);

      const angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);
      this.trainGroup.rotation.y = angle;

      // Check distance to player for realistic Metro Rail overhead rumble
      const distToPlayer = currentPos.distanceTo(playerPos);
      if (distToPlayer < 45 && this.lastRumbleDist >= 45) {
        soundManager.playMetroRumble();
      }
      this.lastRumbleDist = distToPlayer;
    }
  }
}

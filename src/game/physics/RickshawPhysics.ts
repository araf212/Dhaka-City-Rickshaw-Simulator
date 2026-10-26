import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager';
import { RickshawCustomization } from '../types';

/**
 * Procedural Dhaka Rickshaw Folk Art Hood Texture
 */
function createRickshawHoodTexture(theme: 'peacock' | 'tiger' | 'cinema' | 'floral'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Vibrant folk background
  ctx.fillStyle = theme === 'peacock' ? '#047857' : theme === 'tiger' ? '#c2410c' : theme === 'cinema' ? '#991b1b' : '#0369a1';
  ctx.fillRect(0, 0, 512, 512);

  // Decorative border filigree / tassels
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 12;
  ctx.strokeRect(12, 12, 488, 488);

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, 464, 464);

  // Central motif
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(256, 256, 150, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 38px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (theme === 'peacock') {
    ctx.fillText('ময়ূর পঙ্খী', 256, 220);
    ctx.font = '600 24px sans-serif';
    ctx.fillText('MAYUR PANKHI', 256, 260);
    // Draw stylized peacock eye plumage
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(256, 320, 45, 25, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'tiger') {
    ctx.fillText('রয়্যাল বেঙ্গল', 256, 220);
    ctx.font = '600 24px sans-serif';
    ctx.fillText('SUNDARBAN TIGER', 256, 260);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(216, 310, 80, 20);
  } else if (theme === 'cinema') {
    ctx.fillText('স্বপ্নের নায়ক', 256, 220);
    ctx.font = '600 24px sans-serif';
    ctx.fillText('DHAKA CINEMA', 256, 260);
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(256, 320, 30, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillText('জামদানি বাহার', 256, 220);
    ctx.font = '600 24px sans-serif';
    ctx.fillText('JAMDANI FLORAL', 256, 260);
  }

  // Bottom license / Dhaka text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
  ctx.fillText('ঢাকা মেট্রো - র - ৯৮৭৬', 256, 465);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class RickshawPhysics {
  public mesh: THREE.Group = new THREE.Group();
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public heading: number = 0; // Yaw angle in radians
  public speed: number = 0; // Current velocity (m/s)
  public steerAngle: number = 0; // Current steering wheel angle
  public leanAngle: number = 0; // Body bank angle during turns

  // Physical parameters
  private maxSpeed: number = 7.5; // ~27 km/h
  private maxReverseSpeed: number = -2.0;
  private acceleration: number = 4.2;
  private brakeForce: number = 8.5;
  private dragFriction: number = 1.2;
  private turnSpeed: number = 1.8;

  // Visual sub-meshes for animation
  private frontForkGroup: THREE.Group = new THREE.Group();
  private frontWheel: THREE.Mesh | null = null;
  private rearLeftWheel: THREE.Mesh | null = null;
  private rearRightWheel: THREE.Mesh | null = null;
  private pedalCrankGroup: THREE.Group = new THREE.Group();
  private bellMesh: THREE.Mesh | null = null;
  private hoodMesh: THREE.Mesh | null = null;

  // Bell ding animation timer
  private bellAnimTimer: number = 0;

  constructor(customization: RickshawCustomization) {
    this.buildRickshawModel(customization);
  }

  private buildRickshawModel(custom: RickshawCustomization) {
    this.mesh = new THREE.Group();

    const frameMat = new THREE.MeshStandardMaterial({
      color: custom.frameColor,
      roughness: 0.25,
      metalness: 0.8
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.15,
      metalness: 0.95
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.1
    });

    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Leather passenger seat
      roughness: 0.6
    });

    // 1. REAR PASSENGER CARRIAGE CHASSIS
    const rearChassis = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.12, 1.4),
      frameMat
    );
    rearChassis.position.set(0, 0.6, -0.6);
    rearChassis.castShadow = true;
    this.mesh.add(rearChassis);

    // Rear Dual Axle
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8),
      chromeMat
    );
    axle.rotation.z = Math.PI / 2;
    axle.position.set(0, 0.45, -0.7);
    this.mesh.add(axle);

    // Rear Spoked Wheels (Left & Right)
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.09, 16);
    this.rearLeftWheel = new THREE.Mesh(wheelGeo, rubberMat);
    this.rearLeftWheel.rotation.z = Math.PI / 2;
    this.rearLeftWheel.position.set(-0.7, 0.45, -0.7);
    this.rearLeftWheel.castShadow = true;
    this.mesh.add(this.rearLeftWheel);

    this.rearRightWheel = new THREE.Mesh(wheelGeo, rubberMat);
    this.rearRightWheel.rotation.z = Math.PI / 2;
    this.rearRightWheel.position.set(0.7, 0.45, -0.7);
    this.rearRightWheel.castShadow = true;
    this.mesh.add(this.rearRightWheel);

    // Rear Mudguards with decorative brass trim
    [-0.7, 0.7].forEach((x) => {
      const guard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.14, 12, 1, false, 0, Math.PI),
        frameMat
      );
      guard.rotation.z = Math.PI / 2;
      guard.position.set(x, 0.52, -0.7);
      this.mesh.add(guard);
    });

    // 2. PASSENGER CARRIAGE SEAT
    const seatBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.25, 0.65),
      seatMat
    );
    seatBase.position.set(0, 0.8, -0.65);
    seatBase.castShadow = true;
    this.mesh.add(seatBase);

    const seatBack = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.7, 0.15),
      seatMat
    );
    seatBack.position.set(0, 1.25, -0.95);
    seatBack.castShadow = true;
    this.mesh.add(seatBack);

    // Carriage Footrest
    const footrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.08, 0.4),
      frameMat
    );
    footrest.position.set(0, 0.4, -0.1);
    this.mesh.add(footrest);

    // 3. ICONIC FOLK ART HOOD (CANOPY)
    const hoodTex = createRickshawHoodTexture(custom.hoodArt);
    const hoodMat = new THREE.MeshStandardMaterial({
      map: hoodTex,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const hoodGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.25, 16, 1, true, -Math.PI / 2, Math.PI);
    this.hoodMesh = new THREE.Mesh(hoodGeo, hoodMat);
    this.hoodMesh.rotation.z = Math.PI / 2;
    this.hoodMesh.position.set(0, 1.6, -0.65);
    this.hoodMesh.castShadow = true;
    this.mesh.add(this.hoodMesh);

    // Decorative Rear Tin Plate ("লাইসেন্স ও আর্ট প্লেট")
    const plateGeo = new THREE.BoxGeometry(0.7, 0.4, 0.04);
    const plateTex = createRickshawHoodTexture('peacock');
    const plateMesh = new THREE.Mesh(plateGeo, new THREE.MeshStandardMaterial({ map: plateTex }));
    plateMesh.position.set(0, 0.5, -1.35);
    this.mesh.add(plateMesh);

    // 4. MAIN CENTRAL TRIANGLE FRAME & RIDER SADDLE
    const centerTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8),
      frameMat
    );
    centerTube.rotation.x = 0.5;
    centerTube.position.set(0, 0.7, 0.2);
    this.mesh.add(centerTube);

    // Rider Saddle
    const saddle = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.1, 0.35),
      rubberMat
    );
    saddle.position.set(0, 1.05, 0.05);
    saddle.castShadow = true;
    this.mesh.add(saddle);

    // Pedal Crank Group
    this.pedalCrankGroup = new THREE.Group();
    this.pedalCrankGroup.position.set(0, 0.45, 0.2);

    const crankSprocket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12),
      chromeMat
    );
    crankSprocket.rotation.z = Math.PI / 2;
    this.pedalCrankGroup.add(crankSprocket);

    [-0.18, 0.18].forEach((side) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.04), chromeMat);
      arm.position.set(side, 0, 0);
      this.pedalCrankGroup.add(arm);

      const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.1), rubberMat);
      pedal.position.set(side * 1.3, side > 0 ? 0.09 : -0.09, 0);
      this.pedalCrankGroup.add(pedal);
    });
    this.mesh.add(this.pedalCrankGroup);

    // 5. STEERABLE FRONT FORK, WHEEL & HANDLEBAR
    this.frontForkGroup = new THREE.Group();
    this.frontForkGroup.position.set(0, 0.45, 0.9);

    // Front Wheel
    this.frontWheel = new THREE.Mesh(wheelGeo, rubberMat);
    this.frontWheel.rotation.z = Math.PI / 2;
    this.frontWheel.castShadow = true;
    this.frontForkGroup.add(this.frontWheel);

    // Dual front fork blades
    [-0.1, 0.1].forEach((fx) => {
      const forkBlade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8),
        frameMat
      );
      forkBlade.position.set(fx, 0.35, 0);
      this.frontForkGroup.add(forkBlade);
    });

    // Handlebar Stem & Bar
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8),
      chromeMat
    );
    stem.position.set(0, 0.85, 0);
    this.frontForkGroup.add(stem);

    const handlebar = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.04, 0.04),
      chromeMat
    );
    handlebar.position.set(0, 1.1, 0);
    this.frontForkGroup.add(handlebar);

    // Polished Brass Rickshaw Bell on Handlebar
    const bellGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const bellMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.1,
      metalness: 0.95
    });
    this.bellMesh = new THREE.Mesh(bellGeo, bellMat);
    this.bellMesh.position.set(0.25, 1.16, 0);
    this.frontForkGroup.add(this.bellMesh);

    // Front Headlight
    const lightMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.15, 12),
      chromeMat
    );
    lightMesh.rotation.x = Math.PI / 2;
    lightMesh.position.set(0, 0.75, 0.15);
    this.frontForkGroup.add(lightMesh);

    this.mesh.add(this.frontForkGroup);
  }

  public ringBell(bellType: 'classic_brass' | 'double_ding' | 'electric_horn') {
    soundManager.ringRickshawBell(bellType);
    this.bellAnimTimer = 0.35; // Trigger bounce
  }

  public update(
    delta: number,
    inputs: { forward: boolean; backward: boolean; left: boolean; right: boolean; brake: boolean },
    colliders: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>
  ) {
    // 1. Steering computation with progressive turn damping
    const targetSteer = inputs.left ? 0.45 : inputs.right ? -0.45 : 0;
    this.steerAngle = THREE.MathUtils.damp(this.steerAngle, targetSteer, 8, delta);

    // Visual fork rotation
    this.frontForkGroup.rotation.y = this.steerAngle;

    // 2. Acceleration / Braking
    if (inputs.forward) {
      this.speed += this.acceleration * delta;
      if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
      soundManager.triggerPedalClick(this.speed / this.maxSpeed);
    } else if (inputs.backward) {
      this.speed -= this.acceleration * 0.7 * delta;
      if (this.speed < this.maxReverseSpeed) this.speed = this.maxReverseSpeed;
    } else {
      // Natural rolling friction
      if (this.speed > 0) {
        this.speed -= this.dragFriction * delta;
        if (this.speed < 0) this.speed = 0;
      } else if (this.speed < 0) {
        this.speed += this.dragFriction * delta;
        if (this.speed > 0) this.speed = 0;
      }
    }

    if (inputs.brake) {
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - this.brakeForce * delta);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + this.brakeForce * delta);
      }
    }

    // Audio update for rolling tires
    soundManager.updateSpeedSound(Math.abs(this.speed) / this.maxSpeed);

    // 3. Heading and movement
    const turnFactor = this.steerAngle * (this.speed / this.maxSpeed) * this.turnSpeed;
    this.heading += turnFactor * delta;

    const moveStep = this.speed * delta;
    const nextX = this.position.x + Math.sin(this.heading) * moveStep;
    const nextZ = this.position.z + Math.cos(this.heading) * moveStep;

    // 4. Collision checking with city obstacles
    let collided = false;
    const rickshawRadius = 1.0;
    for (const c of colliders) {
      if (
        nextX + rickshawRadius > c.minX &&
        nextX - rickshawRadius < c.maxX &&
        nextZ + rickshawRadius > c.minZ &&
        nextZ - rickshawRadius < c.maxZ
      ) {
        collided = true;
        break;
      }
    }

    if (collided) {
      soundManager.playCollisionSound(Math.abs(this.speed));
      this.speed = -this.speed * 0.35; // Gentle bounce recoil
    } else {
      this.position.x = nextX;
      this.position.z = nextZ;
    }

    // 5. Body leaning (banking) during turns
    const targetLean = -this.steerAngle * (this.speed / this.maxSpeed) * 0.25;
    this.leanAngle = THREE.MathUtils.damp(this.leanAngle, targetLean, 6, delta);

    // Update 3D mesh transformation
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.heading;
    this.mesh.rotation.z = this.leanAngle;

    // 6. Wheel & pedal rotation animations
    const wheelRotDelta = (moveStep / 0.45);
    if (this.frontWheel) this.frontWheel.rotation.x += wheelRotDelta;
    if (this.rearLeftWheel) this.rearLeftWheel.rotation.x += wheelRotDelta;
    if (this.rearRightWheel) this.rearRightWheel.rotation.x += wheelRotDelta;
    if (this.pedalCrankGroup) this.pedalCrankGroup.rotation.x += wheelRotDelta * 1.5;

    // 7. Bell ding bounce animation
    if (this.bellAnimTimer > 0) {
      this.bellAnimTimer -= delta;
      if (this.bellMesh) {
        this.bellMesh.scale.setScalar(1.0 + Math.sin(this.bellAnimTimer * 30) * 0.25);
      }
    } else if (this.bellMesh) {
      this.bellMesh.scale.setScalar(1.0);
    }
  }

  public resetPosition(x: number = 0, z: number = 0) {
    this.position.set(x, 0, z);
    this.speed = 0;
    this.heading = 0;
    this.steerAngle = 0;
    this.mesh.position.copy(this.position);
    this.mesh.rotation.set(0, 0, 0);
  }

  public updateCustomization(custom: RickshawCustomization) {
    this.mesh.clear();
    this.buildRickshawModel(custom);
  }
}

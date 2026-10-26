import * as THREE from 'three';
import { ROAD_NODES } from './RoadGraph';

interface SimPedestrian {
  id: number;
  group: THREE.Group;
  currentX: number;
  currentZ: number;
  targetX: number;
  targetZ: number;
  speed: number;
  stride: number;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
}

export class PedestrianManager {
  public group: THREE.Group = new THREE.Group();
  private pedestrians: SimPedestrian[] = [];

  constructor(count: number = 24) {
    this.spawnPedestrians(count);
  }

  private spawnPedestrians(count: number) {
    const lungiColors = [0x1e3a8a, 0x065f46, 0x991b1b, 0x475569, 0xb45309];
    const panjabiColors = [0xf8fafc, 0xfef08a, 0xdcfce7, 0xfbcfe8, 0xe0e7ff];

    for (let i = 0; i < count; i++) {
      const node = ROAD_NODES[i % ROAD_NODES.length];
      const offsetX = (Math.random() - 0.5) * 16;
      const offsetZ = (Math.random() - 0.5) * 16;

      const pGroup = new THREE.Group();
      pGroup.position.set(node.x + offsetX, 0, node.z + offsetZ);

      // Procedural Humanoid
      // 1. Torso / Panjabi
      const panjabiColor = panjabiColors[i % panjabiColors.length];
      const torsoMat = new THREE.MeshStandardMaterial({ color: panjabiColor, roughness: 0.8 });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), torsoMat);
      torso.position.y = 1.15;
      torso.castShadow = true;
      pGroup.add(torso);

      // 2. Head
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.6 }); // Bengali skin tone
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), skinMat);
      head.position.y = 1.65;
      pGroup.add(head);

      // Hair
      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
      );
      hair.position.y = 1.68;
      pGroup.add(hair);

      // 3. Legs / Lungi (traditional cylindrical wrap)
      const lungiColor = lungiColors[i % lungiColors.length];
      const lungiMat = new THREE.MeshStandardMaterial({ color: lungiColor, roughness: 0.9 });

      const legGeo = new THREE.BoxGeometry(0.18, 0.75, 0.2);
      const leftLeg = new THREE.Mesh(legGeo, lungiMat);
      leftLeg.position.set(-0.12, 0.45, 0);
      pGroup.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, lungiMat);
      rightLeg.position.set(0.12, 0.45, 0);
      pGroup.add(rightLeg);

      this.group.add(pGroup);

      this.pedestrians.push({
        id: i,
        group: pGroup,
        currentX: node.x + offsetX,
        currentZ: node.z + offsetZ,
        targetX: node.x + (Math.random() - 0.5) * 35,
        targetZ: node.z + (Math.random() - 0.5) * 35,
        speed: 1.1 + Math.random() * 0.5,
        stride: Math.random() * Math.PI * 2,
        leftLeg,
        rightLeg
      });
    }
  }

  public update(delta: number) {
    for (const p of this.pedestrians) {
      const dx = p.targetX - p.currentX;
      const dz = p.targetZ - p.currentZ;
      const dist = Math.hypot(dx, dz);

      if (dist < 1.0) {
        // Pick new sidewalk destination
        const randomNode = ROAD_NODES[Math.floor(Math.random() * ROAD_NODES.length)];
        p.targetX = randomNode.x + (Math.random() - 0.5) * 30;
        p.targetZ = randomNode.z + (Math.random() - 0.5) * 30;
      } else {
        const angle = Math.atan2(dx, dz);
        p.currentX += Math.sin(angle) * p.speed * delta;
        p.currentZ += Math.cos(angle) * p.speed * delta;

        p.group.position.x = p.currentX;
        p.group.position.z = p.currentZ;
        p.group.rotation.y = angle;

        // Walking stride leg swing animation
        p.stride += p.speed * 6 * delta;
        const swing = Math.sin(p.stride) * 0.4;
        p.leftLeg.rotation.x = swing;
        p.rightLeg.rotation.x = -swing;
        p.group.position.y = Math.abs(Math.sin(p.stride * 2)) * 0.05; // Bobbing
      }
    }
  }
}

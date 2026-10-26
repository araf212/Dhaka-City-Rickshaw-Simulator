import * as THREE from 'three';
import { RoadEdge, RoadNode, VehicleType } from '../types';
import { ROAD_EDGES, ROAD_NODES, roadGraph } from './RoadGraph';
import { soundManager } from '../audio/SoundManager';

interface SimVehicle {
  id: number;
  type: VehicleType;
  group: THREE.Group;
  currentEdge: RoadEdge;
  fromNode: RoadNode;
  toNode: RoadNode;
  progress: number; // 0 to 1 along edge
  speed: number;
  targetSpeed: number;
  laneOffset: number; // Lateral offset from center (drive on left side in Bangladesh)
  length: number;
  width: number;
  hornTimer: number;
}

export class TrafficManager {
  public group: THREE.Group = new THREE.Group();
  private vehicles: SimVehicle[] = [];
  private nodeMap: Map<string, RoadNode> = new Map();

  constructor(density: 'sparse' | 'normal' | 'dense' = 'normal') {
    ROAD_NODES.forEach((n) => this.nodeMap.set(n.id, n));
    this.spawnTraffic(density);
  }

  private spawnTraffic(density: 'sparse' | 'normal' | 'dense') {
    const counts = {
      sparse: 12,
      normal: 22,
      dense: 35
    };
    const targetCount = counts[density];

    const types: VehicleType[] = ['cng', 'cng', 'bus', 'car', 'bike', 'cng', 'car'];

    for (let i = 0; i < targetCount; i++) {
      const type = types[i % types.length];
      const edge = ROAD_EDGES[i % ROAD_EDGES.length];
      const from = this.nodeMap.get(edge.from);
      const to = this.nodeMap.get(edge.to);
      if (!from || !to) continue;

      const vMesh = this.createVehicleMesh(type, i);
      const laneOffset = -1.6; // Bangladesh traffic drives on left

      const vehicle: SimVehicle = {
        id: i,
        type,
        group: vMesh,
        currentEdge: edge,
        fromNode: from,
        toNode: to,
        progress: (i / targetCount),
        speed: type === 'bus' ? 5.0 : type === 'cng' ? 7.0 : 8.0,
        targetSpeed: type === 'bus' ? 6.0 : type === 'cng' ? 7.5 : 8.5,
        laneOffset,
        length: type === 'bus' ? 8.0 : type === 'car' ? 4.2 : 2.5,
        width: type === 'bus' ? 2.5 : type === 'car' ? 1.8 : 1.4,
        hornTimer: Math.random() * 8 + 4
      };

      this.group.add(vMesh);
      this.vehicles.push(vehicle);
    }
  }

  private createVehicleMesh(type: VehicleType, idx: number): THREE.Group {
    const g = new THREE.Group();

    if (type === 'cng') {
      // Iconic Dhaka Green CNG Auto-Rickshaw
      const greenMat = new THREE.MeshStandardMaterial({
        color: 0x15803d, // Emerald green
        roughness: 0.35,
        metalness: 0.6
      });
      const blackRoofMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.8
      });
      const yellowPlateMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.3
      });

      // Lower body
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 2.2), greenMat);
      body.position.y = 0.55;
      body.castShadow = true;
      g.add(body);

      // Black curved canopy roof
      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.65, 1.6), blackRoofMat);
      roof.position.set(0, 1.2, -0.2);
      g.add(roof);

      // Yellow number plate
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.05), yellowPlateMat);
      plate.position.set(0, 0.5, -1.13);
      g.add(plate);

      // Front single windshield & cowl
      const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 4), greenMat);
      cowl.rotation.x = -Math.PI / 2;
      cowl.position.set(0, 0.8, 1.1);
      g.add(cowl);

      // Headlight
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      head.position.set(0, 0.75, 1.2);
      g.add(head);

      // 3 wheels
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
      const wGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 8);

      const fWheel = new THREE.Mesh(wGeo, wheelMat);
      fWheel.rotation.z = Math.PI / 2;
      fWheel.position.set(0, 0.25, 0.8);
      g.add(fWheel);

      [-0.6, 0.6].forEach((x) => {
        const rWheel = new THREE.Mesh(wGeo, wheelMat);
        rWheel.rotation.z = Math.PI / 2;
        rWheel.position.set(x, 0.25, -0.6);
        g.add(rWheel);
      });
    } else if (type === 'bus') {
      // Dhaka Local Bus (e.g. Bikolpo / Raida colorful style)
      const busColors = [0x0284c7, 0xdc2626, 0xd97706, 0x7c3aed];
      const mainMat = new THREE.MeshStandardMaterial({
        color: busColors[idx % busColors.length],
        roughness: 0.4,
        metalness: 0.3
      });
      const windowMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.8
      });

      // Main bus chassis
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 8.2), mainMat);
      body.position.y = 1.6;
      body.castShadow = true;
      g.add(body);

      // Tinted window belt
      const windows = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.9, 7.6), windowMat);
      windows.position.y = 2.0;
      g.add(windows);

      // Heavy front bull-bar bumper
      const bumper = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.4, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
      );
      bumper.position.set(0, 0.5, 4.2);
      g.add(bumper);

      // Rooftop luggage carrier rack
      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.3, 5.5),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
      );
      rack.position.set(0, 3.05, -0.5);
      g.add(rack);

      // Headlights
      [-0.9, 0.9].forEach((x) => {
        const hl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        hl.position.set(x, 1.0, 4.15);
        g.add(hl);
      });
    } else if (type === 'car') {
      // Private sedan / white microbus
      const carMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0xf8fafc : 0x94a3b8,
        roughness: 0.2,
        metalness: 0.7
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 4.2), carMat);
      body.position.y = 0.55;
      body.castShadow = true;
      g.add(body);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.7, 2.4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 })
      );
      cabin.position.set(0, 1.2, -0.2);
      g.add(cabin);
    } else {
      // Motorbike
      const bikeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 1.8), bikeMat);
      frame.position.y = 0.5;
      g.add(frame);

      const rider = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.8, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x1e3a8a })
      );
      rider.position.set(0, 1.0, 0);
      g.add(rider);
    }

    return g;
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    for (const v of this.vehicles) {
      const from = v.fromNode;
      const to = v.toNode;
      const dx = to.x - from.x;
      const dz = to.z - from.z;
      const edgeLen = Math.hypot(dx, dz);

      // Heading along road segment
      const heading = Math.atan2(dx, dz);

      // Random occasional traffic horn
      v.hornTimer -= delta;
      if (v.hornTimer <= 0) {
        v.hornTimer = Math.random() * 12 + 6;
        const distToPlayer = v.group.position.distanceTo(playerPos);
        if (distToPlayer < 35) {
          soundManager.playTrafficHorn(v.type === 'cng' ? 'cng' : v.type === 'bus' ? 'bus' : 'car');
        }
      }

      // Check distance to player rickshaw for braking
      const vehiclePos = v.group.position;
      const distToPlayer = vehiclePos.distanceTo(playerPos);
      let obstacleAhead = false;

      if (distToPlayer < v.length + 3.0) {
        // Player is right near
        v.speed = Math.max(0, v.speed - 10.0 * delta);
        obstacleAhead = true;
      }

      if (!obstacleAhead) {
        // Accelerate smoothly to target speed
        v.speed = THREE.MathUtils.damp(v.speed, v.targetSpeed, 3, delta);
      }

      // Move progress along edge
      const stepDist = v.speed * delta;
      v.progress += stepDist / Math.max(edgeLen, 1);

      if (v.progress >= 1.0) {
        // Arrived at target node, select next connected edge
        const outEdges = roadGraph.getOutEdges(v.toNode.id);
        if (outEdges.length > 0) {
          // Choose non-reversing edge if possible
          const validNext = outEdges.filter((e) => e.target.id !== v.fromNode.id);
          const chosen = validNext.length > 0
            ? validNext[Math.floor(Math.random() * validNext.length)]
            : outEdges[0];

          v.fromNode = v.toNode;
          v.toNode = chosen.target;
          v.currentEdge = chosen.edge;
          v.progress = 0;
        } else {
          // Loop back
          const temp = v.fromNode;
          v.fromNode = v.toNode;
          v.toNode = temp;
          v.progress = 0;
        }
      }

      // Interpolate 3D position
      const curX = THREE.MathUtils.lerp(v.fromNode.x, v.toNode.x, v.progress);
      const curZ = THREE.MathUtils.lerp(v.fromNode.z, v.toNode.z, v.progress);

      // Apply lane lateral offset (perpendicular to road heading)
      const normX = Math.cos(heading) * v.laneOffset;
      const normZ = -Math.sin(heading) * v.laneOffset;

      v.group.position.set(curX + normX, 0, curZ + normZ);
      v.group.rotation.y = heading;
    }
  }

  public getVehiclePositions(): THREE.Vector3[] {
    return this.vehicles.map((v) => v.group.position);
  }
}

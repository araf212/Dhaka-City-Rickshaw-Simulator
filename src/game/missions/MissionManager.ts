import * as THREE from 'three';
import { PassengerMission, DistrictId } from '../types';
import { ROAD_NODES, DHAKA_DISTRICTS, roadGraph } from '../world/RoadGraph';
import { soundManager } from '../audio/SoundManager';

export class MissionManager {
  public group: THREE.Group = new THREE.Group();
  public activeMission: PassengerMission | null = null;
  public pendingOffer: PassengerMission | null = null;
  public passengerInRickshaw: boolean = false;

  private pickupMarker: THREE.Group = new THREE.Group();
  private dropoffMarker: THREE.Group = new THREE.Group();
  private seatedPassengerMesh: THREE.Group = new THREE.Group();
  private waitingPassengerMesh: THREE.Group = new THREE.Group();
  private markerAnimTimer: number = 0;

  constructor() {
    this.setupVisualMarkers();
    this.setupSeatedPassenger();
    this.generateNewPassenger();
  }

  private setupVisualMarkers() {
    // 1. Pickup Marker (Yellow/Amber spinning beacon with floating coin ring)
    const ringGeo = new THREE.TorusGeometry(2.5, 0.2, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.2,
      metalness: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    this.pickupMarker.add(ring);

    // Glowing vertical light pillar
    const beamGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.45
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 4;
    this.pickupMarker.add(beam);

    // Waiting 3D passenger character
    this.waitingPassengerMesh = this.createPassengerCharacter(0x0284c7, 0x15803d);
    this.pickupMarker.add(this.waitingPassengerMesh);

    this.group.add(this.pickupMarker);

    // 2. Dropoff Marker (Emerald Green destination beacon)
    const dropRingMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.8
    });
    const dropRing = new THREE.Mesh(ringGeo, dropRingMat);
    dropRing.rotation.x = Math.PI / 2;
    this.dropoffMarker.add(dropRing);

    const dropBeamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.55
    });
    const dropBeam = new THREE.Mesh(beamGeo, dropBeamMat);
    dropBeam.position.y = 4;
    this.dropoffMarker.add(dropBeam);

    this.dropoffMarker.visible = false;
    this.group.add(this.dropoffMarker);
  }

  private createPassengerCharacter(shirtColor: number, pantColor: number): THREE.Group {
    const p = new THREE.Group();

    // Torso
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.65, 0.3),
      new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 })
    );
    torso.position.y = 1.1;
    p.add(torso);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.6 })
    );
    head.position.y = 1.6;
    p.add(head);

    // Legs
    const legs = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.75, 0.25),
      new THREE.MeshStandardMaterial({ color: pantColor, roughness: 0.8 })
    );
    legs.position.y = 0.4;
    p.add(legs);

    return p;
  }

  private setupSeatedPassenger() {
    this.seatedPassengerMesh = new THREE.Group();

    // Seated pose passenger inside rickshaw carriage
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.6, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 })
    );
    torso.position.set(0, 1.1, -0.65);
    this.seatedPassengerMesh.add(torso);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.6 })
    );
    head.position.set(0, 1.55, -0.65);
    this.seatedPassengerMesh.add(head);

    // Folded knees sitting forward
    const legs = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    legs.position.set(0, 0.85, -0.4);
    this.seatedPassengerMesh.add(legs);

    this.seatedPassengerMesh.visible = false;
  }

  public attachToRickshaw(rickshawMesh: THREE.Group) {
    rickshawMesh.add(this.seatedPassengerMesh);
  }

  public generateNewPassenger(preferredDistrict?: DistrictId) {
    const pickupNodes = ROAD_NODES.filter((n) => !preferredDistrict || n.district === preferredDistrict);
    const pickupNode = pickupNodes[Math.floor(Math.random() * pickupNodes.length)] || ROAD_NODES[0];

    // Pick a dropoff node in a different or nearby landmark
    const potentialDrops = ROAD_NODES.filter((n) => n.id !== pickupNode.id);
    const dropNode = potentialDrops[Math.floor(Math.random() * potentialDrops.length)];

    const route = roadGraph.findRoute(pickupNode.id, dropNode.id);
    const dist = route ? Math.round(route.totalDistance * 10) : 450; // In meters
    const fare = Math.max(30, Math.round(dist * 0.18 + 20));

    const dialogues = [
      {
        bengali: `মামা, ${dropNode.name || 'সামনে'} যাবেন? ৳${fare} টাকা দিব!`,
        english: `Mama, will you go to ${dropNode.name}? I'll give ৳${fare}!`
      },
      {
        bengali: `এই যে মামা! জলদি ${dropNode.name} চলেন, ৳${fare} ভাড়া।`,
        english: `Hey Mama! Quick to ${dropNode.name}, ৳${fare} fare.`
      },
      {
        bengali: `রিকশা মামা, ${dropNode.name} যাবেন? ৳${fare} ফিক্সড।`,
        english: `Rickshaw mama, going to ${dropNode.name}? ৳${fare} fixed.`
      }
    ];

    const chosenDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

    const mission: PassengerMission = {
      id: `m_${Date.now()}`,
      passengerName: 'যাত্রী (Passenger)',
      dialogueBengali: chosenDialogue.bengali,
      dialogueEnglish: chosenDialogue.english,
      pickupDistrict: pickupNode.district,
      pickupLandmark: pickupNode.name || 'Road Crossing',
      pickupCoords: [pickupNode.x, pickupNode.z],
      dropDistrict: dropNode.district,
      dropLandmark: dropNode.name || 'Destination Moor',
      dropCoords: [dropNode.x, dropNode.z],
      fareTaka: fare,
      tipPotential: Math.round(fare * 0.3),
      distanceMeters: dist
    };

    this.pendingOffer = mission;
    this.pickupMarker.position.set(pickupNode.x, 0.05, pickupNode.z);
    this.pickupMarker.visible = true;
    this.dropoffMarker.visible = false;
  }

  public acceptPassenger(): boolean {
    if (!this.pendingOffer) return false;

    this.activeMission = this.pendingOffer;
    this.pendingOffer = null;
    this.passengerInRickshaw = true;

    // Hide pickup beacon, show seated passenger and dropoff beacon
    this.pickupMarker.visible = false;
    this.seatedPassengerMesh.visible = true;

    this.dropoffMarker.position.set(this.activeMission.dropCoords[0], 0.05, this.activeMission.dropCoords[1]);
    this.dropoffMarker.visible = true;

    soundManager.ringRickshawBell('double_ding');
    return true;
  }

  public completeMission(crashedHard: boolean = false): { fareEarned: number; tipEarned: number } | null {
    if (!this.activeMission) return null;

    const baseFare = this.activeMission.fareTaka;
    const tip = crashedHard ? 0 : this.activeMission.tipPotential;
    const total = baseFare + tip;

    soundManager.playCashEarned();

    this.activeMission = null;
    this.passengerInRickshaw = false;
    this.seatedPassengerMesh.visible = false;
    this.dropoffMarker.visible = false;

    // Schedule next passenger in 3 seconds
    setTimeout(() => {
      this.generateNewPassenger();
    }, 2500);

    return { fareEarned: baseFare, tipEarned: tip };
  }

  public update(delta: number, playerPos: THREE.Vector3): { canPickup: boolean; canDropoff: boolean; distanceToTarget: number } {
    this.markerAnimTimer += delta * 2;
    const bob = Math.sin(this.markerAnimTimer) * 0.3;

    if (this.pickupMarker.visible) {
      this.pickupMarker.rotation.y += delta * 1.5;
      this.pickupMarker.position.y = 0.05 + bob * 0.1;
    }

    if (this.dropoffMarker.visible) {
      this.dropoffMarker.rotation.y += delta * 1.5;
      this.dropoffMarker.position.y = 0.05 + bob * 0.1;
    }

    let canPickup = false;
    let canDropoff = false;
    let distanceToTarget = 0;

    if (this.pendingOffer && !this.passengerInRickshaw) {
      const dist = Math.hypot(playerPos.x - this.pendingOffer.pickupCoords[0], playerPos.z - this.pendingOffer.pickupCoords[1]);
      distanceToTarget = Math.round(dist * 10);
      if (dist < 7.0) {
        canPickup = true;
      }
    } else if (this.activeMission && this.passengerInRickshaw) {
      const dist = Math.hypot(playerPos.x - this.activeMission.dropCoords[0], playerPos.z - this.activeMission.dropCoords[1]);
      distanceToTarget = Math.round(dist * 10);
      if (dist < 8.0) {
        canDropoff = true;
      }
    }

    return { canPickup, canDropoff, distanceToTarget };
  }
}

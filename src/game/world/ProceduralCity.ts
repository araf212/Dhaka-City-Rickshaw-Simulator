import * as THREE from 'three';
import { ROAD_NODES, ROAD_EDGES, DHAKA_DISTRICTS } from './RoadGraph';

/**
 * Cached procedural texture generators for authentic Dhaka city visuals
 */
function createStorefrontTexture(storeName: string, subText: string, bgColor: string, textColor: string = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 64);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 56);

  ctx.fillStyle = textColor;
  ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(storeName, 128, 26);

  ctx.font = '600 11px sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText(subText, 128, 48);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBuildingFacadeTexture(primaryColor: string, accentColor: string, rows: number = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, 256, 256);

  const cols = 4;
  const padX = 18;
  const padY = 16;
  const w = (256 - padX * (cols + 1)) / cols;
  const h = (256 - padY * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * (w + padX);
      const y = padY + r * (h + padY);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 8);

      ctx.fillStyle = accentColor;
      ctx.fillRect(x - 1, y + h - 6, w + 2, 6);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createRoadAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#22252a';
  ctx.fillRect(0, 0, 128, 128);

  // Center dashed line
  ctx.fillStyle = '#fef08a';
  for (let y = 10; y < 128; y += 40) {
    ctx.fillRect(60, y, 6, 22);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class ProceduralCity {
  public group: THREE.Group = new THREE.Group();
  public colliders: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }> = [];
  private roadTex: THREE.CanvasTexture;
  private streetLights: THREE.PointLight[] = [];

  constructor() {
    this.roadTex = createRoadAsphaltTexture();
    this.roadTex.repeat.set(1, 4);

    this.buildTerrain();
    this.buildRoadNetwork();
    this.buildDistrictBuildings();
    this.buildOverheadCables();
    this.buildStreetLifeProps();
    this.buildVegetation();
  }

  private buildTerrain() {
    const terrainGeo = new THREE.PlaneGeometry(600, 600, 4, 4);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x243e26,
      roughness: 0.9,
      metalness: 0.05
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -0.05;
    terrain.receiveShadow = true;
    this.group.add(terrain);

    // Dhanmondi Lake
    const lakeGeo = new THREE.PlaneGeometry(120, 60);
    const lakeMat = new THREE.MeshStandardMaterial({
      color: 0x0f4c5c,
      roughness: 0.15,
      metalness: 0.8
    });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(-140, 0.01, -110);
    this.group.add(lake);
  }

  private buildRoadNetwork() {
    const nodeMap = new Map<string, typeof ROAD_NODES[0]>();
    ROAD_NODES.forEach((n) => nodeMap.set(n.id, n));

    const roadMat = new THREE.MeshStandardMaterial({
      map: this.roadTex,
      roughness: 0.85,
      metalness: 0.1
    });

    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8,
      metalness: 0.05
    });

    const curbMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.7,
      metalness: 0.1
    });

    ROAD_EDGES.forEach((edge) => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (!from || !to) return;

      const dx = to.x - from.x;
      const dz = to.z - from.z;
      const length = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const roadWidth = edge.lanes * 5.0;

      // Asphalt Road Segment
      const roadGeo = new THREE.PlaneGeometry(roadWidth, length);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.rotation.z = -angle;
      roadMesh.position.set((from.x + to.x) / 2, 0.02, (from.z + to.z) / 2);
      roadMesh.receiveShadow = true;
      this.group.add(roadMesh);

      // Flanking Sidewalks
      [-1, 1].forEach((side) => {
        const sideOffset = (roadWidth / 2 + 1.2) * side;
        const normX = Math.cos(angle) * sideOffset;
        const normZ = -Math.sin(angle) * sideOffset;

        const walkGeo = new THREE.BoxGeometry(2.0, 0.25, length);
        const walkMesh = new THREE.Mesh(walkGeo, sidewalkMat);
        walkMesh.rotation.y = angle;
        walkMesh.position.set((from.x + to.x) / 2 + normX, 0.125, (from.z + to.z) / 2 + normZ);
        walkMesh.receiveShadow = true;
        this.group.add(walkMesh);
      });
    });

    // Intersections roundabouts
    ROAD_NODES.forEach((node) => {
      const radius = node.isIntersection ? 8.0 : 5.5;
      const juncGeo = new THREE.CylinderGeometry(radius, radius, 0.05, 12);
      const juncMesh = new THREE.Mesh(juncGeo, roadMat);
      juncMesh.position.set(node.x, 0.025, node.z);
      juncMesh.receiveShadow = true;
      this.group.add(juncMesh);

      // Roundabout Island at main hubs
      if (node.isIntersection && (node.id === 'sb_center' || node.id === 'gl_circle_1' || node.id === 'fg_metro_station')) {
        const islandGroup = new THREE.Group();
        islandGroup.position.set(node.x, 0, node.z);

        const curbMesh = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.8, 0.5, 12), curbMat);
        curbMesh.position.y = 0.25;
        islandGroup.add(curbMesh);

        const monumentBase = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.6, 1.8, 8),
          new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 })
        );
        monumentBase.position.y = 1.15;
        islandGroup.add(monumentBase);

        const sculpture = new THREE.Mesh(
          new THREE.ConeGeometry(0.8, 2.2, 5),
          new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.2, metalness: 0.7 })
        );
        sculpture.position.y = 2.6;
        islandGroup.add(sculpture);

        this.group.add(islandGroup);

        this.colliders.push({
          minX: node.x - 3.5,
          maxX: node.x + 3.5,
          minZ: node.z - 3.5,
          maxZ: node.z + 3.5
        });
      }
    });
  }

  private buildDistrictBuildings() {
    // 1. Pre-generate and cache shared facade textures (ONLY 4 TEXTURES TOTAL!)
    const facadeTexList = [
      createBuildingFacadeTexture('#cbd5e1', '#0284c7', 4),
      createBuildingFacadeTexture('#fed7aa', '#dc2626', 4),
      createBuildingFacadeTexture('#e2e8f0', '#16a34a', 5),
      createBuildingFacadeTexture('#bae6fd', '#9333ea', 6)
    ];

    // 2. Pre-generate shared storefront banners (ONLY 6 TEXTURES TOTAL!)
    const bannerDefs = [
      { name: 'ঢাকা বিরিয়ানি হাউস', sub: 'Dhaka Biryani House', bg: '#b91c1c' },
      { name: 'সোনালী ব্যাংক পিএলসি', sub: 'Sonali Bank Ltd', bg: '#047857' },
      { name: 'ধানমন্ডি ফার্মেসি', sub: '24/7 Dhanmondi Pharmacy', bg: '#0369a1' },
      { name: 'বাঙালি সুইটস ও বেকারি', sub: 'Bengali Sweets & Bakery', bg: '#c2410c' },
      { name: 'মেট্রো ফ্যাশন মল', sub: 'Metro Fashion Mall', bg: '#7c3aed' },
      { name: 'লালবাগ জুয়েলার্স', sub: 'Lalbagh Gold & Gems', bg: '#b45309' }
    ];
    const bannerTexList = bannerDefs.map((b) => createStorefrontTexture(b.name, b.sub, b.bg));

    // Shared materials
    const facadeMats = facadeTexList.map((tex) => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
    const bannerMats = bannerTexList.map((tex) => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 }));
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
    const acMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });

    const buildingPlots: Array<{ x: number; z: number; width: number; depth: number; height: number; district: string }> = [];

    // Compact optimized cluster counts
    this.addPlotCluster(buildingPlots, 38, -35, 4, 25, 'shahbagh', 16, 26);
    this.addPlotCluster(buildingPlots, -45, -20, 4, 22, 'shahbagh', 14, 24);
    this.addPlotCluster(buildingPlots, -30, 120, 5, 24, 'farmgate', 20, 36);
    this.addPlotCluster(buildingPlots, 30, 140, 5, 24, 'farmgate', 22, 38);
    this.addPlotCluster(buildingPlots, -165, -75, 5, 22, 'dhanmondi', 16, 30);
    this.addPlotCluster(buildingPlots, -195, -15, 5, 24, 'dhanmondi', 16, 28);
    this.addPlotCluster(buildingPlots, -105, -145, 5, 18, 'old_dhaka', 12, 20);
    this.addPlotCluster(buildingPlots, -140, -170, 5, 18, 'old_dhaka', 12, 18);
    this.addPlotCluster(buildingPlots, 150, 60, 4, 26, 'gulshan', 26, 45);
    this.addPlotCluster(buildingPlots, 185, 110, 4, 28, 'gulshan', 30, 50);

    buildingPlots.forEach((plot, idx) => {
      const bldgGroup = new THREE.Group();
      bldgGroup.position.set(plot.x, 0, plot.z);

      // Part 1: Main Building Core
      const coreMat = facadeMats[idx % facadeMats.length];
      const coreGeo = new THREE.BoxGeometry(plot.width, plot.height, plot.depth);
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.y = plot.height / 2;
      coreMesh.castShadow = true;
      coreMesh.receiveShadow = true;
      bldgGroup.add(coreMesh);

      // Part 2: Ground Floor Storefront Sign
      const signMat = bannerMats[idx % bannerMats.length];
      const signGeo = new THREE.BoxGeometry(plot.width * 0.88, 2.4, 0.3);
      const signMesh = new THREE.Mesh(signGeo, signMat);
      signMesh.position.set(0, 3.2, plot.depth / 2 + 0.2);
      bldgGroup.add(signMesh);

      // Part 3: Canopy Awning
      const awning = new THREE.Mesh(new THREE.BoxGeometry(plot.width * 0.9, 0.2, 1.5), awningMat);
      awning.position.set(0, 1.9, plot.depth / 2 + 0.8);
      bldgGroup.add(awning);

      // Part 4: Rooftop Water Tank
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.8, 8), tankMat);
      tank.position.set(-plot.width * 0.25, plot.height + 0.9, -plot.depth * 0.2);
      bldgGroup.add(tank);

      // Part 5: AC Unit
      const ac = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.5), acMat);
      ac.position.set(plot.width * 0.25, 6, plot.depth / 2 + 0.25);
      bldgGroup.add(ac);

      this.group.add(bldgGroup);

      // Bounding box collider
      const halfW = (plot.width * 1.05) / 2;
      const halfD = (plot.depth * 1.05) / 2;
      this.colliders.push({
        minX: plot.x - halfW,
        maxX: plot.x + halfW,
        minZ: plot.z - halfD,
        maxZ: plot.z + halfD
      });
    });
  }

  private addPlotCluster(
    plots: Array<any>,
    startX: number,
    startZ: number,
    count: number,
    spacing: number,
    district: string,
    minH: number,
    maxH: number
  ) {
    for (let i = 0; i < count; i++) {
      const offsetX = (i % 2 === 0 ? 1 : -1) * (i * 2.5);
      const offsetZ = i * spacing;
      const height = minH + Math.random() * (maxH - minH);
      const width = 14 + (i % 3) * 2;
      const depth = 14 + (i % 3) * 2;
      plots.push({
        x: startX + offsetX,
        z: startZ + offsetZ,
        width,
        depth,
        height,
        district
      });
    }
  }

  private buildOverheadCables() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const cableMat = new THREE.LineBasicMaterial({ color: 0x09090b });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const polePositions: THREE.Vector3[] = [
      new THREE.Vector3(-15, 0, -25),
      new THREE.Vector3(15, 0, -25),
      new THREE.Vector3(-15, 0, 45),
      new THREE.Vector3(15, 0, 45),
      new THREE.Vector3(-15, 0, 115),
      new THREE.Vector3(15, 0, 115)
    ];

    polePositions.forEach((pos) => {
      const poleGroup = new THREE.Group();
      poleGroup.position.copy(pos);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 9, 6), poleMat);
      pole.position.y = 4.5;
      poleGroup.add(pole);

      const arm1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.15), poleMat);
      arm1.position.y = 8.0;
      poleGroup.add(arm1);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), bulbMat);
      bulb.position.set(0, 8.0, 0.7);
      poleGroup.add(bulb);

      this.group.add(poleGroup);
    });

    // Hanging catenary wires
    for (let i = 0; i < polePositions.length - 1; i += 2) {
      const p1 = polePositions[i].clone().add(new THREE.Vector3(0, 7.8, 0));
      const p2 = polePositions[i + 1].clone().add(new THREE.Vector3(0, 7.8, 0));

      const points = [];
      const segs = 6;
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const x = THREE.MathUtils.lerp(p1.x, p2.x, t);
        const z = THREE.MathUtils.lerp(p1.z, p2.z, t);
        const sag = Math.sin(t * Math.PI) * 0.7;
        const y = THREE.MathUtils.lerp(p1.y, p2.y, t) - sag;
        points.push(new THREE.Vector3(x, y, z));
      }
      const wireGeo = new THREE.BufferGeometry().setFromPoints(points);
      const wireLine = new THREE.Line(wireGeo, cableMat);
      this.group.add(wireLine);
    }
  }

  private buildStreetLifeProps() {
    // Roadside Tong-er Cha
    const teaStallLocations = [
      new THREE.Vector3(-18, 0, -38),
      new THREE.Vector3(18, 0, 15),
      new THREE.Vector3(-155, 0, -48),
      new THREE.Vector3(18, 0, 175)
    ];

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
    const tinMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.5 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });

    teaStallLocations.forEach((pos) => {
      const stall = new THREE.Group();
      stall.position.copy(pos);

      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 0.5), woodMat);
      bench.position.set(0, 0.25, 0);
      stall.add(bench);

      const table = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.7), woodMat);
      table.position.set(0, 0.45, 0.9);
      stall.add(table);

      // Aluminum Kettle
      const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.35, 8), silverMat);
      kettle.position.set(-0.4, 1.05, 0.9);
      stall.add(kettle);

      // Tin Roof
      const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.8), tinMat);
      roof.position.set(0, 2.2, 0.45);
      roof.rotation.x = 0.1;
      stall.add(roof);

      this.group.add(stall);
    });
  }

  private buildVegetation() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
    const leafMat2 = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7 });

    const treeLocations = [
      new THREE.Vector3(-25, 0, -10),
      new THREE.Vector3(-35, 0, -65),
      new THREE.Vector3(25, 0, -75),
      new THREE.Vector3(-125, 0, -35),
      new THREE.Vector3(-155, 0, -95),
      new THREE.Vector3(75, 0, 70),
      new THREE.Vector3(-25, 0, 140),
      new THREE.Vector3(-75, 0, 120)
    ];

    treeLocations.forEach((pos, idx) => {
      const tree = new THREE.Group();
      tree.position.copy(pos);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 4.0, 6), trunkMat);
      trunk.position.y = 2.0;
      tree.add(trunk);

      const leafMat = idx % 3 === 0 ? leafMat2 : leafMat1;
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2), leafMat);
      canopy.position.y = 4.4;
      tree.add(canopy);

      this.group.add(tree);
    });
  }

  public setNightMode(isNight: boolean) {
    // Night ambient toggle
  }
}

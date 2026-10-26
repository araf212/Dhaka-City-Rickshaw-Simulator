import * as THREE from 'three';
import { ROAD_NODES, ROAD_EDGES, DHAKA_DISTRICTS } from './RoadGraph';

/**
 * Procedural texture helpers for authentic Dhaka city visuals
 */
function createStorefrontTexture(storeName: string, subText: string, bgColor: string, textColor: string = '#ffffff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Background banner
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  // Border accents
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 116);

  // Bengali title
  ctx.fillStyle = textColor;
  ctx.font = 'bold 36px "Hind Siliguri", "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(storeName, 256, 50);

  // English subtext
  ctx.font = '600 18px "Outfit", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText(subText, 256, 92);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBuildingFacadeTexture(primaryColor: string, accentColor: string, rows: number = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Concrete / plaster wall
  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, 512, 512);

  // Window grid & balconies
  const cols = 4;
  const padX = 35;
  const padY = 30;
  const w = (512 - padX * (cols + 1)) / cols;
  const h = (512 - padY * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * (w + padX);
      const y = padY + r * (h + padY);

      // Window frame
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, w, h);

      // Window glass (tinted / reflected)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 4, y + 4, w - 8, h - 16);

      // Window grill lines
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 4);
      ctx.lineTo(x + w / 2, y + h - 12);
      ctx.stroke();

      // Balcony railing
      ctx.fillStyle = accentColor;
      ctx.fillRect(x - 2, y + h - 12, w + 4, 12);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createRoadAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base
  ctx.fillStyle = '#22252a';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle gravel noise
  for (let i = 0; i < 2000; i++) {
    const gray = Math.floor(30 + Math.random() * 25);
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }

  // Center dashed road markings
  ctx.fillStyle = '#fef08a';
  for (let y = 15; y < 256; y += 60) {
    ctx.fillRect(124, y, 8, 35);
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
    // Vast lush green terrain plane representing Dhaka delta basin
    const terrainGeo = new THREE.PlaneGeometry(800, 800, 32, 32);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x243e26, // Tropical grass green
      roughness: 0.9,
      metalness: 0.05
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -0.05;
    terrain.receiveShadow = true;
    this.group.add(terrain);

    // Dhanmondi Lake water body
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
      color: 0x94a3b8, // Light concrete
      roughness: 0.8,
      metalness: 0.05
    });

    const curbMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber curb warning
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
      const roadWidth = edge.lanes * 5.0; // 5m per lane pair

      // 1. Asphalt Road Segment
      const roadGeo = new THREE.PlaneGeometry(roadWidth, length);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.rotation.z = -angle;
      roadMesh.position.set((from.x + to.x) / 2, 0.02, (from.z + to.z) / 2);
      roadMesh.receiveShadow = true;
      this.group.add(roadMesh);

      // 2. Flanking Concrete Sidewalks
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

        // Yellow/Black Traffic Curb
        const curbGeo = new THREE.BoxGeometry(0.3, 0.3, length);
        const curbMesh = new THREE.Mesh(curbGeo, curbMat);
        curbMesh.rotation.y = angle;
        const curbNormX = Math.cos(angle) * (sideOffset - 1.0 * side);
        const curbNormZ = -Math.sin(angle) * (sideOffset - 1.0 * side);
        curbMesh.position.set((from.x + to.x) / 2 + curbNormX, 0.15, (from.z + to.z) / 2 + curbNormZ);
        this.group.add(curbMesh);
      });
    });

    // Intersections roundabouts & plazas
    ROAD_NODES.forEach((node) => {
      const radius = node.isIntersection ? 9.0 : 6.0;
      const juncGeo = new THREE.CylinderGeometry(radius, radius, 0.05, 16);
      const juncMesh = new THREE.Mesh(juncGeo, roadMat);
      juncMesh.position.set(node.x, 0.025, node.z);
      juncMesh.receiveShadow = true;
      this.group.add(juncMesh);

      // Central island for roundabouts (like Shahbagh Moor or TSC)
      if (node.isIntersection && (node.id === 'sb_center' || node.id === 'gl_circle_1' || node.id === 'fg_metro_station')) {
        const islandGroup = new THREE.Group();
        islandGroup.position.set(node.x, 0, node.z);

        // Circular raised curb
        const curbGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.5, 16);
        const curbMesh = new THREE.Mesh(curbGeo, curbMat);
        curbMesh.position.y = 0.25;
        islandGroup.add(curbMesh);

        // Grass center
        const grassGeo = new THREE.CylinderGeometry(3.4, 3.4, 0.52, 16);
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 });
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.position.y = 0.26;
        islandGroup.add(grass);

        // Central Monument / Sculpture / Fountain
        const monumentBase = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.6, 1.8, 8),
          new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.1 })
        );
        monumentBase.position.y = 1.15;
        monumentBase.castShadow = true;
        islandGroup.add(monumentBase);

        // Stylized Dhaka shapla / water lily emblem sculpture
        const sculpture = new THREE.Mesh(
          new THREE.ConeGeometry(0.8, 2.5, 5),
          new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.2, metalness: 0.7 })
        );
        sculpture.position.y = 2.8;
        sculpture.castShadow = true;
        islandGroup.add(sculpture);

        this.group.add(islandGroup);

        // Add collider for roundabout island
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
    const banners = [
      { name: 'ঢাকা বিরিয়ানি হাউস', sub: 'Dhaka Biryani House', bg: '#b91c1c' },
      { name: 'সোনালী ব্যাংক পিএলসি', sub: 'Sonali Bank Ltd', bg: '#047857' },
      { name: 'ধানমন্ডি ফার্মেসি', sub: '24/7 Dhanmondi Pharmacy', bg: '#0369a1' },
      { name: 'বাঙালি সুইটস ও বেকারি', sub: 'Bengali Sweets & Bakery', bg: '#c2410c' },
      { name: 'মেট্রো ফ্যাশন মল', sub: 'Metro Fashion Mall', bg: '#7c3aed' },
      { name: 'মা বাবার দোয়া স্টোর', sub: 'General & Grocery Store', bg: '#4d7c0f' },
      { name: 'স্টার টি স্টল ও কাবাব', sub: 'Star Tea & Kebab', bg: '#991b1b' },
      { name: 'ডিজিটাল কম্পিউটার হাব', sub: 'Digital Cyber Point', bg: '#1d4ed8' },
      { name: 'লালবাগ জুয়েলার্স', sub: 'Lalbagh Gold & Gems', bg: '#b45309' },
      { name: 'বইমেলা বুক গ্যালারি', sub: 'Boimela Book Depot', bg: '#475569' }
    ];

    const wallColors = [
      '#cbd5e1', '#e2e8f0', '#fde68a', '#fed7aa', '#fbcfe8', '#bae6fd', '#d9f99d', '#e5e7eb'
    ];
    const accentColors = ['#0284c7', '#16a34a', '#dc2626', '#d97706', '#9333ea', '#475569'];

    // Generate clusters of buildings flanking the districts
    const buildingPlots: Array<{ x: number; z: number; width: number; depth: number; height: number; rotation: number; district: string }> = [];

    // District-specific buildings
    // 1. Shahbagh & University area (Moderate height, grander institutional colonial & modern blend)
    this.addPlotCluster(buildingPlots, 40, -40, 6, 25, 'shahbagh', 16, 32);
    this.addPlotCluster(buildingPlots, -50, -20, 5, 20, 'shahbagh', 14, 28);

    // 2. Farmgate / Tejgaon (High density, mixed commercial)
    this.addPlotCluster(buildingPlots, -35, 120, 8, 22, 'farmgate', 22, 45);
    this.addPlotCluster(buildingPlots, 35, 140, 8, 22, 'farmgate', 24, 48);
    this.addPlotCluster(buildingPlots, -30, 200, 6, 25, 'farmgate', 20, 40);

    // 3. Dhanmondi (Apartment blocks with balconies and storefronts on Satmasjid Rd)
    this.addPlotCluster(buildingPlots, -170, -80, 8, 20, 'dhanmondi', 18, 36);
    this.addPlotCluster(buildingPlots, -205, -20, 7, 22, 'dhanmondi', 16, 34);
    this.addPlotCluster(buildingPlots, -135, 10, 6, 22, 'dhanmondi', 16, 30);

    // 4. Old Dhaka / Lalbagh (Dense, warm brick/ochre tones, narrow facades, close together)
    this.addPlotCluster(buildingPlots, -110, -145, 9, 16, 'old_dhaka', 12, 24);
    this.addPlotCluster(buildingPlots, -150, -170, 8, 16, 'old_dhaka', 12, 22);
    this.addPlotCluster(buildingPlots, -80, -180, 8, 18, 'old_dhaka', 10, 20);

    // 5. Gulshan & Banani (Sleek modern glass & concrete corporate towers)
    this.addPlotCluster(buildingPlots, 155, 60, 6, 26, 'gulshan', 30, 65);
    this.addPlotCluster(buildingPlots, 195, 110, 7, 28, 'gulshan', 35, 75);
    this.addPlotCluster(buildingPlots, 130, 180, 6, 26, 'gulshan', 28, 55);

    // Construct 3-8 part composite buildings for each plot
    buildingPlots.forEach((plot, idx) => {
      const bldgGroup = new THREE.Group();
      bldgGroup.position.set(plot.x, 0, plot.z);
      bldgGroup.rotation.y = plot.rotation;

      const wallColor = wallColors[idx % wallColors.length];
      const accent = accentColors[idx % accentColors.length];
      const facadeTex = createBuildingFacadeTexture(wallColor, accent, Math.floor(plot.height / 6));

      // Part 1: Main Building Core
      const coreMat = new THREE.MeshStandardMaterial({
        map: facadeTex,
        roughness: 0.7,
        metalness: plot.district === 'gulshan' ? 0.45 : 0.1
      });
      const coreGeo = new THREE.BoxGeometry(plot.width, plot.height, plot.depth);
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.y = plot.height / 2;
      coreMesh.castShadow = true;
      coreMesh.receiveShadow = true;
      bldgGroup.add(coreMesh);

      // Part 2: Ground Floor Storefront Sign / Canopy
      const bannerData = banners[idx % banners.length];
      const signTex = createStorefrontTexture(bannerData.name, bannerData.sub, bannerData.bg);
      const signGeo = new THREE.BoxGeometry(plot.width * 0.9, 2.5, 0.4);
      const signMat = new THREE.MeshStandardMaterial({
        map: signTex,
        roughness: 0.3,
        metalness: 0.2
      });
      const signMesh = new THREE.Mesh(signGeo, signMat);
      signMesh.position.set(0, 3.5, plot.depth / 2 + 0.25);
      bldgGroup.add(signMesh);

      // Cloth / Tin awning over storefront
      const awningGeo = new THREE.BoxGeometry(plot.width * 0.92, 0.3, 1.8);
      const awningMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x0284c7 : 0xd97706,
        roughness: 0.8
      });
      const awningMesh = new THREE.Mesh(awningGeo, awningMat);
      awningMesh.position.set(0, 2.0, plot.depth / 2 + 0.9);
      awningMesh.rotation.x = 0.15;
      bldgGroup.add(awningMesh);

      // Part 3: Rooftop Water Tank (Signature Dhaka rooftop cylinder)
      const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 12);
      const tankMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x1e3a8a : 0x0f172a, // Blue or black Sintex style
        roughness: 0.5,
        metalness: 0.2
      });
      const tankMesh = new THREE.Mesh(tankGeo, tankMat);
      tankMesh.position.set(-plot.width * 0.25, plot.height + 1.1, -plot.depth * 0.2);
      tankMesh.castShadow = true;
      bldgGroup.add(tankMesh);

      // Part 4: Rooftop Parapet Railing
      const parapetGeo = new THREE.BoxGeometry(plot.width, 0.8, plot.depth);
      const parapetMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.9
      });
      const parapetMesh = new THREE.Mesh(parapetGeo, parapetMat);
      parapetMesh.position.y = plot.height + 0.4;
      bldgGroup.add(parapetMesh);

      // Part 5: AC Condenser units attached on facade
      for (let ac = 0; ac < 2; ac++) {
        const acGeo = new THREE.BoxGeometry(1.2, 0.8, 0.6);
        const acMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.3 });
        const acMesh = new THREE.Mesh(acGeo, acMat);
        acMesh.position.set((ac - 0.5) * (plot.width * 0.4), 6 + ac * 4, plot.depth / 2 + 0.3);
        bldgGroup.add(acMesh);
      }

      this.group.add(bldgGroup);

      // Register bounding box collider for rickshaw physics
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
      const offsetX = (i % 2 === 0 ? 1 : -1) * (i * 3);
      const offsetZ = i * spacing;
      const height = minH + Math.random() * (maxH - minH);
      const width = 14 + Math.random() * 6;
      const depth = 14 + Math.random() * 6;
      plots.push({
        x: startX + offsetX,
        z: startZ + offsetZ,
        width,
        depth,
        height,
        rotation: (Math.random() - 0.5) * 0.2,
        district
      });
    }
  }

  private buildOverheadCables() {
    // Concrete electric utility poles with hanging tangled cables
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const cableMat = new THREE.LineBasicMaterial({ color: 0x09090b });

    const polePositions: THREE.Vector3[] = [
      new THREE.Vector3(-15, 0, -25),
      new THREE.Vector3(15, 0, -25),
      new THREE.Vector3(-15, 0, 35),
      new THREE.Vector3(15, 0, 35),
      new THREE.Vector3(-15, 0, 95),
      new THREE.Vector3(15, 0, 95),
      new THREE.Vector3(-105, 0, -25),
      new THREE.Vector3(-145, 0, -25),
      new THREE.Vector3(-105, 0, -135),
      new THREE.Vector3(-75, 0, -170)
    ];

    polePositions.forEach((pos) => {
      const poleGroup = new THREE.Group();
      poleGroup.position.copy(pos);

      // Main tall pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 9, 8), poleMat);
      pole.position.y = 4.5;
      pole.castShadow = true;
      poleGroup.add(pole);

      // Horizontal cross-arms
      const arm1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.15), poleMat);
      arm1.position.y = 8.0;
      poleGroup.add(arm1);

      const arm2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.15), poleMat);
      arm2.position.y = 7.2;
      poleGroup.add(arm2);

      // Street lamp
      const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.2, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
      );
      lampHead.position.set(0, 8.2, 0.7);
      poleGroup.add(lampHead);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      bulb.position.set(0, 8.0, 0.7);
      poleGroup.add(bulb);

      // Point light for night atmosphere
      const streetLight = new THREE.PointLight(0xffedd5, 0.8, 22, 1.2);
      streetLight.position.set(pos.x, 7.8, pos.z + 0.7);
      this.streetLights.push(streetLight);
      this.group.add(streetLight);

      this.group.add(poleGroup);
    });

    // Hanging tangled catenary wires connecting adjacent poles
    for (let i = 0; i < polePositions.length - 1; i += 2) {
      const p1 = polePositions[i].clone().add(new THREE.Vector3(0, 7.8, 0));
      const p2 = polePositions[i + 1].clone().add(new THREE.Vector3(0, 7.8, 0));

      const points = [];
      const segs = 10;
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const x = THREE.MathUtils.lerp(p1.x, p2.x, t);
        const z = THREE.MathUtils.lerp(p1.z, p2.z, t);
        // Catenary sag curve
        const sag = Math.sin(t * Math.PI) * 0.8;
        const y = THREE.MathUtils.lerp(p1.y, p2.y, t) - sag;
        points.push(new THREE.Vector3(x, y, z));
      }
      const wireGeo = new THREE.BufferGeometry().setFromPoints(points);
      const wireLine = new THREE.Line(wireGeo, cableMat);
      this.group.add(wireLine);
    }
  }

  private buildStreetLifeProps() {
    // Roadside Tong-er Cha (Dhaka Tea Stalls)
    const teaStallLocations = [
      new THREE.Vector3(-18, 0, -38), // Near TSC
      new THREE.Vector3(18, 0, 15),  // Near Shahbagh
      new THREE.Vector3(-155, 0, -48), // Dhanmondi Lake
      new THREE.Vector3(-85, 0, -165), // Old Dhaka
      new THREE.Vector3(18, 0, 175)  // Farmgate
    ];

    teaStallLocations.forEach((pos) => {
      const stall = new THREE.Group();
      stall.position.copy(pos);

      // Wooden bench
      const benchGeo = new THREE.BoxGeometry(2.4, 0.45, 0.6);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 });
      const bench = new THREE.Mesh(benchGeo, woodMat);
      bench.position.set(0, 0.25, 0);
      stall.add(bench);

      // Tea counter table
      const tableGeo = new THREE.BoxGeometry(2.2, 0.9, 0.8);
      const table = new THREE.Mesh(tableGeo, woodMat);
      table.position.set(0, 0.45, 1.0);
      stall.add(table);

      // Shiny silver aluminum kettle (কেতলি)
      const kettleGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 10);
      const kettleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
      const kettle = new THREE.Mesh(kettleGeo, kettleMat);
      kettle.position.set(-0.5, 1.1, 1.0);
      stall.add(kettle);

      // Condensed milk cans & biscuit jars
      const jarGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8);
      const jarMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
      const jar = new THREE.Mesh(jarGeo, jarMat);
      jar.position.set(0.3, 1.05, 1.0);
      stall.add(jar);

      // Corrugated tin roof over tea stall
      const roofGeo = new THREE.BoxGeometry(3.0, 0.1, 2.2);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.5 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(0, 2.3, 0.5);
      roof.rotation.x = 0.1;
      stall.add(roof);

      // Wooden roof support poles
      [-1.3, 1.3].forEach((x) => {
        const pGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6);
        const pMesh = new THREE.Mesh(pGeo, woodMat);
        pMesh.position.set(x, 1.1, 1.5);
        stall.add(pMesh);
      });

      this.group.add(stall);
    });

    // Fuchka / Chotpoti Street Food Carts
    const fuchkaCartLocations = [
      new THREE.Vector3(-14, 0, -50),
      new THREE.Vector3(-150, 0, -65)
    ];

    fuchkaCartLocations.forEach((pos) => {
      const cart = new THREE.Group();
      cart.position.copy(pos);

      // Cart body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.8, 1.0),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 })
      );
      body.position.y = 0.6;
      cart.add(body);

      // Glass showcase box containing crisp golden fuchkas
      const glassBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.6, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.2, transparent: true, opacity: 0.85 })
      );
      glassBox.position.set(0, 1.3, 0);
      cart.add(glassBox);

      // Cart spoke wheels
      [-0.55, 0.55].forEach((z) => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.1, 12),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
        );
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(0, 0.35, z);
        cart.add(wheel);
      });

      this.group.add(cart);
    });
  }

  private buildVegetation() {
    // Lush Dhaka Banyan & Krishnachura Trees with vibrant foliage
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 }); // Deep monsoon green
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7 }); // Krishnachura vibrant red blossoms

    const treeLocations = [
      new THREE.Vector3(-25, 0, -10),
      new THREE.Vector3(-35, 0, -65),
      new THREE.Vector3(25, 0, -75),
      new THREE.Vector3(-125, 0, -35),
      new THREE.Vector3(-155, 0, -95),
      new THREE.Vector3(-120, 0, -105),
      new THREE.Vector3(75, 0, 70),
      new THREE.Vector3(95, 0, 110),
      new THREE.Vector3(-25, 0, 140),
      new THREE.Vector3(-75, 0, 120),
      new THREE.Vector3(-120, 0, -190)
    ];

    treeLocations.forEach((pos, idx) => {
      const tree = new THREE.Group();
      tree.position.copy(pos);

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 4.5, 8), trunkMat);
      trunk.position.y = 2.25;
      trunk.castShadow = true;
      tree.add(trunk);

      // Multi-layered lush canopy (3 distinct parts)
      const isKrishnachura = idx % 3 === 0;
      const leafMat = isKrishnachura ? foliageMat2 : foliageMat1;

      const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4), leafMat);
      canopy1.position.y = 4.8;
      canopy1.castShadow = true;
      tree.add(canopy1);

      const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8), leafMat);
      canopy2.position.set(1.0, 5.4, 0.8);
      canopy2.castShadow = true;
      tree.add(canopy2);

      const canopy3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9), leafMat);
      canopy3.position.set(-0.8, 5.2, -0.7);
      canopy3.castShadow = true;
      tree.add(canopy3);

      this.group.add(tree);
    });
  }

  public setNightMode(isNight: boolean) {
    this.streetLights.forEach((light) => {
      light.intensity = isNight ? 1.4 : 0.0;
    });
  }
}

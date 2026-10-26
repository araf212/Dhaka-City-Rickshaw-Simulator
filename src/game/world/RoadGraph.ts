import { DistrictId, DistrictInfo, RoadNode, RoadEdge, NavPath } from '../types';

export const DHAKA_DISTRICTS: Record<DistrictId, DistrictInfo> = {
  shahbagh: {
    id: 'shahbagh',
    name: 'Shahbagh & TSC',
    banglaName: 'শাহবাগ ও টিএসসি',
    description: 'The cultural heart of Dhaka, famous for university avenues, roundabouts, and bookstalls.',
    center: [0, 0],
    color: '#3b82f6',
    landmarks: ['Shahbagh Moor (শাহবাগ মোড়)', 'TSC Dhaka University (টিএসসি)', 'National Museum (জাতীয় জাদুঘর)', 'Curzon Hall']
  },
  farmgate: {
    id: 'farmgate',
    name: 'Farmgate & Tejgaon',
    banglaName: 'ফার্মগেট ও তেজগাঁও',
    description: 'Bustling transit hub with the elevated Dhaka Metro Rail (MRT Line 6) soaring above.',
    center: [0, 150],
    color: '#10b981',
    landmarks: ['Farmgate Metro Station (মেট্রোরেল স্টেশন)', 'Khamarbari (খামারবাড়ি)', 'Ananda Cinema (আনন্দ সিনেমা)']
  },
  dhanmondi: {
    id: 'dhanmondi',
    name: 'Dhanmondi',
    banglaName: 'ধানমন্ডি',
    description: 'Lakeside avenues, leafy lanes, bustling cafes, and schools along Satmasjid Road.',
    center: [-150, -50],
    color: '#8b5cf6',
    landmarks: ['Satmasjid Road (সাতমসজিদ রোড)', 'Dhanmondi Lake Bridge (ধানমন্ডি লেক)', 'Road 27 (২৭ নম্বর রোড)']
  },
  old_dhaka: {
    id: 'old_dhaka',
    name: 'Old Dhaka (Puran Dhaka)',
    banglaName: 'পুরান ঢাকা',
    description: 'Historic district with rich heritage, vibrant food stalls, historic architecture, and festive charm.',
    center: [-100, -180],
    color: '#f59e0b',
    landmarks: ['Lalbagh Fort Gate (লালবাগ কেল্লা)', 'Chawkbazar (চকবাজার)', 'Bakshibazar Moor (বকশীবাজার)']
  },
  gulshan: {
    id: 'gulshan',
    name: 'Gulshan & Banani',
    banglaName: 'গুলশান ও বনানী',
    description: 'Modern high-rises, wide boulevards, glass office towers, and vibrant roundabouts.',
    center: [160, 100],
    color: '#ec4899',
    landmarks: ['Gulshan-1 Circle (গুলশান-১ চত্বর)', 'Kemal Ataturk Ave (কামাল আতাতুর্ক এভিনিউ)', 'Shopper Plaza']
  }
};

/**
 * Validated Dhaka Road Graph nodes
 */
export const ROAD_NODES: RoadNode[] = [
  // Shahbagh District
  { id: 'sb_center', x: 0, z: 0, district: 'shahbagh', name: 'Shahbagh Moor', isIntersection: true, hasTrafficLight: true },
  { id: 'sb_tsc', x: -30, z: -45, district: 'shahbagh', name: 'TSC Roundabout', isIntersection: true },
  { id: 'sb_curzon', x: -20, z: -90, district: 'shahbagh', name: 'Curzon Hall Corner' },
  { id: 'sb_museum', x: 35, z: -15, district: 'shahbagh', name: 'National Museum Gate' },
  { id: 'sb_matsya', x: 45, z: -60, district: 'shahbagh', name: 'Matsya Bhaban Junction', isIntersection: true, hasTrafficLight: true },
  { id: 'sb_banglamotor', x: 0, z: 70, district: 'shahbagh', name: 'Banglamotor Crossing', isIntersection: true, hasTrafficLight: true },

  // Farmgate & Tejgaon District
  { id: 'fg_kawran', x: 0, z: 110, district: 'farmgate', name: 'Karwan Bazar Moor', isIntersection: true, hasTrafficLight: true },
  { id: 'fg_metro_station', x: 0, z: 160, district: 'farmgate', name: 'Farmgate Metro Station', isIntersection: true, hasTrafficLight: true },
  { id: 'fg_ananda', x: -40, z: 160, district: 'farmgate', name: 'Ananda Cinema Lane' },
  { id: 'fg_khamarbari', x: -60, z: 130, district: 'farmgate', name: 'Khamarbari Roundabout', isIntersection: true },
  { id: 'fg_tejgaon_link', x: 60, z: 170, district: 'farmgate', name: 'Tejgaon Link Road', isIntersection: true },
  { id: 'fg_bijoy_sarani', x: 10, z: 220, district: 'farmgate', name: 'Bijoy Sarani Metro Pillar', isIntersection: true, hasTrafficLight: true },

  // Dhanmondi District
  { id: 'dh_science_lab', x: -90, z: -30, district: 'dhanmondi', name: 'Science Lab Crossing', isIntersection: true, hasTrafficLight: true },
  { id: 'dh_road_2', x: -140, z: -30, district: 'dhanmondi', name: 'Dhanmondi Road 2' },
  { id: 'dh_satmasjid_s', x: -170, z: -40, district: 'dhanmondi', name: 'Satmasjid Road South', isIntersection: true },
  { id: 'dh_lake', x: -140, z: -70, district: 'dhanmondi', name: 'Dhanmondi Lake Bridge' },
  { id: 'dh_satmasjid_n', x: -170, z: 40, district: 'dhanmondi', name: 'Satmasjid Road North (Rd 27)', isIntersection: true, hasTrafficLight: true },
  { id: 'dh_shankar', x: -190, z: 0, district: 'dhanmondi', name: 'Shankar Bus Stand' },
  { id: 'dh_kalabagan', x: -110, z: 30, district: 'dhanmondi', name: 'Kalabagan 1st Lane', isIntersection: true },

  // Old Dhaka / Lalbagh District
  { id: 'od_bakshibazar', x: -60, z: -140, district: 'old_dhaka', name: 'Bakshibazar Moor', isIntersection: true },
  { id: 'od_chawkbazar', x: -100, z: -170, district: 'old_dhaka', name: 'Chawkbazar Chowrasta', isIntersection: true, hasTrafficLight: true },
  { id: 'od_lalbagh', x: -140, z: -200, district: 'old_dhaka', name: 'Lalbagh Fort Road', isIntersection: true },
  { id: 'od_ahsan_manzil', x: -60, z: -210, district: 'old_dhaka', name: 'Buriganga Riverfront Way' },
  { id: 'od_nazimuddin', x: -90, z: -120, district: 'old_dhaka', name: 'Nazimuddin Road' },

  // Gulshan / Banani District
  { id: 'gl_hatirjheel_link', x: 80, z: 50, district: 'gulshan', name: 'Hatirjheel Gulshan Ramp', isIntersection: true },
  { id: 'gl_circle_1', x: 140, z: 80, district: 'gulshan', name: 'Gulshan 1 Circle', isIntersection: true, hasTrafficLight: true },
  { id: 'gl_avenue', x: 170, z: 130, district: 'gulshan', name: 'Gulshan Avenue Center' },
  { id: 'gl_circle_2', x: 180, z: 180, district: 'gulshan', name: 'Gulshan 2 Circle', isIntersection: true, hasTrafficLight: true },
  { id: 'gl_banani_link', x: 110, z: 160, district: 'gulshan', name: 'Banani 11 Bridge', isIntersection: true }
];

/**
 * Validated road segments connecting nodes
 */
export const ROAD_EDGES: RoadEdge[] = [
  // Shahbagh Internal & Connectors
  { id: 'e_sb1', from: 'sb_center', to: 'sb_tsc', lanes: 2, oneWay: false, speedLimit: 30, roadName: 'TSC Road', banglaRoadName: 'টিএসসি সড়ক', district: 'shahbagh' },
  { id: 'e_sb2', from: 'sb_tsc', to: 'sb_curzon', lanes: 2, oneWay: false, speedLimit: 30, roadName: 'University Ave', banglaRoadName: 'বিশ্ববিদ্যালয় এভিনিউ', district: 'shahbagh' },
  { id: 'e_sb3', from: 'sb_center', to: 'sb_museum', lanes: 2, oneWay: false, speedLimit: 30, roadName: 'Museum Road', banglaRoadName: 'জাদুঘর সড়ক', district: 'shahbagh' },
  { id: 'e_sb4', from: 'sb_museum', to: 'sb_matsya', lanes: 2, oneWay: false, speedLimit: 40, roadName: 'Kakrail Link', banglaRoadName: 'কাকরাইল লিংক', district: 'shahbagh' },
  { id: 'e_sb5', from: 'sb_center', to: 'sb_banglamotor', lanes: 4, oneWay: false, speedLimit: 40, roadName: 'Kazi Nazrul Islam Ave', banglaRoadName: 'কাজী নজরুল ইসলাম এভিনিউ', district: 'shahbagh' },

  // Corridor: Shahbagh to Farmgate along Metro line
  { id: 'e_conn_sb_fg', from: 'sb_banglamotor', to: 'fg_kawran', lanes: 4, oneWay: false, speedLimit: 40, roadName: 'VIP Metro Corridor', banglaRoadName: 'ভিআইপি মেট্রো করিডোর', district: 'farmgate' },
  { id: 'e_fg1', from: 'fg_kawran', to: 'fg_metro_station', lanes: 4, oneWay: false, speedLimit: 40, roadName: 'Farmgate Main Road', banglaRoadName: 'ফার্মগেট প্রধান সড়ক', district: 'farmgate' },
  { id: 'e_fg2', from: 'fg_metro_station', to: 'fg_ananda', lanes: 2, oneWay: false, speedLimit: 25, roadName: 'Green Road Branch', banglaRoadName: 'গ্রিন রোড শাখা', district: 'farmgate' },
  { id: 'e_fg3', from: 'fg_metro_station', to: 'fg_khamarbari', lanes: 2, oneWay: false, speedLimit: 30, roadName: 'Khamarbari Road', banglaRoadName: 'খামারবাড়ি রোড', district: 'farmgate' },
  { id: 'e_fg4', from: 'fg_metro_station', to: 'fg_tejgaon_link', lanes: 3, oneWay: false, speedLimit: 40, roadName: 'Tejgaon Link', banglaRoadName: 'তেজগাঁও লিংক রোড', district: 'farmgate' },
  { id: 'e_fg5', from: 'fg_metro_station', to: 'fg_bijoy_sarani', lanes: 4, oneWay: false, speedLimit: 45, roadName: 'Airport Viaduct Road', banglaRoadName: 'বিমানবন্দর ভায়াডাক্ট রোড', district: 'farmgate' },

  // Corridor: Shahbagh / TSC to Dhanmondi
  { id: 'e_conn_sb_dh', from: 'sb_tsc', to: 'dh_science_lab', lanes: 3, oneWay: false, speedLimit: 35, roadName: 'Elephant Road', banglaRoadName: 'এলিফ্যান্ট রোড', district: 'dhanmondi' },
  { id: 'e_dh1', from: 'dh_science_lab', to: 'dh_road_2', lanes: 3, oneWay: false, speedLimit: 35, roadName: 'Mirpur Road Entrance', banglaRoadName: 'মিরপুর রোড প্রবেশ', district: 'dhanmondi' },
  { id: 'e_dh2', from: 'dh_road_2', to: 'dh_satmasjid_s', lanes: 2, oneWay: false, speedLimit: 30, roadName: 'Dhanmondi Rd 2', banglaRoadName: 'ধানমন্ডি ২ নম্বর রোড', district: 'dhanmondi' },
  { id: 'e_dh3', from: 'dh_road_2', to: 'dh_lake', lanes: 2, oneWay: false, speedLimit: 25, roadName: 'Lake Side Drive', banglaRoadName: 'লেক ড্রাইভ রোড', district: 'dhanmondi' },
  { id: 'e_dh4', from: 'dh_satmasjid_s', to: 'dh_shankar', lanes: 3, oneWay: false, speedLimit: 35, roadName: 'Satmasjid South Ave', banglaRoadName: 'সাতমসজিদ দক্ষিণ এভিনিউ', district: 'dhanmondi' },
  { id: 'e_dh5', from: 'dh_shankar', to: 'dh_satmasjid_n', lanes: 3, oneWay: false, speedLimit: 35, roadName: 'Satmasjid Main Road', banglaRoadName: 'সাতমসজিদ প্রধান সড়ক', district: 'dhanmondi' },
  { id: 'e_dh6', from: 'dh_satmasjid_n', to: 'dh_kalabagan', lanes: 2, oneWay: false, speedLimit: 30, roadName: 'Road 27 Cross', banglaRoadName: '২৭ নম্বর রোড ক্রস', district: 'dhanmondi' },
  { id: 'e_dh7', from: 'dh_kalabagan', to: 'dh_science_lab', lanes: 3, oneWay: false, speedLimit: 35, roadName: 'Mirpur Road Kalabagan', banglaRoadName: 'মিরপুর রোড কলাবাগান', district: 'dhanmondi' },
  { id: 'e_conn_dh_fg', from: 'dh_kalabagan', to: 'fg_ananda', lanes: 2, oneWay: false, speedLimit: 30, roadName: 'Green Road North', banglaRoadName: 'গ্রিন রোড উত্তর', district: 'farmgate' },

  // Corridor: Curzon / TSC to Old Dhaka
  { id: 'e_conn_sb_od', from: 'sb_curzon', to: 'od_nazimuddin', lanes: 2, oneWay: false, speedLimit: 25, roadName: 'Bakshibazar Lane', banglaRoadName: 'বকশীবাজার লেন', district: 'old_dhaka' },
  { id: 'e_od1', from: 'od_nazimuddin', to: 'od_bakshibazar', lanes: 2, oneWay: false, speedLimit: 25, roadName: 'Old Jail Road', banglaRoadName: 'পুরানো জেল রোড', district: 'old_dhaka' },
  { id: 'e_od2', from: 'od_bakshibazar', to: 'od_chawkbazar', lanes: 2, oneWay: false, speedLimit: 20, roadName: 'Chawkbazar Main', banglaRoadName: 'চকবাজার প্রধান সড়ক', district: 'old_dhaka' },
  { id: 'e_od3', from: 'od_chawkbazar', to: 'od_lalbagh', lanes: 2, oneWay: false, speedLimit: 20, roadName: 'Lalbagh Heritage Lane', banglaRoadName: 'লালবাগ হেরিটেজ লেন', district: 'old_dhaka' },
  { id: 'e_od4', from: 'od_chawkbazar', to: 'od_ahsan_manzil', lanes: 2, oneWay: false, speedLimit: 20, roadName: 'Riverfront Alley', banglaRoadName: 'রিভারফ্রন্ট গলি', district: 'old_dhaka' },

  // Corridor: Shahbagh / Tejgaon to Gulshan
  { id: 'e_conn_sb_gl', from: 'sb_matsya', to: 'gl_hatirjheel_link', lanes: 3, oneWay: false, speedLimit: 40, roadName: 'Moghbazar Flyover', banglaRoadName: 'মগবাজার ফ্লাইওভার', district: 'gulshan' },
  { id: 'e_conn_fg_gl', from: 'fg_tejgaon_link', to: 'gl_hatirjheel_link', lanes: 3, oneWay: false, speedLimit: 40, roadName: 'Hatirjheel Express', banglaRoadName: 'হাতিরঝিল এক্সপ্রেস', district: 'gulshan' },
  { id: 'e_gl1', from: 'gl_hatirjheel_link', to: 'gl_circle_1', lanes: 4, oneWay: false, speedLimit: 45, roadName: 'Gulshan South Ave', banglaRoadName: 'গুলশান দক্ষিণ এভিনিউ', district: 'gulshan' },
  { id: 'e_gl2', from: 'gl_circle_1', to: 'gl_avenue', lanes: 4, oneWay: false, speedLimit: 45, roadName: 'Gulshan Avenue', banglaRoadName: 'গুলশান এভিনিউ', district: 'gulshan' },
  { id: 'e_gl3', from: 'gl_avenue', to: 'gl_circle_2', lanes: 4, oneWay: false, speedLimit: 45, roadName: 'Gulshan 2 North', banglaRoadName: 'গুলশান-২ উত্তর', district: 'gulshan' },
  { id: 'e_gl4', from: 'gl_circle_2', to: 'gl_banani_link', lanes: 3, oneWay: false, speedLimit: 40, roadName: 'Kemal Ataturk Ave', banglaRoadName: 'কামাল আতাতুর্ক এভিনিউ', district: 'gulshan' }
];

export class RoadGraph {
  private nodeMap: Map<string, RoadNode> = new Map();
  private adjacency: Map<string, Array<{ target: RoadNode; edge: RoadEdge; distance: number }>> = new Map();

  constructor() {
    this.buildGraph();
  }

  private buildGraph() {
    ROAD_NODES.forEach((node) => {
      this.nodeMap.set(node.id, node);
      this.adjacency.set(node.id, []);
    });

    ROAD_EDGES.forEach((edge) => {
      const fromNode = this.nodeMap.get(edge.from);
      const toNode = this.nodeMap.get(edge.to);
      if (fromNode && toNode) {
        const dx = toNode.x - fromNode.x;
        const dz = toNode.z - fromNode.z;
        const dist = Math.hypot(dx, dz);

        this.adjacency.get(edge.from)?.push({ target: toNode, edge, distance: dist });
        if (!edge.oneWay) {
          this.adjacency.get(edge.to)?.push({ target: fromNode, edge, distance: dist });
        }
      }
    });
  }

  public getNode(id: string): RoadNode | undefined {
    return this.nodeMap.get(id);
  }

  public getAllNodes(): RoadNode[] {
    return ROAD_NODES;
  }

  public getAllEdges(): RoadEdge[] {
    return ROAD_EDGES;
  }

  public findNearestNode(x: number, z: number): RoadNode {
    let nearest = ROAD_NODES[0];
    let minDistSq = Infinity;
    for (const node of ROAD_NODES) {
      const distSq = (node.x - x) ** 2 + (node.z - z) ** 2;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearest = node;
      }
    }
    return nearest;
  }

  /**
   * Standard A* Pathfinding between two nodes
   */
  public findRoute(startId: string, goalId: string): NavPath | null {
    if (startId === goalId) {
      const node = this.getNode(startId);
      return node ? { nodes: [node], totalDistance: 0 } : null;
    }

    const goal = this.getNode(goalId);
    if (!goal) return null;

    const openSet: string[] = [startId];
    const cameFrom: Map<string, string> = new Map();
    const gScore: Map<string, number> = new Map();
    const fScore: Map<string, number> = new Map();

    ROAD_NODES.forEach((n) => {
      gScore.set(n.id, Infinity);
      fScore.set(n.id, Infinity);
    });

    gScore.set(startId, 0);
    const startNode = this.getNode(startId)!;
    fScore.set(startId, Math.hypot(goal.x - startNode.x, goal.z - startNode.z));

    while (openSet.length > 0) {
      // Find lowest fScore in openSet
      let lowestIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if ((fScore.get(openSet[i]) || Infinity) < (fScore.get(openSet[lowestIndex]) || Infinity)) {
          lowestIndex = i;
        }
      }

      const currentId = openSet[lowestIndex];
      if (currentId === goalId) {
        // Reconstruct path
        const pathNodes: RoadNode[] = [];
        let curr: string | undefined = currentId;
        while (curr) {
          const n = this.getNode(curr);
          if (n) pathNodes.unshift(n);
          curr = cameFrom.get(curr);
        }
        return {
          nodes: pathNodes,
          totalDistance: gScore.get(goalId) || 0
        };
      }

      openSet.splice(lowestIndex, 1);
      const neighbors = this.adjacency.get(currentId) || [];

      for (const neighbor of neighbors) {
        const tentativeG = (gScore.get(currentId) || 0) + neighbor.distance;
        if (tentativeG < (gScore.get(neighbor.target.id) || Infinity)) {
          cameFrom.set(neighbor.target.id, currentId);
          gScore.set(neighbor.target.id, tentativeG);
          const h = Math.hypot(goal.x - neighbor.target.x, goal.z - neighbor.target.z);
          fScore.set(neighbor.target.id, tentativeG + h);

          if (!openSet.includes(neighbor.target.id)) {
            openSet.push(neighbor.target.id);
          }
        }
      }
    }

    return null;
  }

  public findRouteByCoords(startX: number, startZ: number, targetX: number, targetZ: number): NavPath | null {
    const startNode = this.findNearestNode(startX, startZ);
    const targetNode = this.findNearestNode(targetX, targetZ);
    return this.findRoute(startNode.id, targetNode.id);
  }

  public getOutEdges(nodeId: string): Array<{ target: RoadNode; edge: RoadEdge; distance: number }> {
    return this.adjacency.get(nodeId) || [];
  }
}

export const roadGraph = new RoadGraph();

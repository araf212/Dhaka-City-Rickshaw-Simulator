export type DistrictId =
  | 'dhanmondi'
  | 'old_dhaka'
  | 'shahbagh'
  | 'farmgate'
  | 'gulshan';

export interface DistrictInfo {
  id: DistrictId;
  name: string;
  banglaName: string;
  description: string;
  center: [number, number]; // [x, z]
  color: string;
  landmarks: string[];
}

export interface RoadNode {
  id: string;
  x: number;
  z: number;
  district: DistrictId;
  name?: string;
  isIntersection?: boolean;
  hasTrafficLight?: boolean;
}

export interface RoadEdge {
  id: string;
  from: string;
  to: string;
  lanes: number;
  oneWay: boolean;
  speedLimit: number;
  roadName: string;
  banglaRoadName: string;
  district: DistrictId;
}

export interface NavPath {
  nodes: RoadNode[];
  totalDistance: number;
}

export type VehicleType = 'cng' | 'bus' | 'car' | 'bike';

export interface AIVehicle {
  id: number;
  type: VehicleType;
  x: number;
  z: number;
  speed: number;
  targetSpeed: number;
  heading: number; // in radians
  edgeIndex: number;
  edgeProgress: number; // 0 to 1 along current edge
  currentEdge: RoadEdge;
  color: string;
  mesh?: any;
}

export interface Pedestrian {
  id: number;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  heading: number;
  colorLungi: string;
  colorPanjabi: string;
  district: DistrictId;
  isCrossing: boolean;
  mesh?: any;
}

export interface PassengerMission {
  id: string;
  passengerName: string;
  dialogueBengali: string;
  dialogueEnglish: string;
  pickupDistrict: DistrictId;
  pickupLandmark: string;
  pickupCoords: [number, number];
  dropDistrict: DistrictId;
  dropLandmark: string;
  dropCoords: [number, number];
  fareTaka: number;
  tipPotential: number;
  distanceMeters: number;
  isCompleted?: boolean;
}

export type WeatherPreset = 'sunny' | 'golden_hour' | 'neon_night' | 'monsoon_rain';

export type CameraMode = 'chase' | 'first_person' | 'tactical';

export interface RickshawCustomization {
  hoodArt: 'peacock' | 'tiger' | 'cinema' | 'floral';
  frameColor: string; // hex
  bellType: 'classic_brass' | 'double_ding' | 'electric_horn';
  gearEfficiency: number; // 1.0 to 1.5
  comfortLevel: number; // 1 to 3 (+tip multiplier)
}

export interface PlayerStats {
  moneyTaka: number;
  totalTripsCompleted: number;
  distanceTraveledKm: number;
  reputationStars: number;
  unlockedDistricts: DistrictId[];
}

export interface GameSettings {
  soundVolume: number;
  sfxVolume: number;
  musicVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  trafficDensity: 'sparse' | 'normal' | 'dense';
  touchControls: boolean;
  cameraSensitivity: number;
}

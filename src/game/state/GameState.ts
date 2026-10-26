import { RickshawCustomization, PlayerStats, GameSettings } from '../types';

const SAVE_KEY = 'dhaka_rickshaw_sim_save_v1';

export const DEFAULT_CUSTOMIZATION: RickshawCustomization = {
  hoodArt: 'peacock',
  frameColor: '#059669', // Dhaka Emerald Green
  bellType: 'classic_brass',
  gearEfficiency: 1.0,
  comfortLevel: 1
};

export const DEFAULT_STATS: PlayerStats = {
  moneyTaka: 150,
  totalTripsCompleted: 0,
  distanceTraveledKm: 0,
  reputationStars: 4.8,
  unlockedDistricts: ['shahbagh', 'farmgate', 'dhanmondi', 'old_dhaka', 'gulshan']
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.8,
  sfxVolume: 0.8,
  musicVolume: 0.7,
  graphicsQuality: 'high',
  trafficDensity: 'normal',
  touchControls: false,
  cameraSensitivity: 1.0
};

export interface UpgradeItem {
  id: string;
  name: string;
  banglaName: string;
  category: 'hood' | 'frame' | 'bell' | 'gear' | 'cushion';
  priceTaka: number;
  description: string;
  purchased: boolean;
  value: any;
}

export const AVAILABLE_UPGRADES: UpgradeItem[] = [
  {
    id: 'hood_tiger',
    name: 'Sundarban Royal Bengal Tiger Hood',
    banglaName: 'রয়্যাল বেঙ্গল টাইগার হুড',
    category: 'hood',
    priceTaka: 250,
    description: 'Iconic hand-painted tiger illustration with decorative red border.',
    purchased: false,
    value: 'tiger'
  },
  {
    id: 'hood_cinema',
    name: 'Dhaka Cinema Poster Hood Art',
    banglaName: 'বাংলা সিনেমা পোস্টার হুড',
    category: 'hood',
    priceTaka: 400,
    description: 'Vintage Bangladeshi film star aesthetic and bold brush strokes.',
    purchased: false,
    value: 'cinema'
  },
  {
    id: 'hood_floral',
    name: 'Jamdani Floral Heritage Hood',
    banglaName: 'ঐতিহ্যবাহী জামদানি নকশা',
    category: 'hood',
    priceTaka: 600,
    description: 'Intricate golden floral Jamdani weave patterns.',
    purchased: false,
    value: 'floral'
  },
  {
    id: 'bell_double',
    name: 'Loud Double-Ding Brass Bell',
    banglaName: 'ডাবল রিং পিতলের ঘণ্টা',
    category: 'bell',
    priceTaka: 200,
    description: 'Crisp, resonant double chime that cuts through heavy Dhaka traffic.',
    purchased: false,
    value: 'double_ding'
  },
  {
    id: 'bell_electric',
    name: 'Electric Multi-Tone Horn',
    banglaName: 'ইলেকট্রিক ট্র্যাফিক হর্ন',
    category: 'bell',
    priceTaka: 450,
    description: 'Modern rechargeable buzzer horn for clearing busy intersections.',
    purchased: false,
    value: 'electric_horn'
  },
  {
    id: 'gear_sprocket',
    name: 'High-Speed Sprocket & Japanese Chain',
    banglaName: 'স্পিড স্প্রোকেট ও চেইন',
    category: 'gear',
    priceTaka: 350,
    description: 'Smooth pedaling cadence with +20% higher top speed on open roads.',
    purchased: false,
    value: 1.25
  },
  {
    id: 'cushion_foam',
    name: 'Luxury Velvet Cushion Seat',
    banglaName: 'মখমলের আরামদায়ক গদি',
    category: 'cushion',
    priceTaka: 300,
    description: 'Superior passenger comfort earning +35% tips on successful drop-offs.',
    purchased: false,
    value: 2
  }
];

export class GameStateManager {
  public stats: PlayerStats = { ...DEFAULT_STATS };
  public customization: RickshawCustomization = { ...DEFAULT_CUSTOMIZATION };
  public settings: GameSettings = { ...DEFAULT_SETTINGS };
  public upgrades: UpgradeItem[] = [...AVAILABLE_UPGRADES];

  constructor() {
    this.loadFromStorage();
  }

  public loadFromStorage() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.stats) this.stats = { ...this.stats, ...parsed.stats };
        if (parsed.customization) this.customization = { ...this.customization, ...parsed.customization };
        if (parsed.settings) this.settings = { ...this.settings, ...parsed.settings };
        if (parsed.purchasedUpgradeIds && Array.isArray(parsed.purchasedUpgradeIds)) {
          this.upgrades.forEach((u) => {
            if (parsed.purchasedUpgradeIds.includes(u.id)) {
              u.purchased = true;
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse save data, using safe defaults', e);
    }
  }

  public saveToStorage() {
    try {
      const payload = {
        stats: this.stats,
        customization: this.customization,
        settings: this.settings,
        purchasedUpgradeIds: this.upgrades.filter((u) => u.purchased).map((u) => u.id)
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save game state', e);
    }
  }

  public addMoney(amount: number) {
    this.stats.moneyTaka += amount;
    this.stats.totalTripsCompleted += 1;
    this.saveToStorage();
  }

  public buyUpgrade(upgradeId: string): boolean {
    const item = this.upgrades.find((u) => u.id === upgradeId);
    if (!item || item.purchased || this.stats.moneyTaka < item.priceTaka) {
      return false;
    }

    this.stats.moneyTaka -= item.priceTaka;
    item.purchased = true;

    if (item.category === 'hood') {
      this.customization.hoodArt = item.value;
    } else if (item.category === 'bell') {
      this.customization.bellType = item.value;
    } else if (item.category === 'gear') {
      this.customization.gearEfficiency = item.value;
    } else if (item.category === 'cushion') {
      this.customization.comfortLevel = item.value;
    }

    this.saveToStorage();
    return true;
  }

  public setFrameColor(color: string) {
    this.customization.frameColor = color;
    this.saveToStorage();
  }

  public setHoodArt(hood: 'peacock' | 'tiger' | 'cinema' | 'floral') {
    this.customization.hoodArt = hood;
    this.saveToStorage();
  }

  public setBellType(bell: 'classic_brass' | 'double_ding' | 'electric_horn') {
    this.customization.bellType = bell;
    this.saveToStorage();
  }
}

export const gameState = new GameStateManager();

import * as THREE from 'three';

export type WeatherType = 'sunny' | 'sunset' | 'storm' | 'fog' | 'midnight';

export type GesturePosition = 
  | 'standing_chat'
  | 'warm_hug'
  | 'deep_hug'
  | 'gentle_kiss'
  | 'long_kiss'
  | 'slow_dance'
  | 'sit_together'
  | 'lean_on_car'
  | 'hold_hands'
  | 'playful_slap'
  | 'roundhouse_kick';

export interface FemaleCharacterData {
  id: string;
  name: string;
  title: string;
  avatarColor: string;
  personality: string;
  clothingStyle: string;
  hairColor: number;
  outfitColor: number;
  accentColor: number;
  position: [number, number, number];
  rotationY: number;
  affection: number; // 0 to 100
  tier: 'Acquaintance' | 'Crush' | 'Close Partner' | 'Soulmate';
  dialogueState: number;
  status: 'idle' | 'talking' | 'interacting' | 'following' | 'in_passenger_seat';
  quotes: {
    greeting: string[];
    hugResponse: string[];
    gentleKissResponse: string[];
    longKissResponse: string[];
    slapResponse: string[];
    kickResponse: string[];
    danceResponse: string[];
    passengerComment: string[];
    weatherComment: Record<WeatherType, string>;
  };
}

export interface VehicleConfig {
  id: string;
  name: string;
  category: 'Supercar' | 'Muscle' | 'Motorcycle';
  topSpeed: number;
  accel: number;
  handling: number;
  driftMultiplier: number;
  color: number;
  unlocked: boolean;
}

export interface DestructibleProp {
  id: string;
  type: 'streetlight' | 'hydrant' | 'barrier' | 'crate' | 'bench';
  rootGroup: THREE.Group;
  initialPos: THREE.Vector3;
  initialRot: THREE.Euler;
  destroyed: boolean;
  health: number;
  fragments?: Array<{
    mesh: THREE.Object3D;
    velocity: THREE.Vector3;
    rotVelocity: THREE.Vector3;
  }>;
  specialEffect?: 'water_geyser' | 'sparks' | 'wood_shatter' | 'barrier_tumble';
}

export interface ParticleEffect {
  update: (delta: number) => boolean; // return false when dead
}

export interface GameStats {
  money: number;
  respect: number;
  wantedLevel: number;
  stuntsPerformed: number;
  propsDestroyed: number;
  kissesCompleted: number;
  longestKissSeconds: number;
}

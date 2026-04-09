export type Gender = 'female' | 'male';
export type FemalePersonality = 'cute' | 'intellectual' | 'playful' | 'elegant';
export type MalePersonality = 'cheerful' | 'masculine' | 'mature' | 'humorous';
export type Personality = FemalePersonality | MalePersonality;

export type ThemeType = 'pink' | 'blue' | 'black' | 'white';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
}

export interface DollConfig {
  name: string;
  gender: Gender;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  outfitColor: string;
  personality: Personality;
  imageUri?: string | null;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

export type AnimationType =
  | 'idle'
  | 'talking'
  | 'dancing'
  | 'happy'
  | 'waving'
  | 'thinking';


  
export type IBasePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  offsetX?: number;
  offsetY?: number;
}

export type IPosition = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX?: number;
  scaleY?: number;
  spriteX: number;
  spriteY: number;
  spriteWidth: number;
  spriteHeight: number;
  rotation: number;
  needRotate: boolean;
  offsetX: number;
  offsetY: number;
  ox: number;
  oy: number;
}

export type ISprite = {
  xy: number[]; // xy
  size: number[]; // size
  orig: number[]; // origin
  offset: number[]; // offset
  rotate: boolean;
};
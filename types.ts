export type Coordinate = {
  x: number;
  y: number;
};

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum CellType {
  EMPTY = 0,
  WALL = 1,
  BRICK = 2,
}

export enum ItemType {
  RANGE_UP = 'RANGE_UP',
  SPEED_UP = 'SPEED_UP',
}

export interface Item {
  id: string;
  x: number;
  y: number;
  type: ItemType;
}

export interface Player {
  x: number;
  y: number;
  isAlive: boolean;
  lastMoveTime: number;
  stats: {
    range: number;
    speed: number; // Cooldown in ms (lower is faster)
  };
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  moveTimer: number; 
}

export interface Bomb {
  id: string;
  x: number;
  y: number;
  fuse: number; 
  range: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  duration: number;
}

export interface Particle {
  id: string;
  x: number; // visual x (grid x + offset)
  y: number; // visual y
  vx: number;
  vy: number;
  life: number; // 0 to 1
  color: string;
  size: number;
}

export interface GameState {
  level: number;
  grid: CellType[][];
  player: Player;
  enemies: Enemy[];
  bombs: Bomb[];
  explosions: Explosion[];
  items: Item[];
  particles: Particle[];
  door: Coordinate; // Location of the exit
  isDoorRevealed: boolean; // True when brick on top is destroyed
  score: number;
  timeLeft: number; // Seconds
  gameOver: boolean;
  won: boolean;
  paused: boolean; 
}

export type AppMode = 'MENU' | 'GAME';

export const GRID_WIDTH = 15;
export const GRID_HEIGHT = 11;
export const BOMB_FUSE_MS = 2500;
export const EXPLOSION_DURATION_MS = 600;
export const LEVEL_TIME_SECONDS = 180; // 3 minutes

// Balance Constants
export const BASE_PLAYER_SPEED = 300; // ms per tile
export const MIN_PLAYER_SPEED = 100;
export const SPEED_UP_AMOUNT = 30;

export const BASE_BOMB_RANGE = 1;

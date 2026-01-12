// Visual constants
export const CELL_SIZE_DESKTOP = 40;
export const CELL_SIZE_MOBILE = 28;

// Cyberpunk / Neon Theme Constants
export const THEME = {
  // Base Colors (Can be overridden by Map Themes)
  WALL_BG: 'bg-slate-900',
  WALL_BORDER: 'border-cyan-900',
  WALL_GLOW: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]', 
  
  BRICK_BG: 'bg-fuchsia-900',
  BRICK_BORDER: 'border-fuchsia-800',
  BRICK_GLOW: 'shadow-[0_0_10px_rgba(192,38,211,0.2)]',

  EXPLOSION_CORE: 'bg-white',
  EXPLOSION_OUTER: 'bg-cyan-400',
};

export const ITEMS = {
  RANGE_UP_COLOR: 'bg-yellow-400', 
  SPEED_UP_COLOR: 'bg-cyan-400',  
};

// Distinct Visual Themes per Level Style
export const LEVEL_THEMES = [
  // 0: Classic (Cyan/Slate)
  {
    name: 'CYBER CITY',
    wallColor: 'bg-slate-900',
    wallBorder: 'border-cyan-900',
    wallGlow: 'shadow-[0_0_10px_rgba(34,211,238,0.3)]', // Cyan
    brickColor: 'bg-fuchsia-900',
    brickBorder: 'border-fuchsia-700',
    floorDark: 'bg-[#0a0a16]',
    floorLight: 'bg-[#0f0f20]',
    accent: 'cyan'
  },
  // 1: Mars (Orange/Rust)
  {
    name: 'RED SECTOR',
    wallColor: 'bg-orange-950',
    wallBorder: 'border-orange-700',
    wallGlow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]', // Orange
    brickColor: 'bg-slate-800',
    brickBorder: 'border-slate-600',
    floorDark: 'bg-[#1a0500]',
    floorLight: 'bg-[#2a0a05]',
    accent: 'orange'
  },
  // 2: Toxic (Green/Acid)
  {
    name: 'BIO LABS',
    wallColor: 'bg-green-950',
    wallBorder: 'border-green-800',
    wallGlow: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]', // Green
    brickColor: 'bg-yellow-900',
    brickBorder: 'border-yellow-700',
    floorDark: 'bg-[#051a05]',
    floorLight: 'bg-[#0a2a0a]',
    accent: 'green'
  },
  // 3: Vapor (Purple/Pink)
  {
    name: 'NEON GRID',
    wallColor: 'bg-indigo-950',
    wallBorder: 'border-purple-600',
    wallGlow: 'shadow-[0_0_10px_rgba(147,51,234,0.4)]', // Purple
    brickColor: 'bg-pink-900',
    brickBorder: 'border-pink-600',
    floorDark: 'bg-[#10001a]',
    floorLight: 'bg-[#1a0525]',
    accent: 'purple'
  },
  // 4: Inferno (Red/Black)
  {
    name: 'CORE MELTDOWN',
    wallColor: 'bg-red-950',
    wallBorder: 'border-red-600',
    wallGlow: 'shadow-[0_0_15px_rgba(220,38,38,0.4)]', // Red
    brickColor: 'bg-stone-900',
    brickBorder: 'border-stone-700',
    floorDark: 'bg-[#1a0000]',
    floorLight: 'bg-[#2b0505]',
    accent: 'red'
  }
];

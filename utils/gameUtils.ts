import { CellType, GRID_HEIGHT, GRID_WIDTH } from '../types';

export const generateGrid = (level: number): CellType[][] => {
  const grid: CellType[][] = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(CellType.EMPTY));

  // Determine Map Style based on level (Cycle every 5 levels)
  const mapStyle = (level - 1) % 5;
  
  // Base brick density increases slightly with level
  let brickDensity = Math.min(0.3 + (level * 0.05), 0.65);

  // Adjust density based on map style
  if (mapStyle === 1) brickDensity += 0.15; // Denser soft blocks for open maps
  
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      // 1. Always Outer Walls
      if (x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1) {
        grid[y][x] = CellType.WALL;
        continue;
      }

      // Safe Zone for Player (Top-Left Corner) - No Hard Walls or Bricks here
      // Player starts at 1,1. We keep 1,1; 1,2; 2,1 clear.
      const isSafeZone = (x === 1 && y === 1) || (x === 1 && y === 2) || (x === 2 && y === 1);
      
      if (isSafeZone) {
          continue; // Leave empty
      }

      // 2. Generate Hard Walls (Indestructible) based on Map Style
      let isHardWall = false;

      switch (mapStyle) {
        case 0: // CLASSIC: Checkerboard
            if (x % 2 === 0 && y % 2 === 0) {
                isHardWall = true;
            }
            break;
        
        case 1: // THE ARENA: Wide open, only 4 pillars
            if ((x === 4 || x === GRID_WIDTH - 5) && (y === 3 || y === GRID_HEIGHT - 4)) {
                isHardWall = true;
            }
            break;
        
        case 2: // THE TRENCHES: Horizontal Lines
            // Rows 2, 4, 6, 8 are walls
            if (y % 2 === 0) {
                 // Leave gaps every few blocks to allow passage
                 if (x % 3 !== 0) {
                     isHardWall = true;
                 }
            }
            break;

        case 3: // THE GRID: Vertical Lines
            // Columns 3, 5, 7, etc.
            if (x % 2 === 0) {
                // Leave gaps in middle of columns
                if (y !== Math.floor(GRID_HEIGHT / 2)) {
                    isHardWall = true;
                }
            }
            break;

        case 4: // THE RUINS: Random Scatter
            // Random chance for a hard wall, but avoid creating 1x1 traps
            // Use a checkerboard-friendly random placement
            if (Math.random() < 0.12) {
                 // Avoid placing next to another hard wall to prevent unreachable areas?
                 // Actually, purely random is risky. Let's use sparse checkerboard.
                 if (x % 2 !== 0 || y % 2 !== 0) { 
                     // Only place in "odd" cells occasionally? No that's classic.
                     // Let's just do random but ensure it's not too dense.
                     isHardWall = true;
                 }
            }
            break;
      }

      if (isHardWall) {
          grid[y][x] = CellType.WALL;
          continue;
      }

      // 3. Generate Bricks (Destructible)
      if (Math.random() < brickDensity) {
          grid[y][x] = CellType.BRICK;
      }
    }
  }

  // Ensure connectivity check could be here, but for simple Bomberman clones
  // usually the destructible bricks ensure connectivity eventually.
  // The Hard Wall patterns above (Trenches/Grid) have specific gaps to ensure passage.

  return grid;
};

export const isValidMove = (grid: CellType[][], x: number, y: number, bombs: {x:number, y:number}[]): boolean => {
  if (y < 0 || y >= GRID_HEIGHT || x < 0 || x >= GRID_WIDTH) return false;
  
  // Ensure grid row exists (prevents crash on uninitialized grid)
  if (!grid[y]) return false;

  // Cannot walk into walls or bricks
  if (grid[y][x] !== CellType.EMPTY) return false;

  // Cannot walk into a bomb 
  // (We ignore items here, they are walkable)
  const hasBomb = bombs.some(b => b.x === x && b.y === y);
  if (hasBomb) return false;

  return true;
};

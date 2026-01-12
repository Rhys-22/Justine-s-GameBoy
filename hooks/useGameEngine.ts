import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GameState, CellType, Direction, Player, Enemy, Bomb, Explosion, Item, ItemType, Particle,
  GRID_WIDTH, GRID_HEIGHT, BOMB_FUSE_MS, EXPLOSION_DURATION_MS,
  BASE_PLAYER_SPEED, MIN_PLAYER_SPEED, SPEED_UP_AMOUNT, BASE_BOMB_RANGE, LEVEL_TIME_SECONDS
} from '../types';
import { generateGrid, isValidMove } from '../utils/gameUtils';
import { playSound } from '../utils/soundUtils';

const TICK_RATE = 50; 

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    grid: [],
    player: { 
      x: 1, y: 1, 
      isAlive: true, 
      lastMoveTime: 0,
      stats: { range: BASE_BOMB_RANGE, speed: BASE_PLAYER_SPEED }
    },
    enemies: [],
    bombs: [],
    explosions: [],
    items: [],
    particles: [],
    door: { x: -1, y: -1 },
    isDoorRevealed: false,
    score: 0,
    timeLeft: LEVEL_TIME_SECONDS,
    gameOver: false,
    won: false,
    paused: false,
  });

  const stateRef = useRef<GameState>(gameState);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const initLevel = useCallback((level: number, keepStats: boolean, currentScore: number, currentStats?: Player['stats']) => {
    const newGrid = generateGrid(level);
    
    // Find all brick locations to potentially hide door
    const brickLocations: {x: number, y: number}[] = [];
    for(let y=0; y<GRID_HEIGHT; y++) {
      for(let x=0; x<GRID_WIDTH; x++) {
        if(newGrid[y][x] === CellType.BRICK) {
          brickLocations.push({x, y});
        }
      }
    }

    // Set Door Location
    let doorLocation = { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 };
    if (brickLocations.length > 0) {
      const idx = Math.floor(Math.random() * brickLocations.length);
      doorLocation = brickLocations[idx];
    }
    
    // Check if door is accidentally already revealed (unlikely given gen logic but safe to check)
    const isRevealed = newGrid[doorLocation.y][doorLocation.x] === CellType.EMPTY;

    const newEnemies: Enemy[] = [];
    const enemyCountTarget = 2 + level; 
    let placed = 0;
    let attempts = 0;
    
    while (placed < enemyCountTarget && attempts < 100) {
      const ex = Math.floor(Math.random() * (GRID_WIDTH - 2)) + 1;
      const ey = Math.floor(Math.random() * (GRID_HEIGHT - 2)) + 1;
      // Ensure enemy doesn't start on player or surrounded by walls instantly
      if (newGrid[ey][ex] === CellType.EMPTY && (ex + ey > 6)) {
        newEnemies.push({
          id: `enemy-L${level}-${placed}`,
          x: ex,
          y: ey,
          direction: [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT][Math.floor(Math.random()*4)],
          moveTimer: 0
        });
        placed++;
      }
      attempts++;
    }

    setGameState({
      level,
      grid: newGrid,
      player: { 
        x: 1, y: 1, 
        isAlive: true, 
        lastMoveTime: 0,
        stats: (keepStats && currentStats) ? currentStats : { range: BASE_BOMB_RANGE, speed: BASE_PLAYER_SPEED }
      },
      enemies: newEnemies,
      bombs: [],
      explosions: [],
      items: [],
      particles: [],
      door: doorLocation,
      isDoorRevealed: isRevealed,
      score: currentScore,
      timeLeft: LEVEL_TIME_SECONDS,
      gameOver: false,
      won: false,
      paused: false,
    });
    
    playSound('start');
  }, []);

  // Timer Loop
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const current = stateRef.current;
      if (current.gameOver || current.won || current.paused) return;
      
      if (current.timeLeft <= 0) {
        setGameState(prev => ({ ...prev, gameOver: true }));
        playSound('die');
      } else {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Initial Start
  useEffect(() => {
    initLevel(1, false, 0);
  }, [initLevel]);

  const nextLevel = () => {
    const current = stateRef.current;
    initLevel(current.level + 1, true, current.score, current.player.stats);
  };

  const restart = () => {
    initLevel(1, false, 0);
  };
  
  const togglePause = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };

  const movePlayer = (dx: number, dy: number) => {
    const current = stateRef.current;
    if (current.gameOver || current.paused || !current.player.isAlive) return;

    const now = Date.now();
    if (now - current.player.lastMoveTime < current.player.stats.speed) return;

    const newX = current.player.x + dx;
    const newY = current.player.y + dy;

    if (isValidMove(current.grid, newX, newY, current.bombs)) {
      let newStats = { ...current.player.stats };
      let newItems = [...current.items];
      let scoreAdd = 0;
      let wonGame = false;
      let newParticles = [...current.particles];

      // Check Item Collection
      const itemIndex = newItems.findIndex(i => i.x === newX && i.y === newY);
      if (itemIndex !== -1) {
        const item = newItems[itemIndex];
        newItems.splice(itemIndex, 1);
        scoreAdd += 50;
        playSound('powerup');
        
        // Spawn Sparkles
        for(let i=0; i<8; i++) {
             newParticles.push({
                 id: `part-${Date.now()}-${i}`,
                 x: newX, y: newY,
                 vx: (Math.random() - 0.5) * 0.4,
                 vy: (Math.random() - 0.5) * 0.4,
                 life: 1.0,
                 color: item.type === ItemType.RANGE_UP ? '#facc15' : '#22d3ee',
                 size: Math.random() * 0.3 + 0.1
             });
        }

        if (item.type === ItemType.RANGE_UP) {
          newStats.range += 1;
        } else if (item.type === ItemType.SPEED_UP) {
          newStats.speed = Math.max(MIN_PLAYER_SPEED, newStats.speed - SPEED_UP_AMOUNT);
        }
      }

      // Check Door Entry - Win if door is revealed AND all enemies are dead
      if (current.isDoorRevealed && newX === current.door.x && newY === current.door.y && current.enemies.length === 0) {
        wonGame = true;
        playSound('win');
      }

      setGameState(prev => ({
        ...prev,
        score: prev.score + scoreAdd,
        items: newItems,
        particles: newParticles,
        won: wonGame,
        paused: wonGame,
        player: { 
          ...prev.player, 
          x: newX, 
          y: newY,
          lastMoveTime: now,
          stats: newStats
        }
      }));
    }
  };

  const placeBomb = () => {
    const current = stateRef.current;
    if (current.gameOver || current.paused || !current.player.isAlive) return;

    const alreadyExists = current.bombs.some(b => b.x === current.player.x && b.y === current.player.y);
    if (alreadyExists) return;

    if (current.bombs.length >= 3) return;

    const newBomb: Bomb = {
      id: `bomb-${Date.now()}`,
      x: current.player.x,
      y: current.player.y,
      fuse: Date.now() + BOMB_FUSE_MS,
      range: current.player.stats.range, 
    };

    setGameState(prev => ({
      ...prev,
      bombs: [...prev.bombs, newBomb]
    }));
    playSound('plant'); // Sound Effect
  };

  // Game Loop
  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      const current = stateRef.current;

      if (current.gameOver || current.won || current.paused) return;

      let newState = { ...current };
      let hasChanges = false;
      let hasExplosionSound = false;
      let hasBreakSound = false;
      let hasKillSound = false;

      // 1. Process Bombs
      const remainingBombs: Bomb[] = [];
      const newExplosions: Explosion[] = [...newState.explosions];
      const newItems: Item[] = [...newState.items];
      let newParticles: Particle[] = [...newState.particles];
      let gridChanged = false;
      let nextGrid = newState.grid;

      // Identify bombs that are exploding (either fuse expired OR chain reacted from previous loop)
      const explodingBombs = newState.bombs.filter(b => now >= b.fuse);
      const stableBombs = newState.bombs.filter(b => now < b.fuse);

      if (explodingBombs.length > 0) {
        hasChanges = true;
        hasExplosionSound = true;
        
        // Loop through exploding bombs to generate explosions and chain reactions
        explodingBombs.forEach(bomb => {
          newExplosions.push({ id: `exp-${bomb.id}-c`, x: bomb.x, y: bomb.y, duration: now + EXPLOSION_DURATION_MS });

          const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
          ];

          directions.forEach(dir => {
            for (let i = 1; i <= bomb.range; i++) {
              const tx = bomb.x + (dir.dx * i);
              const ty = bomb.y + (dir.dy * i);

              if (tx < 0 || tx >= GRID_WIDTH || ty < 0 || ty >= GRID_HEIGHT) break;

              const cell = nextGrid[ty][tx];
              if (cell === CellType.WALL) break; 

              newExplosions.push({ id: `exp-${bomb.id}-${i}-${dir.dx}-${dir.dy}`, x: tx, y: ty, duration: now + EXPLOSION_DURATION_MS });
              
              // Chain Reaction Logic: If explosion hits another bomb, trigger it immediately
              const hitBombIndex = stableBombs.findIndex(b => b.x === tx && b.y === ty);
              if (hitBombIndex !== -1) {
                 // Set fuse to 0 to make it explode next frame
                 stableBombs[hitBombIndex].fuse = 0;
              }

              // Destroy Items - Items get destroyed if hit by explosion
              const itemIdx = newItems.findIndex(item => item.x === tx && item.y === ty);
              if (itemIdx !== -1) {
                newItems.splice(itemIdx, 1); 
              }

              // Destroy Bricks
              if (cell === CellType.BRICK) {
                if (!gridChanged) {
                    nextGrid = nextGrid.map(row => [...row]);
                    gridChanged = true;
                }
                nextGrid[ty][tx] = CellType.EMPTY;
                newState.score += 10;
                hasBreakSound = true;

                // Spawn Debris Particles
                for(let p=0; p<6; p++) {
                    newParticles.push({
                        id: `deb-${Date.now()}-${tx}-${ty}-${p}`,
                        x: tx, y: ty,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: (Math.random() - 0.5) * 0.3,
                        life: 1.0,
                        color: '#a21caf', // Purple-ish debris default, will be overridden by logic if needed, but simple is ok
                        size: Math.random() * 0.4 + 0.2
                    });
                }

                // Check if door was revealed
                if (tx === newState.door.x && ty === newState.door.y) {
                    newState.isDoorRevealed = true;
                    // Sparkles for door reveal
                    for(let p=0; p<10; p++) {
                        newParticles.push({
                            id: `door-${Date.now()}-${p}`,
                            x: tx, y: ty,
                            vx: (Math.random() - 0.5) * 0.5,
                            vy: (Math.random() - 0.5) * 0.5,
                            life: 1.5,
                            color: '#ffffff',
                            size: 0.2
                        });
                    }
                }

                // DON'T SPAWN ITEMS ON TOP OF DOOR
                const isDoor = tx === newState.door.x && ty === newState.door.y;

                // ITEM SPAWN CHANCE (only if not door)
                if (!isDoor && Math.random() < 0.25) {
                  const type = Math.random() < 0.5 ? ItemType.RANGE_UP : ItemType.SPEED_UP;
                  newItems.push({
                    id: `item-${Date.now()}-${tx}-${ty}`,
                    x: tx, 
                    y: ty,
                    type
                  });
                }
                break; 
              }
            }
          });
        });
      }

      if (hasExplosionSound) playSound('bomb');
      if (hasBreakSound) playSound('break');

      remainingBombs.push(...stableBombs);
      
      // Update Particles
      if (newParticles.length > 0) {
         hasChanges = true;
         const survivingParticles: Particle[] = [];
         newParticles.forEach(p => {
             p.x += p.vx;
             p.y += p.vy;
             p.life -= 0.05; // Fade out
             if (p.life > 0) survivingParticles.push(p);
         });
         newParticles = survivingParticles;
      }
      
      if (hasChanges) {
        newState.bombs = remainingBombs;
        newState.explosions = newExplosions;
        newState.grid = nextGrid;
        newState.items = newItems;
        newState.particles = newParticles;
      }

      const activeExplosions = newState.explosions.filter(exp => exp.duration > now);
      if (activeExplosions.length !== newState.explosions.length) {
        newState.explosions = activeExplosions;
        hasChanges = true;
      }

      if (newState.player.isAlive) {
        const hitByExplosion = newState.explosions.some(e => e.x === newState.player.x && e.y === newState.player.y);
        const hitByEnemy = newState.enemies.some(e => e.x === newState.player.x && e.y === newState.player.y);
        
        if (hitByExplosion || hitByEnemy) {
          newState.player = { ...newState.player, isAlive: false };
          newState.gameOver = true;
          hasChanges = true;
          playSound('die');
        }
      }

      const survivingEnemies: Enemy[] = [];
      newState.enemies.forEach(enemy => {
        const hit = newState.explosions.some(e => e.x === enemy.x && e.y === enemy.y);
        if (hit) {
          newState.score += 100;
          hasChanges = true;
          hasKillSound = true;
          // Enemy Destroyed Particles
          for(let p=0; p<10; p++) {
              newParticles.push({
                  id: `enemy-die-${enemy.id}-${p}`,
                  x: enemy.x, y: enemy.y,
                  vx: (Math.random() - 0.5) * 0.4,
                  vy: (Math.random() - 0.5) * 0.4,
                  life: 1.0,
                  color: '#ef4444', 
                  size: 0.3
              });
          }
        } else {
          survivingEnemies.push(enemy);
        }
      });
      newState.enemies = survivingEnemies;

      if (hasKillSound) playSound('kill');

      const movedEnemies = newState.enemies.map(enemy => {
        if (now < enemy.moveTimer) return enemy; 

        hasChanges = true;
        const dirs = [
            { d: Direction.UP, dx: 0, dy: -1 },
            { d: Direction.DOWN, dx: 0, dy: 1 },
            { d: Direction.LEFT, dx: -1, dy: 0 },
            { d: Direction.RIGHT, dx: 1, dy: 0 }
        ];

        const validMoves = dirs
            .map(dir => ({ ...dir, x: enemy.x + dir.dx, y: enemy.y + dir.dy }))
            .filter(move => isValidMove(newState.grid, move.x, move.y, newState.bombs));

        if (validMoves.length > 0) {
            const currentDirMove = validMoves.find(m => m.d === enemy.direction);
            let chosen = validMoves[Math.floor(Math.random() * validMoves.length)];
            
            if (currentDirMove && Math.random() < 0.7) {
                chosen = currentDirMove;
            }

            const speedMod = Math.max(200, 800 - (newState.level * 50)); 

            return {
                ...enemy,
                x: chosen.x,
                y: chosen.y,
                direction: chosen.d,
                moveTimer: now + speedMod + Math.random() * 200
            };
        } else {
             return { ...enemy, moveTimer: now + 500 };
        }
      });
      newState.enemies = movedEnemies;

      if (hasChanges) {
        setGameState(newState);
      }
    };

    gameLoopRef.current = setInterval(loop, TICK_RATE);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, []);

  return {
    gameState,
    movePlayer,
    placeBomb,
    restart,
    nextLevel,
    togglePause
  };
};

import React from 'react';
import { GameState, CellType, GRID_WIDTH, GRID_HEIGHT, ItemType } from '../types';
import { THEME, ITEMS, LEVEL_THEMES } from '../constants';
import { Zap, Crosshair, Radio, Lock } from 'lucide-react';

interface BoardProps {
  gameState: GameState;
}

const Board: React.FC<BoardProps> = ({ gameState }) => {
  const { grid, player, enemies, bombs, explosions, items, particles, door, isDoorRevealed, level } = gameState;
  const enemiesRemaining = enemies.length;
  const isDoorUnlocked = enemiesRemaining === 0;

  // Select Theme based on level index (rotating)
  const currentTheme = LEVEL_THEMES[(level - 1) % LEVEL_THEMES.length];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2">
      
      {/* Game Container - Dynamic Theme Border */}
      <div 
        className={`relative bg-[#050510] rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-4 ${currentTheme.wallBorder}`}
        style={{
          aspectRatio: `${GRID_WIDTH}/${GRID_HEIGHT}`,
          width: '100%',
          height: 'auto',
          maxHeight: '100%',
          maxWidth: 'min(100%, 800px)',
        }}
      >
        {/* Floor Layer - Themed Grid */}
        <div 
            className="absolute inset-0 grid w-full h-full"
            style={{
                gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
            }}
        >
            {grid.map((row, y) => (
                row.map((cell, x) => (
                    <div 
                        key={`floor-${x}-${y}`} 
                        className={`w-full h-full border-[0.5px] border-slate-800/10 ${(x+y)%2 === 0 ? currentTheme.floorDark : currentTheme.floorLight} relative`}
                    >
                        {/* Digital Circuit Patterns randomly */}
                        {Math.random() > 0.95 && (
                             <div className={`absolute inset-2 border-l border-b opacity-30 ${currentTheme.wallBorder}`}></div>
                        )}
                    </div>
                ))
            ))}
        </div>

        {/* Door (Rendered on Floor Level if Revealed) */}
        {isDoorRevealed && (
            <div 
                className="absolute flex items-center justify-center animate-in fade-in duration-500"
                style={{
                    left: `${(door.x / GRID_WIDTH) * 100}%`,
                    top: `${(door.y / GRID_HEIGHT) * 100}%`,
                    width: `${100 / GRID_WIDTH}%`,
                    height: `${100 / GRID_HEIGHT}%`,
                    zIndex: 1
                }}
            >
                <div className={`relative w-[80%] h-[80%] flex items-center justify-center ${isDoorUnlocked ? 'animate-pulse' : ''}`}>
                     {/* Base Plate */}
                     <div className={`absolute inset-1 rounded-sm border-2 ${isDoorUnlocked ? 'border-green-400 bg-green-900/20' : 'border-red-500 bg-red-900/20'} transition-colors duration-500`}></div>
                     
                     {isDoorUnlocked ? (
                        <>
                           <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                           <div className="w-full h-full border-4 border-dashed border-green-500/50 rounded-full animate-spin-slow"></div>
                           <div className="absolute text-[8px] font-mono text-green-300 font-bold tracking-wider">EXIT</div>
                        </>
                     ) : (
                        <>
                           {/* Locked Hologram */}
                           <div className="absolute inset-2 border border-red-500/50 flex items-center justify-center">
                                <Lock size={12} className="text-red-500 animate-pulse" />
                           </div>
                           <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500"></div>
                           <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500"></div>
                        </>
                     )}
                </div>
            </div>
        )}

        {/* Object Layer */}
        
        {/* 1. Static Blocks (Walls/Bricks) */}
        {grid.map((row, y) => (
            row.map((cell, x) => {
                if (cell === CellType.EMPTY) return null;
                const isBrick = cell === CellType.BRICK;
                
                return (
                    <div
                        key={`block-${x}-${y}`}
                        className="absolute"
                        style={{
                            left: `${(x / GRID_WIDTH) * 100}%`,
                            top: `${(y / GRID_HEIGHT) * 100}%`,
                            width: `${100 / GRID_WIDTH}%`,
                            height: `${100 / GRID_HEIGHT}%`,
                            zIndex: y * 10 + 5,
                        }}
                    >
                        {/* Themed Block */}
                        <div className="relative w-full h-full p-[2px]">
                            <div className={`w-full h-full relative rounded-sm ${isBrick ? currentTheme.brickColor : currentTheme.wallColor} ${isBrick ? 'shadow-none' : currentTheme.wallGlow} border ${isBrick ? currentTheme.brickBorder : currentTheme.wallBorder}`}>
                                
                                {/* Tech Details on Top */}
                                <div className={`absolute top-0 left-0 w-full h-[8px] bg-black/30`}></div>
                                
                                {isBrick ? (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                        <div className="grid grid-cols-2 gap-1">
                                            <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse"></div>
                                            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                            <div className="w-1 h-1 bg-white/50 rounded-full animate-pulse delay-75"></div>
                                        </div>
                                    </div>
                                ) : (
                                    // Wall Detail
                                    <div className="absolute inset-2 border border-black/20 flex items-center justify-center">
                                         <div className={`w-2 h-4 bg-black/30 border-t border-b ${currentTheme.wallBorder}`}></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })
        ))}

        {/* 2. Items */}
        {items.map(item => (
            <div
                key={item.id}
                className="absolute flex items-center justify-center animate-bounce"
                style={{
                    left: `${(item.x / GRID_WIDTH) * 100}%`,
                    top: `${(item.y / GRID_HEIGHT) * 100}%`,
                    width: `${100 / GRID_WIDTH}%`,
                    height: `${100 / GRID_HEIGHT}%`,
                    zIndex: item.y * 10 + 2,
                }}
            >
                <div className={`relative p-1.5 rounded-lg border border-white/50 shadow-[0_0_15px_currentColor] ${item.type === ItemType.RANGE_UP ? 'text-yellow-400 bg-yellow-900/50' : 'text-cyan-400 bg-cyan-900/50'}`}>
                    {item.type === ItemType.RANGE_UP ? <Crosshair size={20} /> : <Zap size={20} />}
                </div>
            </div>
        ))}

        {/* 3. Bombs */}
        {bombs.map(bomb => (
            <div 
                key={bomb.id}
                className="absolute flex items-center justify-center"
                style={{
                    left: `${(bomb.x / GRID_WIDTH) * 100}%`,
                    top: `${(bomb.y / GRID_HEIGHT) * 100}%`,
                    width: `${100 / GRID_WIDTH}%`,
                    height: `${100 / GRID_HEIGHT}%`,
                    zIndex: bomb.y * 10 + 3,
                }}
            >
                {/* Plasma Bomb */}
                <div className="relative w-[70%] h-[70%]">
                     <div className="absolute inset-0 bg-black rounded-full border-2 border-cyan-500 shadow-[0_0_15px_#06b6d4] animate-pulse"></div>
                     <div className="absolute inset-2 bg-cyan-900 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                     </div>
                     {/* Countdown Text */}
                     <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-cyan-300 font-mono font-bold">
                        {(bomb.fuse - Date.now() > 1500) ? '3' : (bomb.fuse - Date.now() > 500) ? '2' : '1'}
                     </span>
                </div>
            </div>
        ))}

        {/* 4. Enemies - Cyber Skulls */}
        {enemies.map(enemy => (
            <div 
                key={enemy.id}
                className="absolute flex items-center justify-center transition-all duration-300 ease-linear"
                style={{
                    left: `${(enemy.x / GRID_WIDTH) * 100}%`,
                    top: `${(enemy.y / GRID_HEIGHT) * 100}%`,
                    width: `${100 / GRID_WIDTH}%`,
                    height: `${100 / GRID_HEIGHT}%`,
                    zIndex: enemy.y * 10 + 6,
                }}
            >
                <div className="relative w-[85%] h-[85%] flex items-center justify-center animate-pulse">
                    {/* Glow */}
                    <div className="absolute inset-0 bg-red-600/30 blur-md rounded-full"></div>
                    
                    {/* Skull Shape */}
                    <div className="relative w-full h-full bg-slate-900 clip-path-hexagon border border-red-500/50 flex items-center justify-center">
                        {/* Eyes */}
                        <div className="absolute top-[30%] left-[25%] w-[15%] h-[15%] bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]"></div>
                        <div className="absolute top-[30%] right-[25%] w-[15%] h-[15%] bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]"></div>
                        
                        {/* Jaw */}
                        <div className="absolute bottom-[20%] w-[40%] h-[2px] bg-red-500/50"></div>
                        <div className="absolute bottom-[25%] w-[40%] flex justify-between px-1">
                            <div className="w-[2px] h-[4px] bg-red-500"></div>
                            <div className="w-[2px] h-[4px] bg-red-500"></div>
                            <div className="w-[2px] h-[4px] bg-red-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        ))}

        {/* 5. Explosions */}
        {explosions.map(exp => (
            <div 
                key={exp.id}
                className="absolute flex items-center justify-center"
                style={{
                    left: `${(exp.x / GRID_WIDTH) * 100}%`,
                    top: `${(exp.y / GRID_HEIGHT) * 100}%`,
                    width: `${100 / GRID_WIDTH}%`,
                    height: `${100 / GRID_HEIGHT}%`,
                    zIndex: 1000,
                }}
            >
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className={`absolute inset-0 bg-cyan-400 opacity-20 animate-ping`}></div>
                    <div className={`relative w-[90%] h-[90%] bg-white border-2 border-cyan-300 shadow-[0_0_30px_#22d3ee] flex items-center justify-center`}>
                        {/* Glitch lines */}
                        <div className="w-full h-[1px] bg-black absolute top-1/4"></div>
                        <div className="w-full h-[1px] bg-black absolute bottom-1/4"></div>
                    </div>
                </div>
            </div>
        ))}

        {/* 6. Particles (New) */}
        {particles.map(p => (
            <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                    left: `${(p.x / GRID_WIDTH) * 100}%`,
                    top: `${(p.y / GRID_HEIGHT) * 100}%`,
                    width: `${(p.size / GRID_WIDTH) * 100}%`,
                    height: `${(p.size / GRID_HEIGHT) * 100}%`,
                    backgroundColor: p.color,
                    opacity: p.life,
                    zIndex: 1001,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 5px ${p.color}`
                }}
            />
        ))}

        {/* 7. Player - Neo Bomber */}
        {player.isAlive ? (
            <div 
                className="absolute flex items-center justify-center transition-all ease-out"
                style={{
                    left: `${(player.x / GRID_WIDTH) * 100}%`,
                    top: `${(player.y / GRID_HEIGHT) * 100}%`,
                    width: `${100 / GRID_WIDTH}%`,
                    height: `${100 / GRID_HEIGHT}%`,
                    zIndex: player.y * 10 + 7, 
                    transitionDuration: `${Math.max(100, player.stats.speed * 0.8)}ms`, 
                }}
            >
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                    {/* Shadow */}
                    <div className="absolute bottom-1 w-2/3 h-2 bg-pink-500/20 blur-sm rounded-full"></div>

                    {/* Neo Bomber Character */}
                    <div className="relative w-[70%] h-[80%] flex flex-col items-center">
                        
                        {/* Antenna */}
                        <div className="absolute -top-1 w-[2px] h-3 bg-slate-700"></div>
                        <div className="absolute -top-2 w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_10px_#ec4899]"></div>

                        {/* Head */}
                        <div className="relative w-full h-[50%] bg-slate-900 rounded-lg border border-slate-700 shadow-[inset_0_0_5px_rgba(255,255,255,0.1)] z-20 flex items-center justify-center overflow-hidden">
                             {/* Face/Eyes - Neon Pink */}
                             <div className="flex gap-1">
                                 <div className="w-1.5 h-3 bg-pink-500 rounded-full shadow-[0_0_5px_#ec4899]"></div>
                                 <div className="w-1.5 h-3 bg-pink-500 rounded-full shadow-[0_0_5px_#ec4899]"></div>
                             </div>
                        </div>

                        {/* Body */}
                        <div className="relative w-[60%] h-[40%] bg-slate-800 rounded-b-md -mt-1 z-10 border-x border-b border-slate-700 flex justify-center">
                             {/* Belt */}
                             <div className="absolute bottom-1 w-full h-[2px] bg-yellow-500"></div>
                             <div className="absolute bottom-0.5 w-1 h-1 bg-yellow-400 border border-yellow-600"></div>
                        </div>

                        {/* Hands - Floating */}
                        <div className="absolute top-[45%] -left-1 w-2.5 h-2.5 bg-pink-600 rounded-full border border-pink-400 shadow-sm animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="absolute top-[45%] -right-1 w-2.5 h-2.5 bg-pink-600 rounded-full border border-pink-400 shadow-sm animate-bounce" style={{ animationDelay: '0.2s' }}></div>

                        {/* Feet */}
                        <div className="absolute -bottom-1 left-0 w-3 h-2 bg-pink-700 rounded-full border border-pink-500"></div>
                        <div className="absolute -bottom-1 right-0 w-3 h-2 bg-pink-700 rounded-full border border-pink-500"></div>
                    </div>
                </div>
            </div>
        ) : (
            <div 
                className="absolute flex items-center justify-center z-50"
                style={{
                    left: `${(player.x / GRID_WIDTH) * 100}%`,
                    top: `${(player.y / GRID_HEIGHT) * 100}%`,
                    width: `${100 / GRID_WIDTH}%`,
                    height: `${100 / GRID_HEIGHT}%`,
                }}
            >
                <div className="w-12 h-12 bg-red-500/20 rounded-full border border-red-500 flex items-center justify-center animate-ping">
                    <Radio className="text-red-500 w-6 h-6" />
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Board;
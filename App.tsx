import React, { useEffect, useCallback, useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import Board from './components/Board';
import TouchControls from './components/TouchControls';
import MainMenu from './components/MainMenu';
import VolumeControl from './components/VolumeControl';
import { startBGM, stopBGM } from './utils/soundUtils';
import { RotateCcw, Trophy, Skull, Crosshair, Zap, Clock, Play, DoorOpen, Pause, X, LogOut, Lock, Unlock } from 'lucide-react';
import { AppMode } from './types';

const Game: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { gameState, movePlayer, placeBomb, restart, nextLevel, togglePause } = useGameEngine();

  // Start Music on mount, Stop on unmount
  useEffect(() => {
    startBGM();
    return () => {
      stopBGM();
    };
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        movePlayer(0, -1);
        break;
      case 'ArrowDown':
      case 's':
        movePlayer(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
        movePlayer(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
        movePlayer(1, 0);
        break;
      case ' ': // Space
      case 'Enter':
        placeBomb();
        break;
      case 'Escape':
        togglePause();
        break;
    }
  }, [movePlayer, placeBomb, togglePause]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const allEnemiesDead = gameState.enemies.length === 0;

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#050510] font-mono text-cyan-50 overflow-hidden select-none">
      
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="w-full h-full bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(20deg)] origin-top"></div>
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-900/20 to-transparent"></div>
      </div>

      {/* Main Content Container with Safe Area Padding */}
      <div className="relative z-10 w-full h-full flex flex-col items-center 
           pt-[env(safe-area-inset-top)] 
           pb-[env(safe-area-inset-bottom)] 
           pl-[env(safe-area-inset-left)] 
           pr-[env(safe-area-inset-right)]">

        {/* Cyberpunk HUD - Responsive */}
        <div className="w-full max-w-4xl px-4 py-2 mt-2 landscape:mt-0 landscape:py-1 z-20 flex justify-between items-start shrink-0">
          
          {/* Left Stats Block & Controls */}
          <div className="flex flex-col gap-2">
              
              {/* Menu Controls */}
              <div className="flex gap-2">
                  <button onClick={onExit} className="bg-red-900/40 border border-red-500/50 p-2 rounded hover:bg-red-800 transition-colors">
                      <X size={16} className="text-red-400" />
                  </button>
                  <button onClick={togglePause} className="bg-yellow-900/40 border border-yellow-500/50 p-2 rounded hover:bg-yellow-800 transition-colors">
                      {gameState.paused ? <Play size={16} className="text-yellow-400" /> : <Pause size={16} className="text-yellow-400" />}
                  </button>
              </div>

              <div className="flex flex-col gap-1 hidden sm:flex">
                  {/* Time */}
                  <div className="bg-slate-900/80 border-l-2 border-red-500 px-3 py-1 skew-x-[-10deg]">
                      <div className="flex items-center gap-2 skew-x-[10deg]">
                          <Clock size={16} className="text-red-500" />
                          <span className="text-xl font-bold text-red-100 tracking-wider shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                              {formatTime(gameState.timeLeft)}
                          </span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Center Level Block */}
          <div className="bg-slate-900/90 border border-cyan-500/30 px-6 py-2 rounded-sm relative mt-2 sm:mt-0 landscape:scale-75 origin-top">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>
              <div className="text-[10px] text-cyan-600 font-bold uppercase tracking-[0.3em] text-center">Level</div>
              <div className="text-3xl font-black text-white text-center drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
                  {gameState.level.toString().padStart(2, '0')}
              </div>
          </div>
          
          {/* Right Stats Block */}
          <div className="flex flex-col items-end gap-1 mt-2 sm:mt-0">
              <div className="bg-slate-900/80 border-r-2 border-cyan-500 px-3 py-1 skew-x-[10deg]">
                  <div className="skew-x-[-10deg] text-right">
                      <span className="text-xs text-cyan-700 font-bold uppercase mr-2">Score</span>
                      <span className="text-xl font-bold text-yellow-400 font-mono">
                          {gameState.score.toString().padStart(6, '0')}
                      </span>
                  </div>
              </div>
              
              {/* Items */}
              <div className="flex gap-2 mt-1">
                  <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-yellow-900">
                      <span className="font-mono text-xs text-yellow-200">{gameState.player.stats.range}</span>
                      <Crosshair size={12} className="text-yellow-500" />
                  </div>
                  <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-cyan-900">
                      <span className="font-mono text-xs text-cyan-200">{(300 / gameState.player.stats.speed).toFixed(1)}</span>
                      <Zap size={12} className="text-cyan-500" />
                  </div>
              </div>
          </div>
        </div>

        {/* Game Board Container - Centered and scaled */}
        {/* Added flex-grow and overflow-hidden to ensure it fits within remaining space */}
        <div className="flex-grow w-full flex items-center justify-center relative z-10 px-2 overflow-hidden landscape:pb-0 pb-20 md:pb-4">
          <Board gameState={gameState} />
        </div>
      </div>

      {/* Mobile Controls Overlay - Visible on Large Phones in Landscape */}
      <div className="lg:hidden z-30">
        <TouchControls onMove={movePlayer} onBomb={placeBomb} />
      </div>

      {/* Paused Overlay */}
      {gameState.paused && !gameState.gameOver && !gameState.won && (
         <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6 p-4">
                <h2 className="text-5xl font-black text-white tracking-widest mb-2 animate-pulse">PAUSED</h2>
                
                <VolumeControl />

                <div className="flex flex-col gap-2 mt-4 w-full">
                    <button 
                        onClick={togglePause}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-500 transition-transform hover:scale-105"
                    >
                        <Play size={20} fill="currentColor" /> RESUME
                    </button>
                    <button 
                        onClick={onExit}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-red-900/50 border border-red-500 text-white font-bold rounded-full hover:bg-red-800 transition-transform hover:scale-105"
                    >
                        <LogOut size={20} /> EXIT
                    </button>
                </div>
            </div>
         </div>
      )}

      {/* Modals: Game Over / Victory */}
      {(gameState.gameOver || gameState.won) && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a16] border border-cyan-500/50 p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(0,255,255,0.2)] relative overflow-hidden">
            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:10px_4px] opacity-20"></div>

            {gameState.won ? (
              <div className="relative flex flex-col items-center">
                <div className="w-20 h-20 border-2 border-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_#22c55e]">
                    <DoorOpen className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-1 tracking-widest uppercase">Sector Clear</h2>
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-green-500 to-transparent mb-4"></div>
                <p className="text-green-400/80 mb-8 font-mono text-sm">Upload complete. Proceed to next node.</p>
                
                <button
                    onClick={nextLevel}
                    className="w-full group relative px-6 py-3 font-bold text-white transition-all duration-200 bg-green-900/30 border border-green-500/50 hover:bg-green-800/50 hover:border-green-400 active:scale-95"
                >
                    <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-green-900"></span>
                    <div className="flex items-center justify-center gap-3">
                        <Play className="w-5 h-5 fill-current" />
                        <span>INITIALIZE NEXT LEVEL</span>
                    </div>
                </button>
              </div>
            ) : (
              <div className="relative flex flex-col items-center">
                <div className="w-20 h-20 border-2 border-red-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_#ef4444]">
                    <Skull className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-red-500 mb-1 tracking-widest uppercase animate-pulse">Fatal Error</h2>
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent mb-4"></div>
                
                <div className="bg-black/50 w-full p-4 mb-6 border border-red-900/50">
                    <p className="text-xs text-red-700 uppercase tracking-widest mb-1 font-bold">Data Harvested</p>
                    <p className="text-3xl font-mono text-red-500">{gameState.score}</p>
                </div>

                <div className="flex flex-col w-full gap-2">
                    <button
                        onClick={restart}
                        className="w-full group relative px-6 py-3 font-bold text-white transition-all duration-200 bg-red-900/30 border border-red-500/50 hover:bg-red-800/50 hover:border-red-400 active:scale-95"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <RotateCcw className="w-5 h-5" />
                            <span>REBOOT SYSTEM</span>
                        </div>
                    </button>
                    <button
                        onClick={onExit}
                        className="w-full px-6 py-3 font-bold text-red-300 transition-all duration-200 hover:text-white"
                    >
                        <span>EXIT TO MENU</span>
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};


const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('MENU');

  if (appMode === 'MENU') {
    return <MainMenu onStartGame={() => setAppMode('GAME')} />;
  }

  return <Game onExit={() => setAppMode('MENU')} />;
};

export default App;
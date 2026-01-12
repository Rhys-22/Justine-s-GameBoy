import React, { useState } from 'react';
import { Gamepad2, Hammer, Settings, Volume2 } from 'lucide-react';
import { initAudio } from '../utils/soundUtils';
import VolumeControl from './VolumeControl';

interface MainMenuProps {
  onStartGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [selectedGame, setSelectedGame] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize Audio Context on first interaction
  const handleInteraction = () => {
    if (!hasInteracted) {
        initAudio();
        setHasInteracted(true);
    }
  };

  const handleStart = () => {
    handleInteraction();
    onStartGame();
  };

  const games = [
    { 
      id: 'neobomber', 
      title: 'NEO BOMBER', 
      desc: 'Tactical Explosive Action', 
      icon: <Gamepad2 size={40} className="text-cyan-400" />,
      color: 'cyan',
      available: true
    },
    { 
      id: 'comingsoon', 
      title: 'LOCKED', 
      desc: 'Data Fragment Missing...', 
      icon: <Hammer size={40} className="text-slate-600" />,
      color: 'slate',
      available: false
    }
  ];

  return (
    <div 
        onClick={handleInteraction}
        className="min-h-screen bg-[#050510] flex flex-col relative overflow-hidden font-mono text-white"
    >
      
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050510] to-black"></div>
         {/* Cyber Waves */}
         <div className="absolute top-[20%] left-0 w-full h-[1px] bg-cyan-500/20 blur-[1px]"></div>
         <div className="absolute top-[25%] left-0 w-full h-[1px] bg-cyan-500/10 blur-[1px]"></div>
         <div className="absolute bottom-[20%] left-0 w-full h-[1px] bg-fuchsia-500/20 blur-[1px]"></div>
         
         {/* Moving Particles */}
         <div className="absolute w-2 h-2 bg-cyan-400 rounded-full top-1/4 left-1/4 animate-ping opacity-20"></div>
         <div className="absolute w-1 h-1 bg-fuchsia-400 rounded-full bottom-1/3 right-1/4 animate-pulse opacity-40"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${hasInteracted ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm tracking-[0.3em] text-slate-400">
                {hasInteracted ? 'SYSTEM READY' : 'TAP TO INIT'}
            </span>
        </div>
        <div className="flex items-center gap-4">
             <button 
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                className={`p-2 rounded-full border transition-colors ${showSettings ? 'border-cyan-400 bg-cyan-900/50 text-cyan-400' : 'border-slate-700 text-slate-500 hover:text-white'}`}
             >
                <Settings size={18} />
             </button>
             <div className="text-xs text-slate-500">v.2.0.80</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow flex flex-col justify-center items-center">
        
        {!hasInteracted && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="flex flex-col items-center gap-4 animate-bounce">
                    <Volume2 size={48} className="text-cyan-400" />
                    <span className="text-cyan-400 tracking-widest text-sm font-bold uppercase">Tap anywhere to initialize</span>
                </div>
            </div>
        )}

        {showSettings ? (
            <div className="animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                <VolumeControl />
            </div>
        ) : (
            <div className="w-full space-y-4 pl-8 md:pl-20">
            {games.map((game, index) => {
                const isSelected = selectedGame === index;
                
                return (
                <div 
                    key={game.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedGame(index); }}
                    className={`
                        group relative flex items-center gap-6 cursor-pointer transition-all duration-300
                        ${isSelected ? 'translate-x-10 scale-105 opacity-100' : 'opacity-40 hover:opacity-70'}
                    `}
                >
                    {/* Icon Container */}
                    <div className={`
                        w-20 h-20 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 shadow-lg
                        ${isSelected 
                            ? `border-${game.color}-400 bg-${game.color}-900/20 shadow-[0_0_30px_rgba(34,211,238,0.2)]` 
                            : 'border-slate-700 bg-slate-800/50'}
                    `}>
                        {game.icon}
                    </div>

                    {/* Text Info */}
                    <div className="flex flex-col">
                        <h2 className={`text-4xl font-black italic tracking-tighter uppercase transition-colors ${isSelected ? `text-${game.color}-400` : 'text-slate-300'}`}>
                            {game.title}
                        </h2>
                        {isSelected && (
                            <div className="text-sm text-slate-400 font-bold tracking-widest uppercase animate-in slide-in-from-left-4 fade-in duration-300">
                                {game.desc}
                            </div>
                        )}
                    </div>

                    {/* Selection Line */}
                    {isSelected && (
                        <div className="absolute -left-32 top-1/2 w-24 h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                    )}
                </div>
                )
            })}
            </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="relative z-10 p-8 flex justify-center md:justify-end gap-8 border-t border-white/5 bg-black/40 backdrop-blur-md">
        
        {!showSettings && (
            <button 
                onClick={(e) => { e.stopPropagation(); games[selectedGame].available && handleStart(); }}
                className={`
                    flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xl transition-all
                    ${games[selectedGame].available 
                        ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 shadow-[0_0_20px_#22d3ee]' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                `}
            >
                <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
                    <div className="w-4 h-4 bg-current rounded-full"></div>
                </div>
                {games[selectedGame].available ? 'START GAME' : 'LOCKED'}
            </button>
        )}
        
        <div className="hidden md:flex items-center gap-2 text-slate-500">
             <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-xs">ESC</div>
             <span>BACK</span>
        </div>
      </div>

    </div>
  );
};

export default MainMenu;

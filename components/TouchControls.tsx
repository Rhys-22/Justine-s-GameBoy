import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Target } from 'lucide-react';

interface TouchControlsProps {
  onMove: (dx: number, dy: number) => void;
  onBomb: () => void;
}

const TouchControls: React.FC<TouchControlsProps> = ({ onMove, onBomb }) => {
  return (
    <>
    {/* Container */}
    <div className="absolute inset-0 pointer-events-none select-none z-40 overflow-hidden">
      
      {/* D-Pad Area */}
      {/* 
         Portrait: Bottom Left (bottom-6 left-6)
         Landscape: Center Left (top-1/2 -translate-y-1/2 left-8)
      */}
      <div className="absolute w-40 h-40 pointer-events-auto
           bottom-6 left-6 
           landscape:bottom-auto landscape:top-1/2 landscape:-translate-y-1/2 landscape:left-8
      ">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm clip-path-hexagon border border-cyan-900/30"></div>
        
        <button 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 active:scale-95 flex items-center justify-center text-cyan-400 active:text-white"
            onTouchStart={(e) => { e.preventDefault(); onMove(0, -1); }}
            onClick={() => onMove(0, -1)}
        >
            <ChevronUp size={40} strokeWidth={3} />
        </button>
        <button 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 active:scale-95 flex items-center justify-center text-cyan-400 active:text-white"
            onTouchStart={(e) => { e.preventDefault(); onMove(0, 1); }}
            onClick={() => onMove(0, 1)}
        >
            <ChevronDown size={40} strokeWidth={3} />
        </button>
        <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 active:scale-95 flex items-center justify-center text-cyan-400 active:text-white"
            onTouchStart={(e) => { e.preventDefault(); onMove(-1, 0); }}
            onClick={() => onMove(-1, 0)}
        >
            <ChevronLeft size={40} strokeWidth={3} />
        </button>
        <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 active:scale-95 flex items-center justify-center text-cyan-400 active:text-white"
            onTouchStart={(e) => { e.preventDefault(); onMove(1, 0); }}
            onClick={() => onMove(1, 0)}
        >
            <ChevronRight size={40} strokeWidth={3} />
        </button>
        
        {/* Decorative Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-cyan-500/30 bg-cyan-900/20"></div>
      </div>

      {/* Action Button - Bomb */}
      {/* 
         Portrait: Bottom Right (bottom-10 right-6)
         Landscape: Center Right (top-1/2 -translate-y-1/2 right-8)
      */}
      <div className="absolute pointer-events-auto
           bottom-10 right-6
           landscape:bottom-auto landscape:top-1/2 landscape:-translate-y-1/2 landscape:right-8
      ">
        <button 
            className="w-24 h-24 relative group active:scale-95 transition-transform"
            onTouchStart={(e) => { e.preventDefault(); onBomb(); }}
            onClick={() => onBomb()}
        >
            <div className="absolute inset-0 bg-red-600/20 rounded-full border-2 border-red-500 animate-pulse-slow"></div>
            <div className="absolute inset-2 bg-red-900/80 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_#ef4444] group-active:bg-red-600">
                <Target className="text-white w-10 h-10" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-red-400 font-bold tracking-widest uppercase">FIRE</div>
        </button>
      </div>

    </div>
    </>
  );
};

export default TouchControls;

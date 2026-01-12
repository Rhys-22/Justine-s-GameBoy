import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Zap } from 'lucide-react';
import { getVolumes, setSFXVolume, setMusicVolume } from '../utils/soundUtils';

const VolumeControl: React.FC = () => {
  const [vols, setVols] = useState(getVolumes());

  const handleSFXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSFXVolume(val);
    setVols(prev => ({ ...prev, sfx: val }));
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVolume(val);
    setVols(prev => ({ ...prev, music: val }));
  };

  const toggleSFX = () => {
    const newVal = vols.sfx > 0 ? 0 : 0.8;
    setSFXVolume(newVal);
    setVols(prev => ({ ...prev, sfx: newVal }));
  };

  const toggleMusic = () => {
    const newVal = vols.music > 0 ? 0 : 0.5;
    setMusicVolume(newVal);
    setVols(prev => ({ ...prev, music: newVal }));
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900/80 border border-slate-700 rounded-lg w-full max-w-xs backdrop-blur-sm">
      <h3 className="text-cyan-400 font-bold tracking-widest text-xs uppercase mb-1 flex items-center gap-2">
        <Volume2 size={14} /> Audio Systems
      </h3>
      
      {/* SFX Control */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs text-slate-400">
           <div className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={toggleSFX}>
             <Zap size={12} className={vols.sfx > 0 ? 'text-yellow-400' : 'text-slate-600'} />
             <span>SFX</span>
           </div>
           <span>{Math.round(vols.sfx * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0" max="1" step="0.1" 
          value={vols.sfx} 
          onChange={handleSFXChange}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
        />
      </div>

      {/* Music Control */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs text-slate-400">
           <div className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={toggleMusic}>
             <Music size={12} className={vols.music > 0 ? 'text-cyan-400' : 'text-slate-600'} />
             <span>MUSIC</span>
           </div>
           <span>{Math.round(vols.music * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0" max="1" step="0.1" 
          value={vols.music} 
          onChange={handleMusicChange}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>
    </div>
  );
};

export default VolumeControl;

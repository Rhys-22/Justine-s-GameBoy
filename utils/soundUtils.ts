// Audio Context Singleton
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

// Sequencer State
let isPlaying = false;
let currentNote = 0;
let nextNoteTime = 0.0;
const TEMPO = 160; 
const LOOKAHEAD = 25.0; // ms
const SCHEDULE_AHEAD_TIME = 0.1; // s

// Volume State
let sfxVolume = 1.0;
let musicVolume = 0.5;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const setSFXVolume = (val: number) => {
  sfxVolume = Math.max(0, Math.min(1, val));
};

export const setMusicVolume = (val: number) => {
  musicVolume = Math.max(0, Math.min(1, val));
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(0.3 * musicVolume, audioCtx.currentTime);
  }
};

export const getVolumes = () => ({ sfx: sfxVolume, music: musicVolume });

// --- BGM SYNTHESIZER ---

// Simple Drum Synthesis
const playDrum = (time: number, type: 'kick' | 'snare' | 'hihat') => {
    if (!audioCtx || !masterGain) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Connect to Master Music Gain
    gain.connect(masterGain);

    if (type === 'kick') {
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.connect(gain);
        osc.start(time);
        osc.stop(time + 0.5);
    } else if (type === 'snare') {
        // Noise buffer for snare
        const bufferSize = audioCtx.sampleRate * 0.2; // 200ms
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        // Filter
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, time);
        
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        noise.connect(filter);
        filter.connect(gain);
        noise.start(time);
    } else if (type === 'hihat') {
        // Short high noise
        const bufferSize = audioCtx.sampleRate * 0.05;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(5000, time);
        
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        
        noise.connect(filter);
        filter.connect(gain);
        noise.start(time);
    }
};

// Bass/Lead Synth
const playSynth = (time: number, note: number, length: number) => {
    if (!audioCtx || !masterGain) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(note, time);
    
    // Funky filter envelope
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, time);
    filter.frequency.exponentialRampToValueAtTime(2000, time + 0.05);
    filter.frequency.exponentialRampToValueAtTime(200, time + length);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.linearRampToValueAtTime(0, time + length);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(time);
    osc.stop(time + length);
};

// Scheduler
const scheduleNote = (beatNumber: number, time: number) => {
    // 16th notes
    const step = beatNumber % 16;
    
    // Drum Pattern (Fast Breakbeat Style)
    // K . . . S . . . K . K . S . . . 
    if (step === 0 || step === 8 || step === 10) playDrum(time, 'kick');
    if (step === 4 || step === 12) playDrum(time, 'snare');
    if (step % 2 === 0) playDrum(time, 'hihat'); // 8th note hihats

    // Bassline (E minor pentatonic ish)
    // Frequencies: E2=82, G2=98, A2=110, B2=123, D3=146
    const bassSeq = [
        82, 0, 82, 0,  110, 0, 98, 0,
        82, 82, 0, 123, 110, 0, 0, 98
    ];
    
    const note = bassSeq[step];
    if (note > 0) {
        playSynth(time, note, 0.15);
    }
};

const scheduler = () => {
    if (!audioCtx) return;
    // while there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    while (nextNoteTime < audioCtx.currentTime + SCHEDULE_AHEAD_TIME) {
        scheduleNote(currentNote, nextNoteTime);
        // Advance time
        const secondsPerBeat = 60.0 / TEMPO;
        nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
        currentNote++;
        if (currentNote === 16) currentNote = 0;
    }
    
    if (isPlaying) {
        window.setTimeout(scheduler, LOOKAHEAD);
    }
};

export const startBGM = () => {
    if (!audioCtx) return;
    if (isPlaying) return;

    // Initialize Master Gain for Music
    if (!masterGain) {
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
    }
    masterGain.gain.setValueAtTime(0.3 * musicVolume, audioCtx.currentTime);

    isPlaying = true;
    currentNote = 0;
    nextNoteTime = audioCtx.currentTime + 0.1;
    scheduler();
};

export const stopBGM = () => {
    isPlaying = false;
};


// --- SFX ---

const createOscillator = (type: OscillatorType, freq: number, duration: number, gainVal: number = 0.1) => {
  if (!audioCtx) return;
  
  const finalGain = gainVal * sfxVolume;
  if (finalGain <= 0.001) return; // Don't play silent sounds

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(finalGain, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const playSound = (type: 'bomb' | 'powerup' | 'break' | 'start' | 'win' | 'die' | 'plant' | 'kill') => {
  if (!audioCtx) return;
  if (sfxVolume <= 0) return;

  switch (type) {
    case 'plant':
      createOscillator('sine', 880, 0.1, 0.1);
      break;

    case 'kill':
      if (sfxVolume > 0) {
        const bufferSize = audioCtx.sampleRate * 0.3;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
           const t = i / audioCtx.sampleRate;
           data[i] = (Math.random() * 2 - 1) * (1 - t/0.3);
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.2 * sfxVolume, audioCtx.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start();
      }
      break;

    case 'bomb':
      createOscillator('sawtooth', 100, 0.5, 0.2);
      createOscillator('square', 50, 0.6, 0.2);
      const bufferSize = audioCtx.sampleRate * 0.5;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.3 * sfxVolume, audioCtx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      noise.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start();
      break;

    case 'break':
      createOscillator('square', 200, 0.1, 0.1);
      createOscillator('sawtooth', 150, 0.15, 0.1);
      break;

    case 'powerup':
      const now = audioCtx.currentTime;
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.1 * sfxVolume, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.2);
      });
      break;

    case 'start':
      createOscillator('triangle', 440, 0.5, 0.2);
      break;

    case 'win':
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
         const osc = audioCtx!.createOscillator();
         const gain = audioCtx!.createGain();
         osc.type = 'triangle';
         osc.frequency.setValueAtTime(freq, audioCtx!.currentTime + i * 0.15);
         gain.gain.setValueAtTime(0.1 * sfxVolume, audioCtx!.currentTime + i * 0.15);
         gain.gain.exponentialRampToValueAtTime(0.01, audioCtx!.currentTime + i * 0.15 + 1);
         osc.connect(gain);
         gain.connect(audioCtx!.destination);
         osc.start(audioCtx!.currentTime + i * 0.15);
         osc.stop(audioCtx!.currentTime + i * 0.15 + 1);
      });
      break;
      
    case 'die':
       createOscillator('sawtooth', 150, 0.8, 0.3);
       if(audioCtx) {
           const o = audioCtx.createOscillator();
           const g = audioCtx.createGain();
           o.frequency.setValueAtTime(200, audioCtx.currentTime);
           o.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
           g.gain.setValueAtTime(0.2 * sfxVolume, audioCtx.currentTime);
           g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
           o.connect(g);
           g.connect(audioCtx.destination);
           o.start();
           o.stop(audioCtx.currentTime + 0.5);
       }
       break;
  }
};

import React from 'react';
import { FemaleCharacterData, WeatherType, GameStats } from '../game/types';
import { 
  Sun, 
  CloudRain, 
  Sunset, 
  Moon, 
  CloudFog, 
  Heart, 
  ShieldAlert, 
  DollarSign, 
  Award, 
  Car, 
  Volume2, 
  VolumeX,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { sound } from '../game/audio';

interface HUDProps {
  stats: GameStats;
  currentWeather: WeatherType;
  inVehicle: boolean;
  vehicleSpeed: number;
  playerPos: [number, number];
  playerHeading: number;
  femaleCharacters: FemaleCharacterData[];
  activeCompanion: FemaleCharacterData | null;
  interactionPrompt: { character: FemaleCharacterData; distance: number } | null;
  onOpenInteraction: (char: FemaleCharacterData) => void;
  onOpenPhone: () => void;
  subtitle: { speaker: string; text: string } | null;
  longKissProgress: { duration: number; tier: string } | null;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  currentWeather,
  inVehicle,
  vehicleSpeed,
  playerPos,
  playerHeading,
  femaleCharacters,
  activeCompanion,
  interactionPrompt,
  onOpenInteraction,
  onOpenPhone,
  subtitle,
  longKissProgress,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getIsMuted());

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const getWeatherIcon = (w: WeatherType) => {
    switch (w) {
      case 'sunny': return <Sun className="w-4 h-4 text-amber-400" />;
      case 'sunset': return <Sunset className="w-4 h-4 text-orange-400" />;
      case 'storm': return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'fog': return <CloudFog className="w-4 h-4 text-slate-300" />;
      case 'midnight': return <Moon className="w-4 h-4 text-indigo-300" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-4 overflow-hidden">
      {/* 1. TOP BAR HUD */}
      <div className="flex items-center justify-between w-full">
        {/* Left: App Title & Weather */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800 text-white px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-none flex items-center gap-2 pointer-events-auto">
            <span className="font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 text-sm">
              VICE CITY NEXT
            </span>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              {getWeatherIcon(currentWeather)}
              <span className="capitalize font-medium">{currentWeather}</span>
            </div>
          </div>

          {activeCompanion && (
            <div className="bg-pink-950/70 border border-pink-700/60 text-pink-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span>Companion: {activeCompanion.name}</span>
            </div>
          )}
        </div>

        {/* Right: Stats, Stars & Audio Toggle */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Wanted Stars */}
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-base font-bold transition-colors ${
                  star <= stats.wantedLevel ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                }`}
              >
                ★
              </span>
            ))}
          </div>

          {/* Money & Respect */}
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-4 text-xs font-mono text-slate-200 shadow-lg">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{stats.money.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400 font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>RSP: {stats.respect}</span>
            </div>
          </div>

          {/* Phone Trigger */}
          <button
            onClick={onOpenPhone}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-transform active:scale-95 shadow-lg flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Open Smartphone"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Phone</span>
          </button>

          {/* Sound Mute */}
          <button
            onClick={toggleSound}
            className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 p-2 rounded-lg cursor-pointer transition-colors"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* 2. CENTER INTENT: LONG KISS PROGRESS BAR */}
      {longKissProgress && (
        <div className="self-center bg-slate-950/90 border border-pink-500/70 p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2 pointer-events-auto max-w-sm w-full mx-auto animate-in fade-in">
          <div className="flex items-center gap-2 text-pink-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
            <span>KISSING LONG TIME</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-pink-900/50">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 transition-all duration-100"
              style={{ width: `${Math.min(100, (longKissProgress.duration / 10) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between w-full text-xs text-slate-300">
            <span className="font-mono">{longKissProgress.duration.toFixed(1)}s hold</span>
            <span className="text-pink-400 font-semibold">{longKissProgress.tier}</span>
          </div>
          <span className="text-[11px] text-slate-400 text-center">
            Hold interaction for soulmate milestones and rewards!
          </span>
        </div>
      )}

      {/* 3. SUBTITLE BOX (ENGLISH SPOKEN VOICES) */}
      {subtitle && (
        <div className="self-center bg-slate-950/90 border border-slate-800/90 px-6 py-2.5 rounded-xl shadow-2xl text-center max-w-xl mx-auto my-auto pointer-events-none">
          <p className="text-xs uppercase tracking-wider text-pink-400 font-bold mb-0.5">
            {subtitle.speaker}
          </p>
          <p className="text-sm font-medium text-slate-100 italic leading-relaxed">
            "{subtitle.text}"
          </p>
        </div>
      )}

      {/* 4. BOTTOM INTERACTION PROMPTS & MINI-RADAR */}
      <div className="flex items-end justify-between w-full">
        {/* Radar Map & Speedometer */}
        <div className="flex items-end gap-4 pointer-events-auto">
          {/* Circular GTA Style Minimap */}
          <div className="relative w-36 h-36 rounded-full bg-slate-950/90 border-2 border-slate-700 shadow-2xl overflow-hidden flex items-center justify-center">
            {/* Grid cross lines */}
            <div className="absolute inset-0 border border-slate-800 rounded-full" />
            <div className="absolute w-full h-px bg-slate-800/60" />
            <div className="absolute h-full w-px bg-slate-800/60" />

            {/* Radar Sweep / Rings */}
            <div className="absolute w-24 h-24 border border-slate-800/80 rounded-full" />
            <div className="absolute w-12 h-12 border border-slate-800/80 rounded-full" />

            {/* Female NPC Blips */}
            {femaleCharacters.map((char) => {
              const relX = (char.position[0] - playerPos[0]) * 0.7;
              const relZ = (char.position[2] - playerPos[1]) * 0.7;
              const dist = Math.sqrt(relX * relX + relZ * relZ);
              if (dist > 58) return null; // Outside radar range

              return (
                <div
                  key={char.id}
                  className="absolute w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-md transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    backgroundColor: char.avatarColor,
                    left: `calc(50% + ${relX}px)`,
                    top: `calc(50% + ${relZ}px)`,
                  }}
                  title={char.name}
                >
                  ♥
                </div>
              );
            })}

            {/* Center Player Arrow */}
            <div
              className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-cyan-400 z-10 drop-shadow"
              style={{
                transform: `rotate(${playerHeading}rad)`,
              }}
            />
          </div>

          {/* Speedometer (when driving) */}
          {inVehicle && (
            <div className="bg-slate-950/90 border border-slate-800 px-4 py-2 rounded-xl text-slate-100 flex flex-col items-center shadow-xl">
              <span className="text-2xl font-black font-mono tracking-tighter text-cyan-400">
                {Math.round(Math.abs(vehicleSpeed) * 2.237)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                MPH
              </span>
            </div>
          )}
        </div>

        {/* Floating Proximity Action Button */}
        {interactionPrompt && (
          <div className="pointer-events-auto bg-slate-950/95 border border-pink-500/80 rounded-2xl p-3 shadow-2xl flex items-center gap-3 animate-bounce">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow"
              style={{ backgroundColor: interactionPrompt.character.avatarColor }}
            >
              {interactionPrompt.character.name[0]}
            </div>

            <div className="text-left">
              <div className="text-xs font-bold text-slate-200">
                {interactionPrompt.character.name}
              </div>
              <div className="text-[10px] text-pink-400 font-medium">
                {interactionPrompt.character.tier} • {interactionPrompt.character.affection}% Affection
              </div>
            </div>

            <button
              onClick={() => onOpenInteraction(interactionPrompt.character)}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-lg active:scale-95 transition-transform"
            >
              [F] Interact
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

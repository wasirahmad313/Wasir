import React, { useState } from 'react';
import { WeatherType, FemaleCharacterData } from '../game/types';
import { 
  ChevronDown, 
  ChevronUp, 
  Sun, 
  Sunset, 
  CloudRain, 
  CloudFog, 
  Moon, 
  Car, 
  Camera, 
  HelpCircle, 
  Smartphone, 
  Heart,
  Volume2,
  Wrench
} from 'lucide-react';
import { sound } from '../game/audio';

interface BottomControlDockProps {
  currentWeather: WeatherType;
  onChangeWeather: (w: WeatherType) => void;
  onSpawnVehicle: (type: 'apex' | 'muscle' | 'moto') => void;
  onOpenPhone: () => void;
  onCycleCamera: () => void;
  cameraMode: string;
  characters: FemaleCharacterData[];
  onTeleportToCharacter: (char: FemaleCharacterData) => void;
  onRepairCity: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  currentWeather,
  onChangeWeather,
  onSpawnVehicle,
  onOpenPhone,
  onCycleCamera,
  cameraMode,
  characters,
  onTeleportToCharacter,
  onRepairCity,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 pointer-events-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-pink-400">Controls &amp; Roleplay Guide</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-1 rounded-lg bg-slate-900"
              >
                Close [ESC]
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Move / Drive</span>
                <span className="font-mono text-cyan-400 font-bold">W, A, S, D / Arrow Keys</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Sprint / Turbo Boost</span>
                <span className="font-mono text-cyan-400 font-bold">Left Shift</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Handbrake Drift / Jump</span>
                <span className="font-mono text-cyan-400 font-bold">Spacebar</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Enter / Exit Vehicle</span>
                <span className="font-mono text-cyan-400 font-bold">E Key</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Interact with Female Character</span>
                <span className="font-mono text-pink-400 font-bold">F Key</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Playful Slap Reaction</span>
                <span className="font-mono text-amber-400 font-bold">G Key</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Martial Snap Kick</span>
                <span className="font-mono text-amber-400 font-bold">K Key</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Cycle Camera Mode</span>
                <span className="font-mono text-cyan-400 font-bold">C Key</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Orbit Camera Angle</span>
                <span className="font-mono text-slate-300 font-bold">Click + Drag Mouse</span>
              </div>
            </div>

            <div className="p-3 bg-pink-950/40 border border-pink-900/50 rounded-xl text-[11px] text-pink-200 leading-relaxed">
              💡 <strong>Pro Roleplay Tip:</strong> Approach Elena, Scarlett, Maya, or Chloe and press <strong>F</strong>. Choose <strong>Hold to Kiss Long Time</strong> to build soulmate affection milestones and unlock custom vehicles!
            </div>
          </div>
        </div>
      )}

      {/* Dock Container */}
      <div 
        className={`fixed left-1/2 -translate-x-1/2 z-40 transition-transform duration-300 ease-out flex flex-col items-center pointer-events-auto ${
          isCollapsed ? 'bottom-2 translate-y-[calc(100%-28px)]' : 'bottom-4'
        }`}
        style={{ maxWidth: 'min(940px, 95vw)' }}
      >
        {/* Toggle Collapse Pill */}
        <button
          onClick={() => {
            sound.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 text-slate-300 text-[11px] font-bold px-3 py-1 rounded-t-xl cursor-pointer flex items-center gap-1.5 shadow-lg transition-colors"
        >
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isCollapsed ? 'Show Controls Dock' : 'Hide Controls (Zen Mode)'}</span>
        </button>

        {/* Horizontal Dock Body */}
        <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-slate-200">
          {/* Weather Selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 hidden sm:inline">
              Weather:
            </span>
            <button
              onClick={() => onChangeWeather('sunny')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                currentWeather === 'sunny' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Clear Sunny"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeWeather('sunset')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                currentWeather === 'sunset' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Golden Hour Sunset"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeWeather('storm')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                currentWeather === 'storm' ? 'bg-blue-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Heavy Rain Storm &amp; Thunder"
            >
              <CloudRain className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeWeather('fog')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                currentWeather === 'fog' ? 'bg-slate-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Atmospheric Fog"
            >
              <CloudFog className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeWeather('midnight')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                currentWeather === 'midnight' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Cyber Midnight Stars"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Vehicle Delivery */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 hidden sm:inline">
              Vehicle:
            </span>
            <button
              onClick={() => onSpawnVehicle('apex')}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-red-600/30 text-red-300 hover:bg-red-600/50 cursor-pointer transition-colors"
            >
              Apex GT
            </button>
            <button
              onClick={() => onSpawnVehicle('muscle')}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 cursor-pointer transition-colors"
            >
              V8 Muscle
            </button>
            <button
              onClick={() => onSpawnVehicle('moto')}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 cursor-pointer transition-colors"
            >
              Motorcycle
            </button>
          </div>

          {/* Character Quick Meet */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5">
              Meet:
            </span>
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => onTeleportToCharacter(c)}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-1"
                title={`Go to ${c.name} (${c.title})`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.avatarColor }}
                />
                <span>{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onCycleCamera}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
              title="Change Camera View"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="capitalize hidden sm:inline">{cameraMode.replace('_', ' ')}</span>
            </button>

            <button
              onClick={onRepairCity}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors"
              title="Repair Destroyed Streetlights &amp; Barriers"
            >
              <Wrench className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenPhone}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer shadow transition-transform active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phone</span>
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors"
              title="Controls &amp; Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

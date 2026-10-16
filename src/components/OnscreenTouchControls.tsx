import React from 'react';
import { FemaleCharacterData } from '../game/types';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  Car, 
  Hand, 
  Footprints, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface OnscreenTouchControlsProps {
  inVehicle: boolean;
  onInput: (action: string, active: boolean) => void;
  onEnterExitVehicle: () => void;
  onInteract: () => void;
  onSlap: () => void;
  onKick: () => void;
  canInteract: boolean;
}

export const OnscreenTouchControls: React.FC<OnscreenTouchControlsProps> = ({
  inVehicle,
  onInput,
  onEnterExitVehicle,
  onInteract,
  onSlap,
  onKick,
  canInteract,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex justify-between items-end p-4 pb-20 sm:pb-24">
      {/* Left: D-Pad Directional Controls */}
      <div className="pointer-events-auto flex flex-col items-center gap-1 bg-slate-950/70 p-2 rounded-2xl border border-slate-800 backdrop-blur-none shadow-2xl">
        <button
          onMouseDown={() => onInput('forward', true)}
          onMouseUp={() => onInput('forward', false)}
          onTouchStart={() => onInput('forward', true)}
          onTouchEnd={() => onInput('forward', false)}
          className="w-12 h-12 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        <div className="flex gap-1">
          <button
            onMouseDown={() => onInput('left', true)}
            onMouseUp={() => onInput('left', false)}
            onTouchStart={() => onInput('left', true)}
            onTouchEnd={() => onInput('left', false)}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onMouseDown={() => onInput('backward', true)}
            onMouseUp={() => onInput('backward', false)}
            onTouchStart={() => onInput('backward', true)}
            onTouchEnd={() => onInput('backward', false)}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onMouseDown={() => onInput('right', true)}
            onMouseUp={() => onInput('right', false)}
            onTouchStart={() => onInput('right', true)}
            onTouchEnd={() => onInput('right', false)}
            className="w-12 h-12 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shadow"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <div className="flex gap-2">
          {/* Slap button */}
          <button
            onClick={onSlap}
            className="w-11 h-11 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 cursor-pointer"
            title="Slap [G]"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Kick button */}
          <button
            onClick={onKick}
            className="w-11 h-11 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 cursor-pointer"
            title="Kick [K]"
          >
            <Footprints className="w-5 h-5" />
          </button>

          {/* Sprint / Drift */}
          <button
            onMouseDown={() => onInput('sprint', true)}
            onMouseUp={() => onInput('sprint', false)}
            onTouchStart={() => onInput('sprint', true)}
            onTouchEnd={() => onInput('sprint', false)}
            className="w-11 h-11 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 cursor-pointer"
            title={inVehicle ? 'Handbrake [Space]' : 'Sprint [Shift]'}
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          {/* Enter/Exit Vehicle */}
          <button
            onClick={onEnterExitVehicle}
            className="w-13 h-13 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-95 cursor-pointer"
            title="Enter / Exit Vehicle [E]"
          >
            <Car className="w-6 h-6" />
          </button>

          {/* Interact / Roleplay Dialog */}
          <button
            onClick={onInteract}
            className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-xl active:scale-95 cursor-pointer transition-all ${
              canInteract
                ? 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white ring-2 ring-pink-400'
                : 'bg-slate-800 text-slate-400'
            }`}
            title="Social Interact [F]"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

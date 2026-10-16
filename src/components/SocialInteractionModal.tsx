import React, { useState } from 'react';
import { FemaleCharacterData, GesturePosition, WeatherType } from '../game/types';
import { 
  Heart, 
  MessageSquare, 
  Sparkles, 
  UserPlus, 
  UserMinus, 
  X, 
  Hand, 
  Footprints, 
  Music, 
  Armchair, 
  Smile,
  ShieldAlert
} from 'lucide-react';

interface SocialModalProps {
  character: FemaleCharacterData;
  weather: WeatherType;
  isCompanion: boolean;
  onClose: () => void;
  onTalk: () => void;
  onGesture: (gesture: GesturePosition, duration?: number) => void;
  onStartHoldKiss: () => void;
  onEndHoldKiss: () => void;
  onToggleCompanion: () => void;
}

export const SocialInteractionModal: React.FC<SocialModalProps> = ({
  character,
  weather,
  isCompanion,
  onClose,
  onTalk,
  onGesture,
  onStartHoldKiss,
  onEndHoldKiss,
  onToggleCompanion,
}) => {
  const [activeTab, setActiveTab] = useState<'romance' | 'positions' | 'banter'>('romance');
  const [isHoldingKiss, setIsHoldingKiss] = useState(false);

  const handleKissMouseDown = () => {
    setIsHoldingKiss(true);
    onStartHoldKiss();
  };

  const handleKissMouseUp = () => {
    if (isHoldingKiss) {
      setIsHoldingKiss(false);
      onEndHoldKiss();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none pointer-events-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header Profile */}
        <div 
          className="p-5 flex items-center justify-between border-b border-slate-800 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${character.avatarColor}22 0%, #020617 100%)`,
          }}
        >
          <div className="flex items-center gap-3 z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg border-2 border-white/20"
              style={{ backgroundColor: character.avatarColor }}
            >
              {character.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">{character.name}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  {character.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400">{character.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-rose-400 h-full transition-all"
                    style={{ width: `${character.affection}%` }}
                  />
                </div>
                <span className="text-[11px] text-pink-400 font-mono font-bold">
                  {character.affection}% Affection
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab('romance')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'romance'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Hug &amp; Kiss</span>
          </button>

          <button
            onClick={() => setActiveTab('positions')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'positions'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Positions</span>
          </button>

          <button
            onClick={() => setActiveTab('banter')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'banter'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Talk &amp; Banter</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 space-y-3">
          {activeTab === 'romance' && (
            <div className="space-y-3">
              {/* Kissing Long Time (Special Hold Feature) */}
              <div className="bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/40 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-pink-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span>KISSING LONG TIME (REWARD SYSTEM)</span>
                  </div>
                  <span className="text-[10px] text-pink-400 font-semibold bg-pink-950 px-2 py-0.5 rounded-full border border-pink-700/50">
                    HOLD TO CHARGE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mb-3">
                  Hold down to engage in continuous romantic kiss. Reach 3s, 6s, and 10s tiers to unlock deep affection multipliers, exclusive dialogue, and companion rewards!
                </p>

                <button
                  onMouseDown={handleKissMouseDown}
                  onMouseUp={handleKissMouseUp}
                  onTouchStart={handleKissMouseDown}
                  onTouchEnd={handleKissMouseUp}
                  className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xl select-none ${
                    isHoldingKiss
                      ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 text-white scale-[0.98] ring-4 ring-pink-500/50'
                      : 'bg-pink-600 hover:bg-pink-500 text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isHoldingKiss ? 'animate-ping' : ''}`} />
                  <span>{isHoldingKiss ? 'KISSING IN PROGRESS (HOLDING...)' : 'HOLD TO KISS LONG TIME'}</span>
                </button>
              </div>

              {/* Gentle Kiss & Hugs */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    onGesture('gentle_kiss', 3.0);
                    onClose();
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/50 p-3 rounded-xl text-left cursor-pointer transition-all"
                >
                  <div className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    <span>Gentle Kiss</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tender kiss on the cheek or lips (+10 Affection)
                  </p>
                </button>

                <button
                  onClick={() => {
                    onGesture('warm_hug', 3.0);
                    onClose();
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/50 p-3 rounded-xl text-left cursor-pointer transition-all"
                >
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Warm Hug</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Close chest-to-chest embrace (+6 Affection)
                  </p>
                </button>

                <button
                  onClick={() => {
                    onGesture('deep_hug', 4.0);
                    onClose();
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/50 p-3 rounded-xl text-left cursor-pointer transition-all"
                >
                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Deep Comfort Hug</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Extended sway embrace in your arms (+12 Affection)
                  </p>
                </button>

                <button
                  onClick={() => {
                    onGesture('hold_hands', 4.0);
                    onClose();
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-xl text-left cursor-pointer transition-all"
                >
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Hand className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hold Hands</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Walk side-by-side holding hands (+8 Affection)
                  </p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  onGesture('slow_dance', 5.0);
                  onClose();
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-xl text-left cursor-pointer transition-all"
              >
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Slow Romantic Dance</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Synchronized slow dance waltz under the sky
                </p>
              </button>

              <button
                onClick={() => {
                  onGesture('sit_together', 5.0);
                  onClose();
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-xl text-left cursor-pointer transition-all"
              >
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sit Together</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Rest head on shoulder watching the ocean
                </p>
              </button>

              <button
                onClick={() => {
                  onGesture('lean_on_car', 5.0);
                  onClose();
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-xl text-left cursor-pointer transition-all"
              >
                <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Lean on Car Hood</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Cool relaxed posture chatting near the ride
                </p>
              </button>

              <button
                onClick={() => {
                  onGesture('standing_chat', 4.0);
                  onClose();
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-xl text-left cursor-pointer transition-all"
              >
                <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-teal-400" />
                  <span>Romantic Gaze</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Face-to-face deep gaze together
                </p>
              </button>
            </div>
          )}

          {activeTab === 'banter' && (
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  onTalk();
                  onClose();
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 p-3 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Talk &amp; Compliment (English Spoken)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ask about her thoughts on the weather and city
                  </p>
                </div>
                <span className="text-xs text-amber-400 font-bold">[F]</span>
              </button>

              {/* Physical Banter: Slap & Kick */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    onGesture('playful_slap', 1.5);
                    onClose();
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 p-3 rounded-xl text-left cursor-pointer transition-all"
                >
                  <div className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                    <Hand className="w-3.5 h-3.5" />
                    <span>Slap Reaction</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Physical slap with voice retort &amp; flinch
                  </p>
                </button>

                <button
                  onClick={() => {
                    onGesture('roundhouse_kick', 1.6);
                    onClose();
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 p-3 rounded-xl text-left cursor-pointer transition-all"
                >
                  <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Martial Kick</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Spinning kick with knockback step
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Ride-Along Companion Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onToggleCompanion();
                onClose();
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                isCompanion
                  ? 'bg-red-950/70 text-red-300 border border-red-800 hover:bg-red-900/80'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
              }`}
            >
              {isCompanion ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  <span>Dismiss Companion from Passenger Seat</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Invite to Ride Along (Passenger Seat)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

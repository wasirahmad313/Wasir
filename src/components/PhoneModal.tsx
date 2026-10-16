import React, { useState } from 'react';
import { FemaleCharacterData, WeatherType } from '../game/types';
import { 
  X, 
  Phone, 
  Camera, 
  CloudSun, 
  Car, 
  Wrench, 
  Sparkles, 
  Upload, 
  Send, 
  Loader2,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';
import { sound } from '../game/audio';

interface PhoneModalProps {
  characters: FemaleCharacterData[];
  currentWeather: WeatherType;
  onClose: () => void;
  onCallCharacter: (char: FemaleCharacterData) => void;
  onChangeWeather: (w: WeatherType) => void;
  onSpawnVehicle: (type: 'apex' | 'muscle' | 'moto') => void;
  onRepairCity: () => void;
  onCaptureScreenshot: () => string; // returns base64
}

export const PhoneModal: React.FC<PhoneModalProps> = ({
  characters,
  currentWeather,
  onClose,
  onCallCharacter,
  onChangeWeather,
  onSpawnVehicle,
  onRepairCity,
  onCaptureScreenshot,
}) => {
  const [activeApp, setActiveApp] = useState<'home' | 'contacts' | 'camera' | 'weather' | 'valet'>('home');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const takeSnapshot = () => {
    try {
      const b64 = onCaptureScreenshot();
      setCapturedImage(b64);
      setAiResult(null);
      setGeneratedImage(null);
      sound.playClick();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      setAiResult(null);
      setGeneratedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;
    setIsLoadingAi(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage,
          prompt: aiPrompt || 'Analyze this in-game photo from Vice City. Describe Leo and companions, the vehicle, weather, and give a roleplay rating.',
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiResult(data.analysis);
      } else {
        setAiResult(data.error || 'No analysis returned');
      }
    } catch (err: any) {
      setAiResult(err?.message || 'Failed to connect to image analysis API');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const generateImageArt = async () => {
    if (!aiPrompt) return;
    setIsLoadingAi(true);
    setGeneratedImage(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          baseImageBase64: capturedImage || undefined,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setAiResult(data.error || 'No image returned');
      }
    } catch (err: any) {
      setAiResult(err?.message || 'Failed to generate image');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 pointer-events-auto">
      {/* Smartphone Frame */}
      <div className="relative w-[340px] h-[640px] bg-slate-950 border-4 border-slate-700 rounded-[44px] shadow-2xl overflow-hidden flex flex-col p-2 text-slate-100 ring-1 ring-white/10">
        {/* Dynamic Island / Speaker Notch */}
        <div className="w-24 h-5 bg-slate-900 rounded-full mx-auto my-1 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-800" />
          <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800" />
        </div>

        {/* Screen Area */}
        <div className="flex-1 bg-slate-900 rounded-[32px] overflow-hidden flex flex-col relative border border-slate-800">
          {/* Top Status Bar */}
          <div className="flex justify-between items-center px-4 py-1.5 text-[10px] text-slate-400 font-mono">
            <span>VICE-OS 5.2</span>
            <span>LTE 5G • 100%</span>
          </div>

          {/* Toast Notification */}
          {statusMessage && (
            <div className="absolute top-8 left-3 right-3 bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs px-3 py-2 rounded-xl z-20 shadow-lg flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* 1. HOME SCREEN */}
          {activeApp === 'home' && (
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <div className="text-center my-4">
                  <div className="text-3xl font-black font-mono tracking-tighter text-white">
                    12:45
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Vice City Marina • {currentWeather.toUpperCase()}
                  </div>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <button
                    onClick={() => setActiveApp('contacts')}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Phone className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200">Contacts</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveApp('camera');
                      takeSnapshot();
                    }}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200">Snapmatic</span>
                  </button>

                  <button
                    onClick={() => setActiveApp('weather')}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <CloudSun className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200">Weather</span>
                  </button>

                  <button
                    onClick={() => setActiveApp('valet')}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Car className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200">Valet Cars</span>
                  </button>

                  <button
                    onClick={() => {
                      onRepairCity();
                      showToast('Street props & barriers repaired!');
                    }}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200">City Repair</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">
                  Leo's Nexus Phone • Press Close or ESC to return
                </span>
              </div>
            </div>
          )}

          {/* 2. CONTACTS APP */}
          {activeApp === 'contacts' && (
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-sm text-pink-400 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>Contacts ({characters.length})</span>
                </h4>
                <button
                  onClick={() => setActiveApp('home')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 py-3">
                {characters.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: c.avatarColor }}
                      >
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.title}</div>
                        <div className="text-[10px] text-pink-400 font-mono">
                          {c.affection}% Affection
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onCallCharacter(c);
                        showToast(`Calling ${c.name}...`);
                      }}
                      className="p-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white cursor-pointer shadow"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SNAPMATIC CAMERA & AI PHOTO MODE */}
          {activeApp === 'camera' && (
            <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snapmatic Photo AI</span>
                </h4>
                <button
                  onClick={() => setActiveApp('home')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
              </div>

              {/* Viewfinder Preview */}
              <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured Scene"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-500">Tap Snap to capture 3D view</span>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <button
                  onClick={takeSnapshot}
                  className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snap Photo</span>
                </button>

                <label className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Prompt Input */}
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Ask Gemini to analyze photo or prompt artwork..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500"
                />

                <div className="flex gap-2">
                  <button
                    onClick={analyzeImage}
                    disabled={isLoadingAi || !capturedImage}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isLoadingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>Analyze (gemini-4-argon)</span>
                  </button>

                  <button
                    onClick={generateImageArt}
                    disabled={isLoadingAi || !aiPrompt}
                    className="flex-1 py-1.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isLoadingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>Generate Artwork</span>
                  </button>
                </div>
              </div>

              {/* AI Response Output */}
              {aiResult && (
                <div className="bg-slate-950 border border-indigo-500/40 p-2.5 rounded-xl text-xs text-slate-200 max-h-36 overflow-y-auto leading-relaxed">
                  <span className="font-bold text-indigo-400 block mb-1">Gemini AI Critique:</span>
                  {aiResult}
                </div>
              )}

              {/* Generated Image Preview */}
              {generatedImage && (
                <div className="space-y-1">
                  <span className="text-[10px] text-pink-400 font-bold block">Generated Artwork:</span>
                  <img
                    src={generatedImage}
                    alt="Generated Artwork"
                    className="w-full rounded-xl border border-pink-500/50"
                  />
                </div>
              )}
            </div>
          )}

          {/* 4. WEATHER CONTROLLER */}
          {activeApp === 'weather' && (
            <div className="flex-1 flex flex-col p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5" />
                  <span>Weather Radar</span>
                </h4>
                <button
                  onClick={() => setActiveApp('home')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
              </div>

              <div className="text-center py-2 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 uppercase">Current Weather</span>
                <div className="text-lg font-black text-amber-300 capitalize mt-0.5">
                  {currentWeather}
                </div>
              </div>

              <div className="space-y-2">
                {(['sunny', 'sunset', 'storm', 'fog', 'midnight'] as WeatherType[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      onChangeWeather(w);
                      showToast(`Weather switched to ${w}`);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold capitalize flex items-center justify-between cursor-pointer border transition-colors ${
                      currentWeather === w
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{w}</span>
                    {currentWeather === w && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. VALET CAR DELIVERY */}
          {activeApp === 'valet' && (
            <div className="flex-1 flex flex-col p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" />
                  <span>Apex Valet Service</span>
                </h4>
                <button
                  onClick={() => setActiveApp('home')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Request instant delivery of high-performance vehicles to your position:
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    onSpawnVehicle('apex');
                    showToast('Apex GT Hypercar delivered!');
                  }}
                  className="w-full bg-slate-950/90 border border-red-500/40 hover:border-red-500 p-3 rounded-xl text-left cursor-pointer transition-colors"
                >
                  <div className="text-xs font-bold text-red-400">Apex GT Hypercar</div>
                  <div className="text-[10px] text-slate-400">Top Speed: 145 MPH • Sharp Aero Downforce</div>
                </button>

                <button
                  onClick={() => {
                    onSpawnVehicle('muscle');
                    showToast('V8 Stallion Muscle Car delivered!');
                  }}
                  className="w-full bg-slate-950/90 border border-amber-500/40 hover:border-amber-500 p-3 rounded-xl text-left cursor-pointer transition-colors"
                >
                  <div className="text-xs font-bold text-amber-400">V8 Stallion Muscle</div>
                  <div className="text-[10px] text-slate-400">High Torque • Drift Burnout Specialist</div>
                </button>

                <button
                  onClick={() => {
                    onSpawnVehicle('moto');
                    showToast('Phantom Cafe Racer delivered!');
                  }}
                  className="w-full bg-slate-950/90 border border-blue-500/40 hover:border-blue-500 p-3 rounded-xl text-left cursor-pointer transition-colors"
                >
                  <div className="text-xs font-bold text-blue-400">Phantom Cafe Racer Moto</div>
                  <div className="text-[10px] text-slate-400">Agile Motorcycle • Extreme Cornering Lean</div>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Virtual Home Button */}
          <div className="h-7 bg-slate-950 flex items-center justify-center border-t border-slate-800">
            <button
              onClick={() => setActiveApp('home')}
              className="w-24 h-1 bg-slate-600 hover:bg-slate-400 rounded-full cursor-pointer transition-colors"
            />
          </div>
        </div>

        {/* Close Phone X */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center justify-center cursor-pointer shadow-xl"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, InteractionPrompt } from './game/Engine';
import { HUD } from './components/HUD';
import { SocialInteractionModal } from './components/SocialInteractionModal';
import { PhoneModal } from './components/PhoneModal';
import { BottomControlDock } from './components/BottomControlDock';
import { OnscreenTouchControls } from './components/OnscreenTouchControls';
import { FemaleCharacterData, WeatherType, GameStats, GesturePosition } from './game/types';
import { sound } from './game/audio';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // React UI state
  const [stats, setStats] = useState<GameStats>({
    money: 25000,
    respect: 85,
    wantedLevel: 0,
    stuntsPerformed: 0,
    propsDestroyed: 0,
    kissesCompleted: 0,
    longestKissSeconds: 0,
  });

  const [currentWeather, setCurrentWeather] = useState<WeatherType>('sunny');
  const [inVehicle, setInVehicle] = useState(false);
  const [vehicleSpeed, setVehicleSpeed] = useState(0);
  const [playerPos, setPlayerPos] = useState<[number, number]>([0, 5]);
  const [playerHeading, setPlayerHeading] = useState(0);
  const [cameraMode, setCameraMode] = useState<string>('third_person');

  const [femaleCharacters, setFemaleCharacters] = useState<FemaleCharacterData[]>([]);
  const [activeCompanion, setActiveCompanion] = useState<FemaleCharacterData | null>(null);
  const [interactionPrompt, setInteractionPrompt] = useState<InteractionPrompt | null>(null);
  
  // Modals
  const [activeSocialChar, setActiveSocialChar] = useState<FemaleCharacterData | null>(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);

  // Subtitles & Long Kiss
  const [subtitle, setSubtitle] = useState<{ speaker: string; text: string } | null>(null);
  const [longKissProgress, setLongKissProgress] = useState<{ duration: number; tier: string } | null>(null);

  // Initialize Three.js GameEngine once
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current);
    engineRef.current = engine;

    setFemaleCharacters([...engine.social.characters]);

    // Engine Event Hooks
    engine.onPromptChange = (prompt) => {
      setInteractionPrompt(prompt);
    };

    engine.onStatsChange = (newStats) => {
      setStats({ ...newStats });
    };

    engine.onWeatherChange = (w) => {
      setCurrentWeather(w);
    };

    engine.onLongKissProgress = (duration, tier) => {
      if (duration > 0.1) {
        setLongKissProgress({ duration, tier });
      } else {
        setLongKissProgress(null);
      }
    };

    // Fast polling for HUD coordinates & speed (10 FPS)
    const hudInterval = setInterval(() => {
      if (engineRef.current) {
        const eng = engineRef.current;
        setPlayerPos([eng.playerPos.x, eng.playerPos.z]);
        setPlayerHeading(eng.playerHeading);
        setInVehicle(eng.inVehicle);
        if (eng.vehicles.currentVehicle) {
          setVehicleSpeed(eng.vehicles.currentVehicle.speed);
        } else {
          setVehicleSpeed(0);
        }
        setCameraMode(eng.cameraMode);
        setCurrentWeather(eng.weather.currentWeather);
        setActiveCompanion(eng.social.activeCompanion);

        if (eng.social.lastSpokenLine) {
          const now = Date.now();
          if (now - eng.social.lastSpokenLine.time < 6000) {
            setSubtitle({
              speaker: eng.social.lastSpokenLine.speaker,
              text: eng.social.lastSpokenLine.text,
            });
          } else {
            setSubtitle(null);
          }
        }
      }
    }, 100);

    return () => {
      clearInterval(hudInterval);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Handlers
  const handleOpenInteraction = (char: FemaleCharacterData) => {
    setActiveSocialChar(char);
    sound.playClick();
  };

  const handleCloseInteraction = () => {
    setActiveSocialChar(null);
  };

  const handleTalk = () => {
    if (!engineRef.current || !activeSocialChar) return;
    engineRef.current.social.triggerDialogue(activeSocialChar, currentWeather);
    setFemaleCharacters([...engineRef.current.social.characters]);
  };

  const handleGesture = (gesture: GesturePosition, duration = 3.0) => {
    if (!engineRef.current || !activeSocialChar) return;
    engineRef.current.playDuoGesture(activeSocialChar, gesture, duration);

    if (gesture === 'warm_hug') {
      engineRef.current.social.triggerHug(activeSocialChar, false);
    } else if (gesture === 'deep_hug') {
      engineRef.current.social.triggerHug(activeSocialChar, true);
    } else if (gesture === 'gentle_kiss') {
      engineRef.current.social.triggerGentleKiss(activeSocialChar);
    } else if (gesture === 'slow_dance') {
      engineRef.current.social.triggerDance(activeSocialChar);
    } else if (gesture === 'playful_slap') {
      engineRef.current.social.triggerSlap(activeSocialChar);
    } else if (gesture === 'roundhouse_kick') {
      engineRef.current.social.triggerKick(activeSocialChar);
    }

    setFemaleCharacters([...engineRef.current.social.characters]);
  };

  const handleStartHoldKiss = () => {
    if (!engineRef.current || !activeSocialChar) return;
    engineRef.current.startHoldLongKiss(activeSocialChar);
  };

  const handleEndHoldKiss = () => {
    if (!engineRef.current || !activeSocialChar) return;
    const dur = engineRef.current.endHoldLongKiss(activeSocialChar);
    setLongKissProgress(null);
    setFemaleCharacters([...engineRef.current.social.characters]);
  };

  const handleToggleCompanion = () => {
    if (!engineRef.current || !activeSocialChar) return;
    engineRef.current.social.toggleCompanionRide(activeSocialChar);
    setActiveCompanion(engineRef.current.social.activeCompanion);
    setFemaleCharacters([...engineRef.current.social.characters]);
  };

  const handleChangeWeather = (w: WeatherType) => {
    if (!engineRef.current) return;
    engineRef.current.weather.applyWeather(w);
    setCurrentWeather(w);
  };

  const handleSpawnVehicle = (type: 'apex' | 'muscle' | 'moto') => {
    if (!engineRef.current) return;
    const eng = engineRef.current;
    const spawnX = eng.playerPos.x + Math.sin(eng.playerHeading) * 4;
    const spawnZ = eng.playerPos.z + Math.cos(eng.playerHeading) * 4;

    if (type === 'apex') {
      eng.vehicles.spawnSupercar(spawnX, spawnZ, eng.playerHeading);
    } else if (type === 'muscle') {
      eng.vehicles.spawnMuscleCar(spawnX, spawnZ, eng.playerHeading);
    } else {
      eng.vehicles.spawnMotorcycle(spawnX, spawnZ, eng.playerHeading);
    }
    sound.playClick();
  };

  const handleTeleportToCharacter = (char: FemaleCharacterData) => {
    if (!engineRef.current) return;
    const rig = engineRef.current.femaleRigs.get(char.id);
    if (rig) {
      engineRef.current.playerPos.copy(rig.root.position);
      engineRef.current.playerPos.z += 2;
      engineRef.current.maleRig.root.position.copy(engineRef.current.playerPos);
      sound.playClick();
    }
  };

  const handleRepairCity = () => {
    if (!engineRef.current) return;
    engineRef.current.destructibles.resetAll();
    engineRef.current.stats.propsDestroyed = 0;
    engineRef.current.stats.wantedLevel = 0;
    setStats({ ...engineRef.current.stats });
    sound.playClick();
  };

  const handleCaptureScreenshot = (): string => {
    if (!engineRef.current) return '';
    return engineRef.current.renderer.domElement.toDataURL('image/jpeg', 0.9);
  };

  const handleTouchInput = (action: string, active: boolean) => {
    if (!engineRef.current) return;
    const eng = engineRef.current;
    if (action === 'forward') eng.inputs.forward = active;
    if (action === 'backward') eng.inputs.backward = active;
    if (action === 'left') eng.inputs.left = active;
    if (action === 'right') eng.inputs.right = active;
    if (action === 'sprint') eng.inputs.sprint = active;
    if (action === 'handbrake') eng.inputs.handbrake = active;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Isolated 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 2. Top & Radar HUD */}
      <HUD
        stats={stats}
        currentWeather={currentWeather}
        inVehicle={inVehicle}
        vehicleSpeed={vehicleSpeed}
        playerPos={playerPos}
        playerHeading={playerHeading}
        femaleCharacters={femaleCharacters}
        activeCompanion={activeCompanion}
        interactionPrompt={interactionPrompt}
        onOpenInteraction={handleOpenInteraction}
        onOpenPhone={() => setIsPhoneOpen(true)}
        subtitle={subtitle}
        longKissProgress={longKissProgress}
      />

      {/* 3. Social Interaction Roleplay Modal */}
      {activeSocialChar && (
        <SocialInteractionModal
          character={activeSocialChar}
          weather={currentWeather}
          isCompanion={activeCompanion?.id === activeSocialChar.id}
          onClose={handleCloseInteraction}
          onTalk={handleTalk}
          onGesture={handleGesture}
          onStartHoldKiss={handleStartHoldKiss}
          onEndHoldKiss={handleEndHoldKiss}
          onToggleCompanion={handleToggleCompanion}
        />
      )}

      {/* 4. In-Game Smartphone (Snapmatic AI Camera, Valet, Contacts) */}
      {isPhoneOpen && (
        <PhoneModal
          characters={femaleCharacters}
          currentWeather={currentWeather}
          onClose={() => setIsPhoneOpen(false)}
          onCallCharacter={(c) => {
            if (engineRef.current) {
              engineRef.current.social.triggerDialogue(c, currentWeather);
            }
          }}
          onChangeWeather={handleChangeWeather}
          onSpawnVehicle={handleSpawnVehicle}
          onRepairCity={handleRepairCity}
          onCaptureScreenshot={handleCaptureScreenshot}
        />
      )}

      {/* 5. On-Screen Virtual Controls for Touch / Mobile */}
      <OnscreenTouchControls
        inVehicle={inVehicle}
        onInput={handleTouchInput}
        onEnterExitVehicle={() => engineRef.current?.toggleVehicleEnterExit()}
        onInteract={() => {
          if (interactionPrompt) {
            handleOpenInteraction(interactionPrompt.character);
          } else {
            const nearest = engineRef.current?.triggerNearestInteraction();
            if (nearest) handleOpenInteraction(nearest);
          }
        }}
        onSlap={() => engineRef.current?.triggerQuickSlap()}
        onKick={() => engineRef.current?.triggerQuickKick()}
        canInteract={!!interactionPrompt}
      />

      {/* 6. Collapsible Bottom Control Dock */}
      <BottomControlDock
        currentWeather={currentWeather}
        onChangeWeather={handleChangeWeather}
        onSpawnVehicle={handleSpawnVehicle}
        onOpenPhone={() => setIsPhoneOpen(true)}
        onCycleCamera={() => engineRef.current?.cycleCamera()}
        cameraMode={cameraMode}
        characters={femaleCharacters}
        onTeleportToCharacter={handleTeleportToCharacter}
        onRepairCity={handleRepairCity}
      />
    </div>
  );
}

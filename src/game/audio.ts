/**
 * Audio Synthesizer & English Speech Engine (Zero 404 Dependencies)
 * Fully procedural Web Audio API sounds + Web Speech API voice acting
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private rainNode: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private initialized: boolean = false;

  public init() {
    if (this.initialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.initialized = true;
    } catch {
      console.warn('Web Audio API not supported in this browser context.');
    }
  }

  public ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.engineGain) {
      this.engineGain.gain.value = this.isMuted ? 0 : 0.08;
    }
    if (this.rainGain) {
      this.rainGain.gain.value = this.isMuted ? 0 : 0.05;
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Continuous engine rumble sound based on vehicle speed
   */
  public updateEngineSound(inCar: boolean, speedRatio: number) {
    if (!this.ctx || this.isMuted) return;

    if (!inCar) {
      if (this.engineGain) {
        this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      }
      return;
    }

    if (!this.engineOsc) {
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    }

    const baseFreq = 50 + speedRatio * 180;
    this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.05);
    if (this.engineGain) {
      this.engineGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.07 + speedRatio * 0.05, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Tire screeching during sharp drifts / burnouts
   */
  public playTireDrift() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  /**
   * Heavy car / environmental crash
   */
  public playCrashImpact(intensity = 1.0) {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 * intensity, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.35);

    const gain = this.ctx.createGain();
    const vol = Math.min(0.25, 0.12 * intensity);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    // Crunch noise
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18 * intensity, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.start();
    noise.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  /**
   * Slap impact (sharp high snap)
   */
  public playSlapSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  /**
   * Kick impact (deep forceful thump)
   */
  public playKickSound() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  /**
   * Romantic chords & chimes for hugging, kissing, and kissing milestones
   */
  public playRomanticChime(tier: 'soft' | 'deep' | 'milestone') {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();

    const freqs = tier === 'soft' 
      ? [523.25, 659.25, 783.99] // C5, E5, G5
      : tier === 'deep'
      ? [440, 554.37, 659.25, 830.61] // A4, C#5, E5, G#5 (romantic major 7th)
      : [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6 (triumphant romance)

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 1.3);
    });
  }

  /**
   * Thunder rumble during storm
   */
  public playThunder() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 1.8);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 2.1);
  }

  /**
   * Rain loop sound
   */
  public setRainActive(active: boolean) {
    if (!this.ctx) return;
    if (!active) {
      if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      }
      return;
    }
    if (!this.rainNode) {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.05;
      }
      this.rainNode = this.ctx.createBufferSource();
      this.rainNode.buffer = buffer;
      this.rainNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06, this.ctx.currentTime);

      this.rainNode.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.ctx.destination);
      this.rainNode.start();
    } else if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.06, this.ctx.currentTime, 0.5);
    }
  }

  /**
   * UI Click sound
   */
  public playClick() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }
}

export const sound = new SoundSystem();

/**
 * Spoken English voice synthesizer using browser speech synthesis
 */
export function speakEnglishLine(
  text: string, 
  characterName: string, 
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));

    // Tailor pitch and rate to character personality
    if (characterName === 'Elena') {
      utterance.pitch = 1.15;
      utterance.rate = 1.05;
    } else if (characterName === 'Scarlett') {
      utterance.pitch = 0.95;
      utterance.rate = 0.92;
    } else if (characterName === 'Maya') {
      utterance.pitch = 1.3;
      utterance.rate = 1.12;
    } else if (characterName === 'Chloe') {
      utterance.pitch = 1.1;
      utterance.rate = 0.98;
    } else if (characterName === 'Leo') {
      utterance.pitch = 0.85;
      utterance.rate = 1.0;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    // Pick female voice if available and NPC is female
    if (characterName !== 'Leo' && englishVoices.length > 0) {
      const femaleCandidate = englishVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('samantha') || 
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('victoria') ||
        v.name.toLowerCase().includes('karen')
      );
      if (femaleCandidate) {
        utterance.voice = femaleCandidate;
      }
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    if (onEnd) onEnd();
  }
}

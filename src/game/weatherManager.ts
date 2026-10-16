import * as THREE from 'three';
import { WeatherType } from './types';
import { GameMaterials } from './materials';
import { sound } from './audio';

export class WeatherManager {
  public currentWeather: WeatherType = 'sunny';
  private scene: THREE.Scene;
  private materials: GameMaterials;
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rainParticles: THREE.Points | null = null;
  private starsParticles: THREE.Points | null = null;
  private rainCount = 1800;
  private cycleTimer = 0;
  private autoCycle = true;
  private lightningTimer = 0;
  private isLightningFlash = false;

  constructor(
    scene: THREE.Scene,
    materials: GameMaterials,
    dirLight: THREE.DirectionalLight,
    hemiLight: THREE.HemisphereLight
  ) {
    this.scene = scene;
    this.materials = materials;
    this.dirLight = dirLight;
    this.hemiLight = hemiLight;

    this.initRainSystem();
    this.initStarsSystem();
    this.applyWeather('sunny');
  }

  private initRainSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });

    this.rainParticles = new THREE.Points(geo, mat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  private initStarsSystem() {
    const starCount = 600;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 250;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 15; // Upper dome
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    this.starsParticles = new THREE.Points(geo, mat);
    this.starsParticles.visible = false;
    this.scene.add(this.starsParticles);
  }

  public setAutoCycle(enabled: boolean) {
    this.autoCycle = enabled;
  }

  public applyWeather(type: WeatherType) {
    this.currentWeather = type;

    if (type === 'sunny') {
      this.scene.background = new THREE.Color(0x38bdf8); // Sky blue
      this.scene.fog = new THREE.Fog(0x38bdf8, 50, 220);
      this.dirLight.color.setHex(0xfffaed);
      this.dirLight.intensity = 1.6;
      this.dirLight.position.set(40, 60, 30);
      this.hemiLight.color.setHex(0xb0e0e6);
      this.hemiLight.groundColor.setHex(0x556b2f);
      this.hemiLight.intensity = 0.8;
      if (this.rainParticles) this.rainParticles.visible = false;
      if (this.starsParticles) this.starsParticles.visible = false;
      this.materials.setWetRoad(false);
      sound.setRainActive(false);

    } else if (type === 'sunset') {
      this.scene.background = new THREE.Color(0xf97316); // Golden orange
      this.scene.fog = new THREE.Fog(0xf43f5e, 40, 180);
      this.dirLight.color.setHex(0xff8844);
      this.dirLight.intensity = 1.4;
      this.dirLight.position.set(-60, 20, 40);
      this.hemiLight.color.setHex(0xfb923c);
      this.hemiLight.groundColor.setHex(0x7c2d12);
      this.hemiLight.intensity = 0.6;
      if (this.rainParticles) this.rainParticles.visible = false;
      if (this.starsParticles) this.starsParticles.visible = false;
      this.materials.setWetRoad(false);
      sound.setRainActive(false);

    } else if (type === 'storm') {
      this.scene.background = new THREE.Color(0x1e293b); // Slate dark
      this.scene.fog = new THREE.Fog(0x334155, 20, 120);
      this.dirLight.color.setHex(0x64748b);
      this.dirLight.intensity = 0.6;
      this.dirLight.position.set(10, 40, 10);
      this.hemiLight.color.setHex(0x475569);
      this.hemiLight.groundColor.setHex(0x0f172a);
      this.hemiLight.intensity = 0.4;
      if (this.rainParticles) this.rainParticles.visible = true;
      if (this.starsParticles) this.starsParticles.visible = false;
      this.materials.setWetRoad(true);
      sound.setRainActive(true);

    } else if (type === 'fog') {
      this.scene.background = new THREE.Color(0x94a3b8);
      this.scene.fog = new THREE.Fog(0x94a3b8, 10, 80);
      this.dirLight.color.setHex(0xcfd8dc);
      this.dirLight.intensity = 0.7;
      this.dirLight.position.set(0, 50, 0);
      this.hemiLight.color.setHex(0x94a3b8);
      this.hemiLight.groundColor.setHex(0x334155);
      this.hemiLight.intensity = 0.6;
      if (this.rainParticles) this.rainParticles.visible = false;
      if (this.starsParticles) this.starsParticles.visible = false;
      this.materials.setWetRoad(true);
      sound.setRainActive(false);

    } else if (type === 'midnight') {
      this.scene.background = new THREE.Color(0x030712); // Midnight black
      this.scene.fog = new THREE.Fog(0x090d16, 30, 160);
      this.dirLight.color.setHex(0x3b82f6); // Moonlight tint
      this.dirLight.intensity = 0.35;
      this.dirLight.position.set(20, 50, -30);
      this.hemiLight.color.setHex(0x1e1b4b);
      this.hemiLight.groundColor.setHex(0x020617);
      this.hemiLight.intensity = 0.3;
      if (this.rainParticles) this.rainParticles.visible = false;
      if (this.starsParticles) this.starsParticles.visible = true;
      this.materials.setWetRoad(false);
      sound.setRainActive(false);
    }
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    // 1. Auto cycle timer
    if (this.autoCycle) {
      this.cycleTimer += delta;
      if (this.cycleTimer > 60) {
        // cycle to next weather every 60 seconds
        this.cycleTimer = 0;
        const list: WeatherType[] = ['sunny', 'sunset', 'midnight', 'storm', 'fog'];
        const currentIdx = list.indexOf(this.currentWeather);
        const next = list[(currentIdx + 1) % list.length];
        this.applyWeather(next);
      }
    }

    // 2. Storm Rain & Lightning Simulation
    if (this.currentWeather === 'storm') {
      if (this.rainParticles) {
        this.rainParticles.position.x = playerPos.x;
        this.rainParticles.position.z = playerPos.z;

        const positions = this.rainParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < this.rainCount; i++) {
          positions[i * 3 + 1] -= 38 * delta; // Downward velocity
          positions[i * 3] += 8 * delta; // Slanted wind
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 35 + Math.random() * 5;
            positions[i * 3] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
          }
        }
        this.rainParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Lightning flash
      this.lightningTimer += delta;
      if (this.lightningTimer > 8 + Math.random() * 10) {
        this.lightningTimer = 0;
        this.isLightningFlash = true;
        this.dirLight.intensity = 4.5;
        this.dirLight.color.setHex(0xe0f2fe);
        sound.playThunder();

        setTimeout(() => {
          if (this.currentWeather === 'storm') {
            this.dirLight.intensity = 0.6;
            this.dirLight.color.setHex(0x64748b);
            this.isLightningFlash = false;
          }
        }, 120);
      }
    }
  }
}

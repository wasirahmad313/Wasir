import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GameMaterials } from './materials';
import { DestructibleManager } from './destructibles';
import { CityBuilder } from './cityBuilder';
import { WeatherManager } from './weatherManager';
import { VehiclePhysicsSystem, VehicleInstance } from './vehiclePhysics';
import { 
  CharacterRig, 
  createMaleHero, 
  createFemaleNPC, 
  animateRig, 
  applyDuoGesture 
} from './characterModels';
import { SocialSystem } from './socialSystem';
import { FemaleCharacterData, GesturePosition, WeatherType, GameStats } from './types';
import { sound } from './audio';

export interface InteractionPrompt {
  character: FemaleCharacterData;
  distance: number;
}

export class GameEngine {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // Systems
  public materials: GameMaterials;
  public destructibles: DestructibleManager;
  public city: CityBuilder;
  public weather: WeatherManager;
  public vehicles: VehiclePhysicsSystem;
  public social: SocialSystem;

  // Characters
  public maleRig: CharacterRig;
  public femaleRigs: Map<string, CharacterRig> = new Map();

  // State
  public stats: GameStats = {
    money: 25000,
    respect: 85,
    wantedLevel: 0,
    stuntsPerformed: 0,
    propsDestroyed: 0,
    kissesCompleted: 0,
    longestKissSeconds: 0,
  };

  public playerPos = new THREE.Vector3(0, 0, 5);
  public playerHeading = 0; // Radians
  public inVehicle = false;
  public activeInteractionChar: FemaleCharacterData | null = null;
  public activeGesture: GesturePosition | null = null;
  public gestureTimer = 0;
  public gestureTimeLimit = 0;

  // Long Kiss holding state
  public isHoldingLongKiss = false;

  // Camera settings
  public cameraMode: 'third_person' | 'vehicle' | 'cinematic' | 'first_person' = 'third_person';
  public cameraTarget = new THREE.Vector3();
  public cameraOffset = new THREE.Vector3(0, 2.5, -4.5);
  public cameraAngleX = 0;
  public cameraAngleY = 0.2;

  // Inputs
  public inputs = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    handbrake: false,
    action: false,
  };

  // Callbacks for UI updates
  public onPromptChange?: (prompt: InteractionPrompt | null) => void;
  public onStatsChange?: (stats: GameStats) => void;
  public onWeatherChange?: (w: WeatherType) => void;
  public onLongKissProgress?: (duration: number, tier: string) => void;

  private clock = new THREE.Clock();
  private animationFrameId = 0;
  private isDisposed = false;
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private heartParticles: THREE.Points | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene & Renderer setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    this.renderer = new THREE.WebGLRenderer({ antialias: !isHeadless, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 2. Studio Environment Reflection (RoomEnvironment)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 3. Lighting Rig
    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.6);
    this.dirLight.position.set(40, 60, 30);
    this.dirLight.castShadow = !isHeadless;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 250;
    const d = 45;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight);

    this.hemiLight = new THREE.HemisphereLight(0xb0e0e6, 0x556b2f, 0.8);
    this.scene.add(this.hemiLight);

    // 4. Initialize Core Systems
    this.materials = new GameMaterials();
    this.destructibles = new DestructibleManager(this.scene, this.materials);
    this.city = new CityBuilder(this.scene, this.materials, this.destructibles);
    this.weather = new WeatherManager(this.scene, this.materials, this.dirLight, this.hemiLight);
    this.vehicles = new VehiclePhysicsSystem(this.scene, this.materials, this.destructibles);
    this.social = new SocialSystem();

    // 5. Build Environment
    this.city.buildWorld();

    // 6. Spawn Vehicles
    const apexCar = this.vehicles.spawnSupercar(3, 8, Math.PI);
    this.vehicles.spawnMuscleCar(-5, -30, 0);
    this.vehicles.spawnMotorcycle(8, -25, Math.PI / 2);

    // 7. Spawn Characters
    // Male Hero Leo
    this.maleRig = createMaleHero();
    this.maleRig.root.position.copy(this.playerPos);
    this.scene.add(this.maleRig.root);

    // Spawn 4 Female NPCs
    this.social.characters.forEach((char) => {
      let style: 'racer' | 'socialite' | 'cyber' | 'coastal' = 'racer';
      if (char.id === 'scarlett') style = 'socialite';
      if (char.id === 'maya') style = 'cyber';
      if (char.id === 'chloe') style = 'coastal';

      const rig = createFemaleNPC(char.id, char.hairColor, char.outfitColor, style);
      rig.root.position.set(char.position[0], char.position[1], char.position[2]);
      rig.root.rotation.y = char.rotationY;
      this.scene.add(rig.root);
      this.femaleRigs.set(char.id, rig);
    });

    // 8. Romance Heart Sparkle System
    this.initRomanceParticles();

    // 9. Input and resize listeners
    this.setupListeners();

    // 10. Start Game Loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private initRomanceParticles() {
    const count = 120;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = Math.random() * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xff3388,
      size: 0.18,
      transparent: true,
      opacity: 0.9,
    });
    this.heartParticles = new THREE.Points(geo, mat);
    this.heartParticles.visible = false;
    this.scene.add(this.heartParticles);
  }

  private setupListeners() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.container.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private isDragging = false;
  private prevMouseX = 0;
  private prevMouseY = 0;

  private onMouseDown = (e: MouseEvent) => {
    sound.ensureContext();
    this.isDragging = true;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;
    const dx = e.clientX - this.prevMouseX;
    const dy = e.clientY - this.prevMouseY;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;

    this.cameraAngleX -= dx * 0.005;
    this.cameraAngleY = Math.max(-0.2, Math.min(1.2, this.cameraAngleY + dy * 0.005));
  };

  private onMouseUp = () => {
    this.isDragging = false;
  };

  private onResize = () => {
    if (this.isDisposed || !this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    sound.ensureContext();
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.inputs.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.inputs.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.inputs.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.inputs.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.inputs.sprint = true;
        break;
      case 'Space':
        this.inputs.handbrake = true;
        break;
      case 'KeyE':
        this.toggleVehicleEnterExit();
        break;
      case 'KeyF':
        this.triggerNearestInteraction();
        break;
      case 'KeyG':
        this.triggerQuickSlap();
        break;
      case 'KeyK':
        this.triggerQuickKick();
        break;
      case 'KeyC':
        this.cycleCamera();
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.inputs.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.inputs.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.inputs.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.inputs.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.inputs.sprint = false;
        break;
      case 'Space':
        this.inputs.handbrake = false;
        break;
    }
  };

  public toggleVehicleEnterExit() {
    if (this.inVehicle && this.vehicles.currentVehicle) {
      // Exit vehicle
      const v = this.vehicles.currentVehicle;
      this.inVehicle = false;
      this.playerPos.copy(v.pos);
      this.playerPos.x += Math.cos(v.heading) * 1.8; // step out to side
      this.maleRig.root.visible = true;
      this.maleRig.root.position.copy(this.playerPos);
      this.vehicles.currentVehicle = null;
      sound.updateEngineSound(false, 0);
    } else {
      // Find nearest vehicle
      let nearest: VehicleInstance | null = null;
      let minD = 4.5;
      for (const v of this.vehicles.vehicles) {
        const d = this.playerPos.distanceTo(v.pos);
        if (d < minD) {
          minD = d;
          nearest = v;
        }
      }

      if (nearest) {
        this.inVehicle = true;
        this.vehicles.currentVehicle = nearest;
        this.maleRig.root.visible = false; // Sitting in cockpit
        sound.playClick();

        // If companion is following/active, put her in passenger seat!
        if (this.social.activeCompanion) {
          const companionRig = this.femaleRigs.get(this.social.activeCompanion.id);
          if (companionRig) {
            companionRig.root.visible = false; // Riding inside
          }
          const comment = this.social.activeCompanion.quotes.passengerComment[0];
          this.social.speak(this.social.activeCompanion.name, comment);
        }
      }
    }
  }

  public triggerNearestInteraction(): FemaleCharacterData | null {
    if (this.inVehicle) return null;
    const target = this.getNearestCharacter(3.5);
    if (target) {
      this.activeInteractionChar = target;
      return target;
    }
    return null;
  }

  public triggerQuickSlap() {
    const target = this.getNearestCharacter(2.8);
    if (target) {
      this.playDuoGesture(target, 'playful_slap', 1.4);
      this.social.triggerSlap(target);
      this.stats.respect = Math.max(0, this.stats.respect - 2);
    } else {
      // Check if striking a destructible prop on foot
      this.hitNearbyDestructible(true);
    }
  }

  public triggerQuickKick() {
    const target = this.getNearestCharacter(2.8);
    if (target) {
      this.playDuoGesture(target, 'roundhouse_kick', 1.6);
      this.social.triggerKick(target);
      this.stats.respect = Math.max(0, this.stats.respect - 5);
    } else {
      this.hitNearbyDestructible(false);
    }
  }

  private hitNearbyDestructible(isSlap: boolean) {
    for (const prop of this.destructibles.props) {
      if (prop.destroyed) continue;
      const d = this.playerPos.distanceTo(prop.initialPos);
      if (d < 2.4) {
        const forward = new THREE.Vector3(Math.sin(this.playerHeading), 0, Math.cos(this.playerHeading));
        this.destructibles.destroyProp(prop, forward.multiplyScalar(isSlap ? 8 : 14), true);
        this.stats.propsDestroyed++;
        this.stats.wantedLevel = Math.min(5, this.stats.wantedLevel + 1);
        if (this.onStatsChange) this.onStatsChange(this.stats);
        break;
      }
    }
  }

  public playDuoGesture(char: FemaleCharacterData, gesture: GesturePosition, duration = 3.0) {
    this.activeGesture = gesture;
    this.activeInteractionChar = char;
    this.gestureTimer = 0;
    this.gestureTimeLimit = duration;

    // Turn Leo and NPC to face each other
    const femaleRig = this.femaleRigs.get(char.id);
    if (femaleRig) {
      const dirToLeo = new THREE.Vector3().subVectors(this.playerPos, femaleRig.root.position).normalize();
      femaleRig.root.rotation.y = Math.atan2(dirToLeo.x, dirToLeo.z);

      const dirToFemale = new THREE.Vector3().subVectors(femaleRig.root.position, this.playerPos).normalize();
      this.playerHeading = Math.atan2(dirToFemale.x, dirToFemale.z);
      this.maleRig.root.rotation.y = this.playerHeading;

      // Bring closer if hugging/kissing
      if (gesture.includes('hug') || gesture.includes('kiss') || gesture === 'slow_dance') {
        const midPoint = new THREE.Vector3().addVectors(this.playerPos, femaleRig.root.position).multiplyScalar(0.5);
        this.playerPos.copy(midPoint).addScaledVector(dirToFemale, -0.6);
        femaleRig.root.position.copy(midPoint).addScaledVector(dirToFemale, 0.6);
      }
    }

    if (gesture === 'long_kiss' || gesture === 'deep_hug') {
      if (this.heartParticles) {
        this.heartParticles.position.copy(this.playerPos);
        this.heartParticles.position.y += 1.2;
        this.heartParticles.visible = true;
      }
    }
  }

  public startHoldLongKiss(char: FemaleCharacterData) {
    this.isHoldingLongKiss = true;
    this.social.kissingHoldDuration = 0;
    this.playDuoGesture(char, 'long_kiss', 9999);
  }

  public endHoldLongKiss(char: FemaleCharacterData): number {
    this.isHoldingLongKiss = false;
    const dur = this.social.endLongKiss(char);
    this.activeGesture = null;
    if (this.heartParticles) this.heartParticles.visible = false;
    this.stats.kissesCompleted++;
    if (dur > this.stats.longestKissSeconds) {
      this.stats.longestKissSeconds = Math.round(dur * 10) / 10;
    }
    if (this.onStatsChange) this.onStatsChange(this.stats);
    return dur;
  }

  public cycleCamera() {
    if (this.cameraMode === 'third_person') this.cameraMode = 'cinematic';
    else if (this.cameraMode === 'cinematic') this.cameraMode = 'vehicle';
    else this.cameraMode = 'third_person';
  }

  public getNearestCharacter(maxDist = 3.5): FemaleCharacterData | null {
    let nearest: FemaleCharacterData | null = null;
    let minD = maxDist;
    for (const c of this.social.characters) {
      const rig = this.femaleRigs.get(c.id);
      if (rig) {
        const d = this.playerPos.distanceTo(rig.root.position);
        if (d < minD) {
          minD = d;
          nearest = c;
        }
      }
    }
    return nearest;
  }

  /**
   * Main Render and Physics Tick
   */
  private animate() {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Vehicle or Player Movement Update
    if (this.inVehicle && this.vehicles.currentVehicle) {
      const v = this.vehicles.currentVehicle;
      const throttle = this.inputs.forward ? 1 : 0;
      const brake = this.inputs.backward ? 1 : 0;
      let steer = 0;
      if (this.inputs.left) steer += 1;
      if (this.inputs.right) steer -= 1;

      this.vehicles.update(delta, {
        throttle,
        brake,
        steer,
        handbrake: this.inputs.handbrake,
      });

      this.playerPos.copy(v.pos);
      this.playerHeading = v.heading;

      // Passenger seat companion follows vehicle
      if (this.social.activeCompanion) {
        const companionRig = this.femaleRigs.get(this.social.activeCompanion.id);
        if (companionRig) {
          companionRig.root.position.copy(v.pos);
          companionRig.root.rotation.y = v.heading;
        }
      }
    } else {
      // On Foot Movement & Gestures
      if (this.activeGesture && this.activeInteractionChar) {
        this.gestureTimer += delta;
        const femaleRig = this.femaleRigs.get(this.activeInteractionChar.id);
        if (femaleRig) {
          applyDuoGesture(this.maleRig, femaleRig, this.activeGesture, time);
        }

        // Long Kiss Hold Tick
        if (this.isHoldingLongKiss) {
          this.social.updateLongKiss(this.activeInteractionChar, delta, (milestone, reward) => {
            if (this.onLongKissProgress) {
              this.onLongKissProgress(this.social.kissingHoldDuration, milestone);
            }
          });
          if (this.onLongKissProgress) {
            this.onLongKissProgress(this.social.kissingHoldDuration, this.social.currentKissTier);
          }
        }

        if (this.gestureTimer >= this.gestureTimeLimit && !this.isHoldingLongKiss) {
          this.activeGesture = null;
          if (this.heartParticles) this.heartParticles.visible = false;
        }
      } else {
        // Normal On-foot locomotion
        const moveSpeed = this.inputs.sprint ? 11 : 5.5;
        const moveX = (this.inputs.right ? 1 : 0) - (this.inputs.left ? 1 : 0);
        const moveZ = (this.inputs.backward ? 1 : 0) - (this.inputs.forward ? 1 : 0);

        const isMoving = moveX !== 0 || moveZ !== 0;

        if (isMoving) {
          // Camera-relative movement
          const camForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngleX);
          const camRight = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngleX);

          const moveDir = new THREE.Vector3()
            .addScaledVector(camForward, -moveZ)
            .addScaledVector(camRight, moveX)
            .normalize();

          this.playerPos.addScaledVector(moveDir, moveSpeed * delta);

          // Boundaries
          this.playerPos.x = Math.max(-140, Math.min(140, this.playerPos.x));
          this.playerPos.z = Math.max(-140, Math.min(140, this.playerPos.z));

          this.playerHeading = Math.atan2(moveDir.x, moveDir.z);
          this.maleRig.root.rotation.y = this.playerHeading;

          animateRig(this.maleRig, this.inputs.sprint ? 'run' : 'walk', time, moveSpeed);
        } else {
          animateRig(this.maleRig, 'idle', time);
        }

        this.maleRig.root.position.copy(this.playerPos);

        // Idle animations for female NPCs
        this.femaleRigs.forEach((rig, id) => {
          if (this.social.activeCompanion?.id === id && !this.inVehicle) {
            // Companion follows Leo smoothly
            const dist = rig.root.position.distanceTo(this.playerPos);
            if (dist > 2.2) {
              const dir = new THREE.Vector3().subVectors(this.playerPos, rig.root.position).normalize();
              rig.root.position.addScaledVector(dir, 4.5 * delta);
              rig.root.rotation.y = Math.atan2(dir.x, dir.z);
              animateRig(rig, 'walk', time);
            } else {
              animateRig(rig, 'idle', time);
            }
          } else {
            animateRig(rig, 'idle', time);
          }
        });
      }
    }

    // 2. Destructibles physics update
    this.destructibles.update(delta);

    // 3. Dynamic Weather update
    this.weather.update(delta, this.playerPos);

    // 4. Proximity prompt detection
    const promptChar = this.getNearestCharacter(3.2);
    if (this.onPromptChange) {
      if (promptChar && !this.inVehicle && !this.activeGesture) {
        this.onPromptChange({
          character: promptChar,
          distance: this.playerPos.distanceTo(this.femaleRigs.get(promptChar.id)!.root.position),
        });
      } else {
        this.onPromptChange(null);
      }
    }

    // 5. Romance hearts spin & pulse
    if (this.heartParticles && this.heartParticles.visible) {
      this.heartParticles.rotation.y += 1.5 * delta;
      this.heartParticles.position.copy(this.playerPos);
      this.heartParticles.position.y = 1.3;
    }

    // 6. Camera smooth follow
    this.updateCamera(delta);

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  }

  private updateCamera(delta: number) {
    if (this.activeGesture && (this.activeGesture.includes('kiss') || this.activeGesture.includes('hug'))) {
      // Close-up Romantic Cinematic Camera
      const center = this.playerPos.clone();
      center.y += 1.25;

      const camTargetDist = 2.0;
      const camTargetPos = center.clone();
      camTargetPos.x += Math.sin(this.cameraAngleX) * camTargetDist;
      camTargetPos.z += Math.cos(this.cameraAngleX) * camTargetDist;
      camTargetPos.y += 0.25;

      // Gentle romantic camera drift
      this.cameraAngleX += 0.2 * delta;

      this.camera.position.lerp(camTargetPos, 5 * delta);
      this.camera.lookAt(center);
      return;
    }

    if (this.inVehicle && this.vehicles.currentVehicle) {
      const v = this.vehicles.currentVehicle;
      const speedRatio = Math.abs(v.speed) / v.config.topSpeed;
      const followDist = 6.5 + speedRatio * 2.5;
      const camHeight = 2.8 + speedRatio * 0.6;

      const targetPos = v.pos.clone();
      targetPos.x -= Math.sin(v.heading) * followDist;
      targetPos.z -= Math.cos(v.heading) * followDist;
      targetPos.y += camHeight;

      this.camera.position.lerp(targetPos, 8 * delta);
      const lookAhead = v.pos.clone();
      lookAhead.y += 1.2;
      lookAhead.x += Math.sin(v.heading) * (2 + speedRatio * 6);
      lookAhead.z += Math.cos(v.heading) * (2 + speedRatio * 6);
      this.camera.lookAt(lookAhead);
      return;
    }

    // Standard third-person on foot
    const target = this.playerPos.clone();
    target.y += 1.4; // shoulder height

    const dist = 4.2;
    const camX = target.x + Math.sin(this.cameraAngleX) * Math.cos(this.cameraAngleY) * dist;
    const camZ = target.z + Math.cos(this.cameraAngleX) * Math.cos(this.cameraAngleY) * dist;
    const camY = target.y + Math.sin(this.cameraAngleY) * dist;

    this.camera.position.set(camX, Math.max(0.4, camY), camZ);
    this.camera.lookAt(target);
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.container.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

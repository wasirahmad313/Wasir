import * as THREE from 'three';
import { VehicleConfig } from './types';
import { GameMaterials } from './materials';
import { sound } from './audio';
import { DestructibleManager } from './destructibles';

export interface VehicleInstance {
  config: VehicleConfig;
  rootGroup: THREE.Group;
  bodyMesh: THREE.Object3D;
  wheels: THREE.Mesh[];
  headlights: THREE.SpotLight[];
  pos: THREE.Vector3;
  velocity: THREE.Vector3;
  heading: number; // yaw angle in radians
  speed: number;
  steerAngle: number;
  driftFactor: number;
  isDrifting: boolean;
  passengerOccupied: boolean;
  passengerSeatPos: THREE.Vector3;
}

export class VehiclePhysicsSystem {
  public vehicles: VehicleInstance[] = [];
  public currentVehicle: VehicleInstance | null = null;
  private scene: THREE.Scene;
  private materials: GameMaterials;
  private destructibles: DestructibleManager;
  private tireSmokeParticles: Array<{
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
  }> = [];

  constructor(scene: THREE.Scene, materials: GameMaterials, destructibles: DestructibleManager) {
    this.scene = scene;
    this.materials = materials;
    this.destructibles = destructibles;
  }

  // 1. Build Apex GT Hypercar (Composite 8-part procedural supercar)
  public spawnSupercar(x: number, z: number, heading = 0): VehicleInstance {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = heading;

    const carConfig: VehicleConfig = {
      id: 'apex_gt',
      name: 'Apex GT Hypercar',
      category: 'Supercar',
      topSpeed: 65, // m/s (~145 mph)
      accel: 24,
      handling: 2.8,
      driftMultiplier: 1.4,
      color: 0xd90429,
      unlocked: true,
    };

    // Main aerodynamic body
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.65, 4.4);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.carPaintApex);
    bodyMesh.position.y = 0.55;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Sleek cockpit roof / tinted glass canopy
    const roofGeo = new THREE.BoxGeometry(1.6, 0.5, 2.2);
    const roofMat = new THREE.MeshPhysicalMaterial({
      color: 0x111827,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.4,
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, 1.05, -0.2);
    roofMesh.castShadow = true;
    group.add(roofMesh);

    // Front aerodynamic carbon splitter
    const splitter = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.08, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5 })
    );
    splitter.position.set(0, 0.25, 2.2);
    group.add(splitter);

    // Rear high-downforce GT wing
    const wingBlade = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.06, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 })
    );
    wingBlade.position.set(0, 1.25, -2.1);
    const strutL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), this.materials.chromeMetal);
    strutL.position.set(-0.6, 1.05, -2.1);
    const strutR = strutL.clone();
    strutR.position.x = 0.6;
    group.add(wingBlade, strutL, strutR);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.8 });
    const rimMat = this.materials.chromeMetal;

    const wheels: THREE.Mesh[] = [];
    const wheelOffsets = [
      { x: -1.05, y: 0.42, z: 1.4 },  // front left
      { x: 1.05, y: 0.42, z: 1.4 },   // front right
      { x: -1.05, y: 0.42, z: -1.4 }, // rear left
      { x: 1.05, y: 0.42, z: -1.4 },  // rear right
    ];

    wheelOffsets.forEach((off) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(off.x, off.y, off.z);

      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;

      // Rim spoke
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.36, 10), rimMat);
      rim.rotation.z = Math.PI / 2;

      wheelGroup.add(tire, rim);
      group.add(wheelGroup);
      wheels.push(tire);
    });

    // Headlight SpotLights
    const headlights: THREE.SpotLight[] = [];
    [-0.7, 0.7].forEach((xOff) => {
      const light = new THREE.SpotLight(0xffffff, 4.0, 45, Math.PI / 6, 0.4);
      light.position.set(xOff, 0.6, 2.3);
      const target = new THREE.Object3D();
      target.position.set(xOff, 0, 20);
      group.add(light, target);
      light.target = target;
      headlights.push(light);

      // Emissive bulb
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      bulb.position.set(xOff, 0.6, 2.22);
      group.add(bulb);
    });

    // Rear glowing tail light bar
    const tailBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.08, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xff0044 })
    );
    tailBar.position.set(0, 0.65, -2.21);
    group.add(tailBar);

    this.scene.add(group);

    const inst: VehicleInstance = {
      config: carConfig,
      rootGroup: group,
      bodyMesh,
      wheels,
      headlights,
      pos: group.position,
      velocity: new THREE.Vector3(),
      heading,
      speed: 0,
      steerAngle: 0,
      driftFactor: 0,
      isDrifting: false,
      passengerOccupied: false,
      passengerSeatPos: new THREE.Vector3(0.5, 0.6, 0),
    };

    this.vehicles.push(inst);
    return inst;
  }

  // 2. Build V8 Stallion Muscle Car
  public spawnMuscleCar(x: number, z: number, heading = 0): VehicleInstance {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = heading;

    const carConfig: VehicleConfig = {
      id: 'v8_stallion',
      name: 'V8 Stallion Muscle',
      category: 'Muscle',
      topSpeed: 55,
      accel: 28, // explosive torque
      handling: 2.1,
      driftMultiplier: 2.2, // very slidey
      color: 0x111827,
      unlocked: true,
    };

    // Boxy muscle body
    const bodyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.75, 4.6),
      this.materials.carPaintMuscle
    );
    bodyMesh.position.y = 0.65;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Hood scoop
    const scoop = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.18, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.3 })
    );
    scoop.position.set(0, 1.05, 1.2);
    group.add(scoop);

    // Cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.65, 2.3),
      new THREE.MeshPhysicalMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 })
    );
    cabin.position.set(0, 1.2, -0.3);
    cabin.castShadow = true;
    group.add(cabin);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.42, 16);
    const wheels: THREE.Mesh[] = [];
    [
      { x: -1.08, y: 0.46, z: 1.4 },
      { x: 1.08, y: 0.46, z: 1.4 },
      { x: -1.08, y: 0.46, z: -1.4 },
      { x: 1.08, y: 0.46, z: -1.4 },
    ].forEach((off) => {
      const tire = new THREE.Mesh(
        wheelGeo,
        new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9 })
      );
      tire.rotation.z = Math.PI / 2;
      tire.position.set(off.x, off.y, off.z);
      tire.castShadow = true;
      group.add(tire);
      wheels.push(tire);
    });

    const headlights: THREE.SpotLight[] = [];
    [-0.7, 0.7].forEach((xOff) => {
      const light = new THREE.SpotLight(0xfffaed, 3.5, 40, Math.PI / 6, 0.5);
      light.position.set(xOff, 0.7, 2.4);
      const target = new THREE.Object3D();
      target.position.set(xOff, 0, 20);
      group.add(light, target);
      light.target = target;
      headlights.push(light);
    });

    this.scene.add(group);

    const inst: VehicleInstance = {
      config: carConfig,
      rootGroup: group,
      bodyMesh,
      wheels,
      headlights,
      pos: group.position,
      velocity: new THREE.Vector3(),
      heading,
      speed: 0,
      steerAngle: 0,
      driftFactor: 0,
      isDrifting: false,
      passengerOccupied: false,
      passengerSeatPos: new THREE.Vector3(0.5, 0.65, 0),
    };

    this.vehicles.push(inst);
    return inst;
  }

  // 3. Build Phantom Cafe Racer Motorcycle
  public spawnMotorcycle(x: number, z: number, heading = 0): VehicleInstance {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = heading;

    const motoConfig: VehicleConfig = {
      id: 'phantom_moto',
      name: 'Phantom Cafe Racer',
      category: 'Motorcycle',
      topSpeed: 60,
      accel: 30,
      handling: 3.5,
      driftMultiplier: 1.1,
      color: 0x2563eb,
      unlocked: true,
    };

    // Frame & tank
    const tank = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.35, 1.1),
      this.materials.carPaintMoto
    );
    tank.position.set(0, 0.85, 0.2);
    tank.castShadow = true;
    group.add(tank);

    // Engine block
    const engine = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.45, 0.6),
      this.materials.chromeMetal
    );
    engine.position.set(0, 0.5, 0);
    group.add(engine);

    // Front fork & handlebars
    const fork = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
      this.materials.chromeMetal
    );
    fork.position.set(0, 0.7, 0.9);
    fork.rotation.x = -0.3;
    group.add(fork);

    // 2 Wheels
    const motoWheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.16, 16);
    const wheels: THREE.Mesh[] = [];
    [
      { z: 1.1, y: 0.38 },
      { z: -1.0, y: 0.38 },
    ].forEach((w) => {
      const tire = new THREE.Mesh(
        motoWheelGeo,
        new THREE.MeshStandardMaterial({ color: 0x111, roughness: 0.85 })
      );
      tire.rotation.z = Math.PI / 2;
      tire.position.set(0, w.y, w.z);
      tire.castShadow = true;
      group.add(tire);
      wheels.push(tire);
    });

    const headlight = new THREE.SpotLight(0xffffff, 4.0, 45, Math.PI / 6, 0.4);
    headlight.position.set(0, 0.85, 1.1);
    const target = new THREE.Object3D();
    target.position.set(0, 0, 20);
    group.add(headlight, target);
    headlight.target = target;

    this.scene.add(group);

    const inst: VehicleInstance = {
      config: motoConfig,
      rootGroup: group,
      bodyMesh: tank,
      wheels,
      headlights: [headlight],
      pos: group.position,
      velocity: new THREE.Vector3(),
      heading,
      speed: 0,
      steerAngle: 0,
      driftFactor: 0,
      isDrifting: false,
      passengerOccupied: false,
      passengerSeatPos: new THREE.Vector3(0, 0.85, -0.4),
    };

    this.vehicles.push(inst);
    return inst;
  }

  /**
   * Physics update for current active vehicle
   */
  public update(
    delta: number,
    inputs: { throttle: number; brake: number; steer: number; handbrake: boolean }
  ) {
    if (!this.currentVehicle) return;
    const v = this.currentVehicle;

    // 1. Acceleration / Braking
    if (inputs.throttle > 0) {
      v.speed += v.config.accel * inputs.throttle * delta;
      if (v.speed > v.config.topSpeed) v.speed = v.config.topSpeed;
    } else if (inputs.brake > 0) {
      if (v.speed > 0.5) {
        v.speed -= v.config.accel * 1.5 * inputs.brake * delta;
      } else {
        // Reverse
        v.speed -= v.config.accel * 0.5 * inputs.brake * delta;
        if (v.speed < -15) v.speed = -15;
      }
    } else {
      // Natural rolling friction
      v.speed *= Math.max(0, 1 - 0.7 * delta);
    }

    // 2. Handbrake & Drifting
    if (inputs.handbrake && Math.abs(v.speed) > 5) {
      v.isDrifting = true;
      v.driftFactor = THREE.MathUtils.lerp(v.driftFactor, v.config.driftMultiplier, 6 * delta);
      sound.playTireDrift();
      this.spawnTireSmoke(v);
    } else {
      v.isDrifting = false;
      v.driftFactor = THREE.MathUtils.lerp(v.driftFactor, 0, 4 * delta);
    }

    // 3. Steering & Turning Radius
    const turnRate = v.config.handling * (1 + v.driftFactor * 0.5);
    if (Math.abs(v.speed) > 0.2) {
      const direction = v.speed >= 0 ? 1 : -1;
      v.heading -= inputs.steer * turnRate * direction * delta;
    }

    // Rotate vehicle mesh root
    v.rootGroup.rotation.y = v.heading;

    // Motorcycle lean visual
    if (v.config.category === 'Motorcycle') {
      v.rootGroup.rotation.z = -inputs.steer * 0.35 * Math.min(1, Math.abs(v.speed) / 20);
    }

    // 4. Velocity computation with slip angle
    const forwardX = Math.sin(v.heading);
    const forwardZ = Math.cos(v.heading);

    v.velocity.set(forwardX * v.speed, 0, forwardZ * v.speed);

    // Apply movement
    v.pos.x += v.velocity.x * delta;
    v.pos.z += v.velocity.z * delta;

    // Boundary bounce (keeps inside city arena ±140m)
    const bounds = 140;
    if (Math.abs(v.pos.x) > bounds) {
      v.pos.x = Math.sign(v.pos.x) * bounds;
      v.speed *= -0.4;
      sound.playCrashImpact(0.8);
    }
    if (Math.abs(v.pos.z) > bounds) {
      v.pos.z = Math.sign(v.pos.z) * bounds;
      v.speed *= -0.4;
      sound.playCrashImpact(0.8);
    }

    // 5. Destructibles Collisions
    this.checkDestructibleCollisions(v);

    // 6. Audio pitch update
    const speedRatio = Math.abs(v.speed) / v.config.topSpeed;
    sound.updateEngineSound(true, speedRatio);

    // 7. Update active tire smoke particles
    this.updateSmokeParticles(delta);
  }

  private checkDestructibleCollisions(v: VehicleInstance) {
    const carPos = v.pos;
    const carSpeed = Math.abs(v.speed);

    for (const prop of this.destructibles.props) {
      if (prop.destroyed) continue;

      const dist = carPos.distanceTo(prop.initialPos);
      if (dist < 2.5) {
        // Impact!
        const hitVel = v.velocity.clone();
        if (hitVel.lengthSq() < 1) hitVel.set(Math.sin(v.heading) * 10, 0, Math.cos(v.heading) * 10);

        this.destructibles.destroyProp(prop, hitVel, false);

        // Slow car slightly on impact
        if (carSpeed > 10) {
          v.speed *= 0.65;
        }
      }
    }
  }

  private spawnTireSmoke(v: VehicleInstance) {
    const smokeGeo = new THREE.SphereGeometry(0.25, 6, 6);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.5,
    });

    const mesh = new THREE.Mesh(smokeGeo, smokeMat);
    // Position at rear of car
    mesh.position.copy(v.pos);
    mesh.position.x -= Math.sin(v.heading) * 1.6 + (Math.random() - 0.5) * 0.8;
    mesh.position.y = 0.3;
    mesh.position.z -= Math.cos(v.heading) * 1.6 + (Math.random() - 0.5) * 0.8;

    this.scene.add(mesh);
    this.tireSmokeParticles.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 2, 1.2 + Math.random(), (Math.random() - 0.5) * 2),
      life: 0.6,
    });
  }

  private updateSmokeParticles(delta: number) {
    for (let i = this.tireSmokeParticles.length - 1; i >= 0; i--) {
      const p = this.tireSmokeParticles[i];
      p.life -= delta;
      p.mesh.position.addScaledVector(p.velocity, delta);
      p.mesh.scale.multiplyScalar(1 + 2 * delta);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p.life / 0.6 * 0.5);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.tireSmokeParticles.splice(i, 1);
      }
    }
  }
}

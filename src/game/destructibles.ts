import * as THREE from 'three';
import { DestructibleProp } from './types';
import { GameMaterials } from './materials';
import { sound } from './audio';

export class DestructibleManager {
  public props: DestructibleProp[] = [];
  public activeFragments: Array<{
    mesh: THREE.Object3D;
    velocity: THREE.Vector3;
    rotVelocity: THREE.Vector3;
    life: number;
  }> = [];
  public geysers: Array<{
    pos: THREE.Vector3;
    particles: THREE.Points;
    life: number;
  }> = [];

  private scene: THREE.Scene;
  private materials: GameMaterials;

  constructor(scene: THREE.Scene, materials: GameMaterials) {
    this.scene = scene;
    this.materials = materials;
  }

  // 1. Street Light Pole (Composite 5 parts: base, lower pole, upper arch, lamp fixture, emissive lens)
  public createStreetLight(x: number, z: number, rotY = 0): DestructibleProp {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    // Base collar
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.6, 8);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.chromeMetal);
    baseMesh.position.y = 0.3;
    baseMesh.castShadow = true;
    group.add(baseMesh);

    // Main vertical pole
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 5.5, 8);
    const poleMesh = new THREE.Mesh(poleGeo, this.materials.chromeMetal);
    poleMesh.position.y = 3.25;
    poleMesh.castShadow = true;
    group.add(poleMesh);

    // Lamp horizontal arm
    const armGeo = new THREE.BoxGeometry(0.1, 0.1, 1.8);
    const armMesh = new THREE.Mesh(armGeo, this.materials.chromeMetal);
    armMesh.position.set(0, 5.8, 0.7);
    armMesh.rotation.x = 0.15;
    armMesh.castShadow = true;
    group.add(armMesh);

    // Lamp Head housing
    const headGeo = new THREE.BoxGeometry(0.35, 0.15, 0.6);
    const headMesh = new THREE.Mesh(headGeo, this.materials.concreteBuilding);
    headMesh.position.set(0, 5.7, 1.4);
    group.add(headMesh);

    // Glowing Emissive Lens
    const lensGeo = new THREE.PlaneGeometry(0.3, 0.5);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(0, 5.62, 1.4);
    lensMesh.rotation.x = Math.PI / 2;
    group.add(lensMesh);

    this.scene.add(group);

    const prop: DestructibleProp = {
      id: `light_${Math.random().toString(36).substring(2, 7)}`,
      type: 'streetlight',
      rootGroup: group,
      initialPos: group.position.clone(),
      initialRot: group.rotation.clone(),
      destroyed: false,
      health: 80,
    };
    this.props.push(prop);
    return prop;
  }

  // 2. Fire Hydrant (Cast iron cylinder, bolts, cap, red paint)
  public createFireHydrant(x: number, z: number): DestructibleProp {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.6 });

    // Main barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.7, 10), redMat);
    barrel.position.y = 0.35;
    barrel.castShadow = true;
    group.add(barrel);

    // Top domed bonnet
    const topDome = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), redMat);
    topDome.position.y = 0.7;
    group.add(topDome);

    // Side nozzle caps
    const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
    const capMesh = new THREE.Mesh(capGeo, this.materials.chromeMetal);
    capMesh.rotation.z = Math.PI / 2;
    capMesh.position.y = 0.45;
    group.add(capMesh);

    this.scene.add(group);

    const prop: DestructibleProp = {
      id: `hydrant_${Math.random().toString(36).substring(2, 7)}`,
      type: 'hydrant',
      rootGroup: group,
      initialPos: group.position.clone(),
      initialRot: group.rotation.clone(),
      destroyed: false,
      health: 60,
    };
    this.props.push(prop);
    return prop;
  }

  // 3. Traffic Safety Barrier (Heavy orange striped jersey block)
  public createBarrier(x: number, z: number, rotY = 0): DestructibleProp {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    // Extruded or shaped barrier block
    const barrierGeo = new THREE.BoxGeometry(2.4, 0.9, 0.6);
    const barrierMesh = new THREE.Mesh(barrierGeo, this.materials.barrier);
    barrierMesh.position.y = 0.45;
    barrierMesh.castShadow = true;
    group.add(barrierMesh);

    this.scene.add(group);

    const prop: DestructibleProp = {
      id: `barrier_${Math.random().toString(36).substring(2, 7)}`,
      type: 'barrier',
      rootGroup: group,
      initialPos: group.position.clone(),
      initialRot: group.rotation.clone(),
      destroyed: false,
      health: 40,
    };
    this.props.push(prop);
    return prop;
  }

  // 4. Wooden Crate (Cargo stack)
  public createCrate(x: number, y = 0.45, z: number): DestructibleProp {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const crateGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const crateMesh = new THREE.Mesh(crateGeo, this.materials.woodCrate);
    crateMesh.castShadow = true;
    group.add(crateMesh);

    this.scene.add(group);

    const prop: DestructibleProp = {
      id: `crate_${Math.random().toString(36).substring(2, 7)}`,
      type: 'crate',
      rootGroup: group,
      initialPos: group.position.clone(),
      initialRot: group.rotation.clone(),
      destroyed: false,
      health: 25,
    };
    this.props.push(prop);
    return prop;
  }

  // 5. Park Bench (Wood slats + metal legs)
  public createBench(x: number, z: number, rotY = 0): DestructibleProp {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotY;

    // Wood seat
    const seatGeo = new THREE.BoxGeometry(1.8, 0.08, 0.5);
    const seatMesh = new THREE.Mesh(seatGeo, this.materials.woodCrate);
    seatMesh.position.set(0, 0.45, 0);
    seatMesh.castShadow = true;
    group.add(seatMesh);

    // Backrest
    const backGeo = new THREE.BoxGeometry(1.8, 0.4, 0.06);
    const backMesh = new THREE.Mesh(backGeo, this.materials.woodCrate);
    backMesh.position.set(0, 0.75, -0.22);
    group.add(backMesh);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.08, 0.45, 0.5);
    const legL = new THREE.Mesh(legGeo, this.materials.chromeMetal);
    legL.position.set(-0.75, 0.22, 0);
    const legR = legL.clone();
    legR.position.set(0.75, 0.22, 0);
    group.add(legL, legR);

    this.scene.add(group);

    const prop: DestructibleProp = {
      id: `bench_${Math.random().toString(36).substring(2, 7)}`,
      type: 'bench',
      rootGroup: group,
      initialPos: group.position.clone(),
      initialRot: group.rotation.clone(),
      destroyed: false,
      health: 35,
    };
    this.props.push(prop);
    return prop;
  }

  /**
   * Triggers destruction physics, fractures, and visual sound/particles
   */
  public destroyProp(prop: DestructibleProp, hitVelocity: THREE.Vector3, isPlayerKickOrSlap = false): void {
    if (prop.destroyed) return;
    prop.destroyed = true;

    sound.playCrashImpact(isPlayerKickOrSlap ? 0.6 : 1.2);

    if (prop.type === 'streetlight') {
      // Light pole topples with angular momentum
      const pole = prop.rootGroup;
      const speed = Math.max(hitVelocity.length(), 6);
      const dir = hitVelocity.clone().normalize();
      if (dir.lengthSq() < 0.1) dir.set(0, 0, 1);

      this.activeFragments.push({
        mesh: pole,
        velocity: new THREE.Vector3(dir.x * speed * 0.4, 2 + Math.random() * 2, dir.z * speed * 0.4),
        rotVelocity: new THREE.Vector3(dir.z * 4, (Math.random() - 0.5) * 4, -dir.x * 4),
        life: 12,
      });

    } else if (prop.type === 'hydrant') {
      // Hydrant base sheared off -> high-pressure water geyser!
      const hydrantMesh = prop.rootGroup;
      const dir = hitVelocity.clone().normalize();
      this.activeFragments.push({
        mesh: hydrantMesh,
        velocity: new THREE.Vector3(dir.x * 10, 6, dir.z * 10),
        rotVelocity: new THREE.Vector3(5, 4, 3),
        life: 8,
      });

      // Spawn geyser at base
      this.spawnWaterGeyser(prop.initialPos);

    } else if (prop.type === 'crate') {
      // Splits into splinter shards
      this.scene.remove(prop.rootGroup);
      for (let i = 0; i < 6; i++) {
        const shard = new THREE.Mesh(
          new THREE.BoxGeometry(0.3 + Math.random() * 0.2, 0.08, 0.3 + Math.random() * 0.2),
          this.materials.woodCrate
        );
        shard.position.copy(prop.rootGroup.position);
        shard.position.x += (Math.random() - 0.5) * 0.5;
        shard.position.y += Math.random() * 0.5;
        shard.position.z += (Math.random() - 0.5) * 0.5;
        this.scene.add(shard);

        const v = hitVelocity.clone().multiplyScalar(0.4);
        v.x += (Math.random() - 0.5) * 8;
        v.y += 3 + Math.random() * 5;
        v.z += (Math.random() - 0.5) * 8;

        this.activeFragments.push({
          mesh: shard,
          velocity: v,
          rotVelocity: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8),
          life: 8,
        });
      }

    } else {
      // Barrier or bench tumbled
      const dir = hitVelocity.clone().normalize();
      const speed = Math.max(hitVelocity.length(), 8);
      this.activeFragments.push({
        mesh: prop.rootGroup,
        velocity: new THREE.Vector3(dir.x * speed * 0.6, 3 + Math.random() * 2, dir.z * speed * 0.6),
        rotVelocity: new THREE.Vector3(dir.z * 6, Math.random() * 4, -dir.x * 6),
        life: 10,
      });
    }
  }

  private spawnWaterGeyser(pos: THREE.Vector3) {
    const particleCount = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = pos.x + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = pos.y + 0.1;
      positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.3;

      velocities[i * 3] = (Math.random() - 0.5) * 1.5;
      velocities[i * 3 + 1] = 6 + Math.random() * 7; // Shoots straight up
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.25,
      transparent: true,
      opacity: 0.8,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    this.geysers.push({ pos: pos.clone(), particles: points, life: 15 });
  }

  public update(delta: number): void {
    // 1. Update flying / tumbling debris fragments
    for (let i = this.activeFragments.length - 1; i >= 0; i--) {
      const frag = this.activeFragments[i];
      frag.life -= delta;

      // Apply gravity
      frag.velocity.y -= 19.6 * delta;

      // Move mesh
      frag.mesh.position.addScaledVector(frag.velocity, delta);
      frag.mesh.rotation.x += frag.rotVelocity.x * delta;
      frag.mesh.rotation.y += frag.rotVelocity.y * delta;
      frag.mesh.rotation.z += frag.rotVelocity.z * delta;

      // Ground bounce & friction
      if (frag.mesh.position.y < 0.2) {
        frag.mesh.position.y = 0.2;
        frag.velocity.y = -frag.velocity.y * 0.3; // Damped bounce
        frag.velocity.x *= 0.7; // Friction
        frag.velocity.z *= 0.7;
        frag.rotVelocity.multiplyScalar(0.7);
      }

      if (frag.life <= 0) {
        this.scene.remove(frag.mesh);
        this.activeFragments.splice(i, 1);
      }
    }

    // 2. Update water geysers
    for (let i = this.geysers.length - 1; i >= 0; i--) {
      const geyser = this.geysers[i];
      geyser.life -= delta;
      const positions = geyser.particles.geometry.attributes.position.array as Float32Array;

      for (let p = 0; p < positions.length / 3; p++) {
        // Simple fountain physics
        positions[p * 3 + 1] += (7 - (positions[p * 3 + 1] - geyser.pos.y) * 1.5) * delta;
        positions[p * 3] += (Math.random() - 0.5) * 2 * delta;
        positions[p * 3 + 2] += (Math.random() - 0.5) * 2 * delta;

        // Reset if reached ground
        if (positions[p * 3 + 1] > geyser.pos.y + 7.5 || positions[p * 3 + 1] < geyser.pos.y) {
          positions[p * 3] = geyser.pos.x + (Math.random() - 0.5) * 0.4;
          positions[p * 3 + 1] = geyser.pos.y + 0.1;
          positions[p * 3 + 2] = geyser.pos.z + (Math.random() - 0.5) * 0.4;
        }
      }
      geyser.particles.geometry.attributes.position.needsUpdate = true;

      if (geyser.life <= 0) {
        this.scene.remove(geyser.particles);
        this.geysers.splice(i, 1);
      }
    }
  }

  /**
   * Reset all destroyed props (e.g. from smartphone repair service)
   */
  public resetAll(): void {
    // Remove all fragments
    for (const frag of this.activeFragments) {
      this.scene.remove(frag.mesh);
    }
    this.activeFragments = [];

    // Remove geysers
    for (const g of this.geysers) {
      this.scene.remove(g.particles);
    }
    this.geysers = [];

    // Re-attach props
    for (const prop of this.props) {
      prop.destroyed = false;
      prop.health = 80;
      prop.rootGroup.position.copy(prop.initialPos);
      prop.rootGroup.rotation.copy(prop.initialRot);
      if (!this.scene.children.includes(prop.rootGroup)) {
        this.scene.add(prop.rootGroup);
      }
    }
  }
}

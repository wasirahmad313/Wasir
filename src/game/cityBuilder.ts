import * as THREE from 'three';
import { GameMaterials } from './materials';
import { DestructibleManager } from './destructibles';

export class CityBuilder {
  private scene: THREE.Scene;
  private materials: GameMaterials;
  private destructibles: DestructibleManager;

  constructor(scene: THREE.Scene, materials: GameMaterials, destructibles: DestructibleManager) {
    this.scene = scene;
    this.materials = materials;
    this.destructibles = destructibles;
  }

  public buildWorld() {
    this.buildGroundAndRoads();
    this.buildSkyscrapers();
    this.buildBeachAndOcean();
    this.buildPalmTrees();
    this.populateDestructibleStreetProps();
  }

  private buildGroundAndRoads() {
    // 1. Main Asphalt City Ground Plane (300 x 300)
    const roadGeo = new THREE.PlaneGeometry(300, 300);
    const roadMesh = new THREE.Mesh(roadGeo, this.materials.asphalt);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);

    // 2. Concrete Sidewalks and curbs for city blocks
    const blockPositions = [
      { x: -50, z: -50, w: 60, d: 60 },
      { x: 50, z: -50, w: 60, d: 60 },
      { x: -50, z: 50, w: 60, d: 60 },
      { x: 50, z: 50, w: 60, d: 60 },
      { x: -50, z: 120, w: 60, d: 50 },
      { x: 50, z: 120, w: 60, d: 50 },
    ];

    blockPositions.forEach((b) => {
      // Sidewalk slab
      const slabGeo = new THREE.BoxGeometry(b.w, 0.2, b.d);
      const slab = new THREE.Mesh(slabGeo, this.materials.sidewalk);
      slab.position.set(b.x, 0.1, b.z);
      slab.receiveShadow = true;
      this.scene.add(slab);
    });

    // Central Plaza / Park
    const parkGeo = new THREE.BoxGeometry(30, 0.22, 30);
    const parkMesh = new THREE.Mesh(parkGeo, this.materials.grass);
    parkMesh.position.set(0, 0.11, 0);
    parkMesh.receiveShadow = true;
    this.scene.add(parkMesh);
  }

  private buildSkyscrapers() {
    // Variety of skyscrapers with rooftop details and glowing neon signs
    const buildings = [
      // Downtown cluster
      { x: -50, z: -50, h: 55, w: 22, d: 22, color: 0x1e293b, neon: 'VICE TOWER', neonColor: this.materials.neonPink },
      { x: -35, z: -70, h: 75, w: 18, d: 18, color: 0x0f172a, neon: 'DIAMOND CASINO', neonColor: this.materials.neonCyan },
      { x: -65, z: -70, h: 42, w: 20, d: 24, color: 0x334155, neon: '', neonColor: this.materials.neonGold },

      { x: 50, z: -50, h: 65, w: 24, d: 20, color: 0x1e293b, neon: 'SKYLINE LOUNGE', neonColor: this.materials.neonGold },
      { x: 65, z: -70, h: 48, w: 18, d: 22, color: 0x0f172a, neon: '', neonColor: this.materials.neonPink },
      { x: 35, z: -70, h: 80, w: 20, d: 20, color: 0x111827, neon: 'APEX MOTORS', neonColor: this.materials.neonCyan },

      // Mid-town luxury blocks
      { x: -50, z: 50, h: 38, w: 26, d: 22, color: 0x334155, neon: 'VELVET CLUB', neonColor: this.materials.neonPink },
      { x: 50, z: 50, h: 45, w: 24, d: 26, color: 0x1e293b, neon: 'OASIS HOTEL', neonColor: this.materials.neonCyan },

      // Marina district
      { x: -50, z: 120, h: 28, w: 30, d: 20, color: 0x475569, neon: 'PORT AUTHORITY', neonColor: this.materials.neonGold },
      { x: 50, z: 120, h: 32, w: 28, d: 22, color: 0x334155, neon: 'COASTAL PENTHOUSE', neonColor: this.materials.neonCyan },
    ];

    buildings.forEach((b) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(b.x, 0, b.z);

      // Primary tower body
      const bodyGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const towerMesh = new THREE.Mesh(bodyGeo, this.materials.windowGlass);
      towerMesh.position.y = b.h / 2;
      towerMesh.castShadow = true;
      towerMesh.receiveShadow = true;
      bGroup.add(towerMesh);

      // Concrete roof parapet
      const roofGeo = new THREE.BoxGeometry(b.w + 0.4, 0.8, b.d + 0.4);
      const roofMesh = new THREE.Mesh(roofGeo, this.materials.concreteBuilding);
      roofMesh.position.y = b.h + 0.4;
      bGroup.add(roofMesh);

      // Rooftop AC units / Helipad / Spire
      if (b.h > 50) {
        // Spire antenna
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.4, 12, 8),
          this.materials.chromeMetal
        );
        spire.position.y = b.h + 6;
        bGroup.add(spire);

        // Blinking aviation warning light at top of antenna
        const redBeacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        redBeacon.position.y = b.h + 12;
        bGroup.add(redBeacon);
      } else {
        // HVAC chiller units
        const hvac = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 4), this.materials.chromeMetal);
        hvac.position.set(2, b.h + 1.2, 2);
        bGroup.add(hvac);
      }

      // Neon sign on front facade
      if (b.neon) {
        const signGeo = new THREE.BoxGeometry(b.w * 0.7, 2.5, 0.4);
        const signMesh = new THREE.Mesh(signGeo, b.neonColor);
        signMesh.position.set(0, b.h - 4, b.d / 2 + 0.25);
        bGroup.add(signMesh);
      }

      this.scene.add(bGroup);
    });
  }

  private buildBeachAndOcean() {
    // Golden Beach along Z = -110 to -150
    const beachGeo = new THREE.PlaneGeometry(300, 50);
    const beachMesh = new THREE.Mesh(beachGeo, this.materials.sand);
    beachMesh.rotation.x = -Math.PI / 2;
    beachMesh.position.set(0, 0.05, -125);
    beachMesh.receiveShadow = true;
    this.scene.add(beachMesh);

    // Ocean water expanse
    const waterGeo = new THREE.PlaneGeometry(400, 150);
    const waterMesh = new THREE.Mesh(waterGeo, this.materials.oceanWater);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, -0.2, -210);
    this.scene.add(waterMesh);
  }

  private buildPalmTrees() {
    // Curved segmented trunk + fan leaves
    const palmPositions = [
      { x: -15, z: -105 },
      { x: 0, z: -105 },
      { x: 15, z: -105 },
      { x: 30, z: -105 },
      { x: -30, z: -105 },
      { x: -12, z: 12 },
      { x: 12, z: 12 },
      { x: -12, z: -12 },
      { x: 12, z: -12 },
    ];

    palmPositions.forEach((pos) => {
      const tree = new THREE.Group();
      tree.position.set(pos.x, 0, pos.z);

      // Curved segmented trunk
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78563a, roughness: 0.85 });
      for (let s = 0; s < 5; s++) {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.24 - s * 0.02, 0.28 - s * 0.02, 1.4, 7), trunkMat);
        seg.position.set(Math.sin(s * 0.3) * 0.2, s * 1.3 + 0.7, 0);
        seg.rotation.z = s * 0.06;
        seg.castShadow = true;
        tree.add(seg);
      }

      // Palm fronds (6 foliage blades radiating from top)
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.6, side: THREE.DoubleSide });
      for (let f = 0; f < 6; f++) {
        const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 3.2), leafMat);
        frond.position.set(0.4, 7.0, 0);
        frond.rotation.y = (f * Math.PI) / 3;
        frond.rotation.x = 0.8;
        frond.castShadow = true;
        tree.add(frond);
      }

      this.scene.add(tree);
    });
  }

  private populateDestructibleStreetProps() {
    // 1. Street lights along main central avenue (X = ±12m)
    for (let z = -90; z <= 130; z += 24) {
      this.destructibles.createStreetLight(-12, z, Math.PI / 2);
      this.destructibles.createStreetLight(12, z, -Math.PI / 2);
    }

    // 2. Fire hydrants at street corners
    this.destructibles.createFireHydrant(-18, -18);
    this.destructibles.createFireHydrant(18, -18);
    this.destructibles.createFireHydrant(-18, 18);
    this.destructibles.createFireHydrant(18, 18);
    this.destructibles.createFireHydrant(-18, 85);
    this.destructibles.createFireHydrant(18, 85);

    // 3. Traffic Safety Barriers (detour / speed test zone)
    this.destructibles.createBarrier(0, 70, 0);
    this.destructibles.createBarrier(3, 70, 0);
    this.destructibles.createBarrier(-3, 70, 0);
    this.destructibles.createBarrier(0, -60, 0.4);
    this.destructibles.createBarrier(4, -60, 0.4);

    // 4. Wooden Crates (Warehouse / alley corner stacks)
    this.destructibles.createCrate(-22, 0.45, 45);
    this.destructibles.createCrate(-22, 1.35, 45);
    this.destructibles.createCrate(-21, 0.45, 45);
    this.destructibles.createCrate(22, 0.45, 45);
    this.destructibles.createCrate(22, 0.45, 46);

    // 5. Park Benches (Along central plaza and beach)
    this.destructibles.createBench(-6, -10, 0);
    this.destructibles.createBench(6, -10, 0);
    this.destructibles.createBench(-6, 10, Math.PI);
    this.destructibles.createBench(6, 10, Math.PI);
    this.destructibles.createBench(0, -100, 0);
  }
}

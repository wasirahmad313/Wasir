import * as THREE from 'three';

/**
 * Creates procedural textures via 2D Canvas with correct SRGB color space & anisotropy
 */

// Procedural Asphalt Texture
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base dark asphalt
  ctx.fillStyle = '#1c1f24';
  ctx.fillRect(0, 0, 512, 512);

  // Gravel flecks
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = Math.random() * 1.5 + 0.5;
    const shade = Math.floor(Math.random() * 45 + 30);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.fillRect(x, y, size, size);
  }

  // Double yellow center divider lines
  ctx.fillStyle = '#ffb300';
  ctx.fillRect(250, 0, 4, 512);
  ctx.fillRect(258, 0, 4, 512);

  // White lane dashed side lines
  ctx.fillStyle = '#e2e8f0';
  for (let y = 0; y < 512; y += 48) {
    ctx.fillRect(90, y, 6, 28);
    ctx.fillRect(416, y, 6, 28);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Sidewalk Texture
export function createSidewalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#838891';
  ctx.fillRect(0, 0, 256, 256);

  // Tile joints
  ctx.strokeStyle = '#5a5e66';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, 126, 126);
  ctx.strokeRect(130, 2, 124, 126);
  ctx.strokeRect(2, 130, 126, 124);
  ctx.strokeRect(130, 130, 124, 124);

  // Speckles
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const shade = Math.floor(Math.random() * 30 + 120);
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Skyscraper Window Facade Texture
export function createWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 512);

  const cols = 8;
  const rows = 16;
  const cellW = 256 / cols;
  const cellH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isLit = Math.random() > 0.45;
      if (isLit) {
        const warm = Math.random() > 0.3;
        ctx.fillStyle = warm ? 'rgba(255, 230, 150, 0.9)' : 'rgba(180, 220, 255, 0.85)';
      } else {
        ctx.fillStyle = 'rgba(20, 30, 45, 0.95)';
      }
      ctx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Crate Wood Texture
export function createWoodCrateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8d5b2d';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#6b4320';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(0, i * 32, 128, 2);
  }

  // Cross brace
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#5a381a';
  ctx.beginPath();
  ctx.moveTo(8, 8);
  ctx.lineTo(120, 120);
  ctx.stroke();

  // Metal corner brackets
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillRect(112, 0, 16, 16);
  ctx.fillRect(0, 112, 16, 16);
  ctx.fillRect(112, 112, 16, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Barrier Stripe Texture
export function createBarrierTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 128);

  ctx.fillStyle = '#ea580c'; // Vibrant orange
  for (let i = -128; i < 256; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 40, 128);
    ctx.lineTo(i + 20, 128);
    ctx.lineTo(i - 20, 0);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Pre-assembled material cache
export class GameMaterials {
  public asphalt: THREE.MeshStandardMaterial;
  public sidewalk: THREE.MeshStandardMaterial;
  public grass: THREE.MeshStandardMaterial;
  public sand: THREE.MeshStandardMaterial;
  public oceanWater: THREE.MeshPhysicalMaterial;
  public windowGlass: THREE.MeshStandardMaterial;
  public concreteBuilding: THREE.MeshStandardMaterial;
  public chromeMetal: THREE.MeshStandardMaterial;
  public woodCrate: THREE.MeshStandardMaterial;
  public barrier: THREE.MeshStandardMaterial;
  public neonCyan: THREE.MeshStandardMaterial;
  public neonPink: THREE.MeshStandardMaterial;
  public neonGold: THREE.MeshStandardMaterial;
  public carPaintApex: THREE.MeshPhysicalMaterial;
  public carPaintMuscle: THREE.MeshPhysicalMaterial;
  public carPaintMoto: THREE.MeshPhysicalMaterial;

  constructor() {
    const asphaltTex = createAsphaltTexture();
    asphaltTex.repeat.set(1, 16);
    this.asphalt = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.8,
      metalness: 0.1,
    });

    const sidewalkTex = createSidewalkTexture();
    sidewalkTex.repeat.set(8, 8);
    this.sidewalk = new THREE.MeshStandardMaterial({
      map: sidewalkTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.grass = new THREE.MeshStandardMaterial({
      color: 0x3d7e35,
      roughness: 0.9,
      metalness: 0.0,
    });

    this.sand = new THREE.MeshStandardMaterial({
      color: 0xe2cb9b,
      roughness: 0.95,
      metalness: 0.0,
    });

    this.oceanWater = new THREE.MeshPhysicalMaterial({
      color: 0x0f52ba,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.333,
      transparent: true,
      opacity: 0.85,
    });

    const winTex = createWindowTexture();
    winTex.repeat.set(2, 4);
    this.windowGlass = new THREE.MeshStandardMaterial({
      map: winTex,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x223344,
      emissiveIntensity: 0.4,
    });

    this.concreteBuilding = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.8,
      metalness: 0.1,
    });

    this.chromeMetal = new THREE.MeshStandardMaterial({
      color: 0xdde4ec,
      roughness: 0.15,
      metalness: 0.95,
    });

    this.woodCrate = new THREE.MeshStandardMaterial({
      map: createWoodCrateTexture(),
      roughness: 0.85,
      metalness: 0.1,
    });

    this.barrier = new THREE.MeshStandardMaterial({
      map: createBarrierTexture(),
      roughness: 0.5,
      metalness: 0.05,
    });

    this.neonCyan = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });

    this.neonPink = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });

    this.neonGold = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xffb703,
      emissiveIntensity: 1.5,
      roughness: 0.2,
    });

    // High fidelity car paints with clearcoat
    this.carPaintApex = new THREE.MeshPhysicalMaterial({
      color: 0xd90429, // Crimson Red
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    this.carPaintMuscle = new THREE.MeshPhysicalMaterial({
      color: 0x111827, // Matte Midnight Black with gold accent
      metalness: 0.7,
      roughness: 0.35,
      clearcoat: 0.8,
    });

    this.carPaintMoto = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb, // Electric Blue
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
    });
  }

  public setWetRoad(isWet: boolean) {
    if (isWet) {
      this.asphalt.roughness = 0.2;
      this.asphalt.metalness = 0.45;
      this.sidewalk.roughness = 0.3;
    } else {
      this.asphalt.roughness = 0.8;
      this.asphalt.metalness = 0.1;
      this.sidewalk.roughness = 0.85;
    }
  }
}

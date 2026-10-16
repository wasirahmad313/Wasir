import * as THREE from 'three';
import { GesturePosition } from './types';

export interface CharacterRig {
  root: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftForearm?: THREE.Group;
  rightForearm?: THREE.Group;
  gender: 'male' | 'female';
  id: string;
}

/**
 * Creates articulated 3D character rigs with composite parts and materials
 */
export function createMaleHero(): CharacterRig {
  const root = new THREE.Group();
  root.name = 'Leo_MaleHero';

  // Skin material
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xdec1a5,
    roughness: 0.65,
    metalness: 0.05,
  });

  // Black leather jacket material
  const jacketMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.45,
    metalness: 0.2,
  });

  // Dark denim jeans
  const jeansMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.7,
    metalness: 0.05,
  });

  // Sneakers & sunglasses
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
  const darkGlassMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.9 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x271911, roughness: 0.8 });

  // 1. Torso Group
  const torso = new THREE.Group();
  torso.position.y = 0.95;

  // Chest / Jacket
  const chestGeo = new THREE.BoxGeometry(0.52, 0.55, 0.28);
  const chest = new THREE.Mesh(chestGeo, jacketMat);
  chest.castShadow = true;
  torso.add(chest);

  // Inner V-neck shirt
  const shirtGeo = new THREE.BoxGeometry(0.24, 0.4, 0.29);
  const shirt = new THREE.Mesh(shirtGeo, new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  torso.add(shirt);

  // Belt
  const beltGeo = new THREE.BoxGeometry(0.48, 0.08, 0.26);
  const belt = new THREE.Mesh(beltGeo, new THREE.MeshStandardMaterial({ color: 0x3b2f2f, roughness: 0.4 }));
  belt.position.y = -0.28;
  torso.add(belt);

  // 2. Head Group
  const head = new THREE.Group();
  head.position.set(0, 0.45, 0);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.15, 8);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = -0.12;
  head.add(neck);

  // Face
  const faceGeo = new THREE.BoxGeometry(0.26, 0.28, 0.24);
  const face = new THREE.Mesh(faceGeo, skinMat);
  face.castShadow = true;
  head.add(face);

  // Hair
  const hairGeo = new THREE.BoxGeometry(0.28, 0.12, 0.26);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 0.15, -0.01);
  head.add(hair);

  // Aviator sunglasses
  const glassesGeo = new THREE.BoxGeometry(0.24, 0.07, 0.05);
  const glasses = new THREE.Mesh(glassesGeo, darkGlassMat);
  glasses.position.set(0, 0.02, 0.13);
  head.add(glasses);

  torso.add(head);

  // 3. Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 0.2, 0);
  const upperArmGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);
  const leftArmMesh = new THREE.Mesh(upperArmGeo, jacketMat);
  leftArmMesh.position.y = -0.25;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  // Hand
  const handGeo = new THREE.BoxGeometry(0.1, 0.12, 0.1);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.y = -0.55;
  leftArm.add(leftHand);
  torso.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, 0.2, 0);
  const rightArmMesh = new THREE.Mesh(upperArmGeo, jacketMat);
  rightArmMesh.position.y = -0.25;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.y = -0.55;
  rightArm.add(rightHand);
  torso.add(rightArm);

  root.add(torso);

  // 4. Legs
  const legGeo = new THREE.BoxGeometry(0.18, 0.85, 0.18);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.9, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, jeansMat);
  leftLegMesh.position.y = -0.42;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  const shoeGeo = new THREE.BoxGeometry(0.18, 0.12, 0.28);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -0.85, 0.05);
  leftShoe.castShadow = true;
  leftLeg.add(leftShoe);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.9, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, jeansMat);
  rightLegMesh.position.y = -0.42;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -0.85, 0.05);
  rightShoe.castShadow = true;
  rightLeg.add(rightShoe);
  root.add(rightLeg);

  return {
    root,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    gender: 'male',
    id: 'leo',
  };
}

/**
 * Creates articulated 3D female character models with unique styles, outfits & silhouettes
 */
export function createFemaleNPC(
  id: string,
  hairColorHex: number,
  outfitColorHex: number,
  style: 'racer' | 'socialite' | 'cyber' | 'coastal'
): CharacterRig {
  const root = new THREE.Group();
  root.name = `FemaleNPC_${id}`;

  const skinMat = new THREE.MeshStandardMaterial({
    color: id === 'scarlett' ? 0xf5d0b5 : id === 'maya' ? 0xd4a373 : 0xedd6c4,
    roughness: 0.55,
    metalness: 0.05,
  });

  const outfitMat = new THREE.MeshStandardMaterial({
    color: outfitColorHex,
    roughness: style === 'socialite' ? 0.3 : 0.6,
    metalness: style === 'cyber' ? 0.4 : 0.1,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: hairColorHex,
    roughness: 0.7,
  });

  // Torso
  const torso = new THREE.Group();
  torso.position.y = 0.92;

  // Slender upper chest & waist
  const chestGeo = new THREE.BoxGeometry(0.38, 0.48, 0.22);
  const chest = new THREE.Mesh(chestGeo, outfitMat);
  chest.castShadow = true;
  torso.add(chest);

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.4, 0);

  const neckGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.14, 8);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = -0.1;
  head.add(neck);

  const faceGeo = new THREE.BoxGeometry(0.22, 0.24, 0.2);
  const face = new THREE.Mesh(faceGeo, skinMat);
  face.castShadow = true;
  head.add(face);

  // Hairstyle based on character archetype
  if (style === 'racer') {
    // High sporty ponytail
    const hairBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.22), hairMat);
    hairBase.position.set(0, 0.12, 0);
    const ponytail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.45, 6), hairMat);
    ponytail.position.set(0, 0.05, -0.22);
    ponytail.rotation.x = 0.5;
    head.add(hairBase, ponytail);
  } else if (style === 'socialite') {
    // Elegant sweeping hair bun
    const hairBase = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.24), hairMat);
    hairBase.position.set(0, 0.1, -0.02);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), hairMat);
    bun.position.set(0, 0.16, -0.14);
    head.add(hairBase, bun);
  } else if (style === 'cyber') {
    // Cyber headphones + sleek bob
    const hairBob = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.24), hairMat);
    hairBob.position.set(0, 0.04, -0.01);
    const headphones = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.03, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8 })
    );
    headphones.rotation.x = -Math.PI / 2;
    headphones.position.y = 0.1;
    head.add(hairBob, headphones);
  } else {
    // Coastal long wavy hair & sunhat
    const longHair = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.35, 0.24), hairMat);
    longHair.position.set(0, -0.02, -0.04);
    const hat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 })
    );
    hat.position.set(0, 0.16, 0);
    head.add(longHair, hat);
  }

  torso.add(head);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
  const handGeo = new THREE.BoxGeometry(0.08, 0.1, 0.08);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.26, 0.18, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
  leftArmMesh.position.y = -0.22;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.y = -0.48;
  leftArm.add(leftHand);
  torso.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.26, 0.18, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
  rightArmMesh.position.y = -0.22;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.y = -0.48;
  rightArm.add(rightHand);
  torso.add(rightArm);

  root.add(torso);

  // Legs / Skirt / Pants
  const legGeo = new THREE.BoxGeometry(0.14, 0.82, 0.14);
  const legMat = style === 'racer' || style === 'cyber' ? outfitMat : skinMat;

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.12, 0.86, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, legMat);
  leftLegMesh.position.y = -0.4;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  // Shoes / Boots / Heels
  const shoeGeo = new THREE.BoxGeometry(0.13, 0.1, 0.22);
  const shoeMeshL = new THREE.Mesh(shoeGeo, new THREE.MeshStandardMaterial({ color: 0x111827 }));
  shoeMeshL.position.set(0, -0.82, 0.04);
  shoeMeshL.castShadow = true;
  leftLeg.add(shoeMeshL);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.12, 0.86, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, legMat);
  rightLegMesh.position.y = -0.4;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  const shoeMeshR = shoeMeshL.clone();
  rightLeg.add(shoeMeshR);
  root.add(rightLeg);

  return {
    root,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    gender: 'female',
    id,
  };
}

/**
 * Procedural kinematic animation controller
 */
export function animateRig(
  rig: CharacterRig,
  state: 'idle' | 'walk' | 'run' | 'drive' | 'react_hit',
  time: number,
  speed: number = 0
) {
  if (state === 'idle') {
    // Gentle breathing
    rig.torso.position.y = 0.95 + Math.sin(time * 2) * 0.015;
    rig.head.rotation.x = Math.sin(time * 1.5) * 0.03;
    rig.head.rotation.y = Math.sin(time * 0.8) * 0.05;
    rig.leftArm.rotation.x = Math.sin(time * 1.8) * 0.05;
    rig.rightArm.rotation.x = -Math.sin(time * 1.8) * 0.05;
    rig.leftArm.rotation.z = -0.1;
    rig.rightArm.rotation.z = 0.1;
    rig.leftLeg.rotation.x = 0;
    rig.rightLeg.rotation.x = 0;
  } else if (state === 'walk' || state === 'run') {
    const freq = state === 'run' ? 12 : 7;
    const legAmp = state === 'run' ? 0.9 : 0.55;
    const armAmp = state === 'run' ? 0.85 : 0.5;

    rig.torso.position.y = 0.95 + Math.abs(Math.sin(time * freq)) * 0.04;
    rig.head.rotation.x = Math.sin(time * freq) * 0.04;
    rig.head.rotation.y = 0;

    // Opposite leg & arm swings
    rig.leftLeg.rotation.x = Math.sin(time * freq) * legAmp;
    rig.rightLeg.rotation.x = -Math.sin(time * freq) * legAmp;

    rig.leftArm.rotation.x = -Math.sin(time * freq) * armAmp;
    rig.rightArm.rotation.x = Math.sin(time * freq) * armAmp;
    rig.leftArm.rotation.z = -0.15;
    rig.rightArm.rotation.z = 0.15;
  } else if (state === 'drive') {
    // Seated driving posture
    rig.torso.position.y = 0.45;
    rig.leftLeg.rotation.x = -Math.PI / 2 + 0.2;
    rig.rightLeg.rotation.x = -Math.PI / 2 + 0.2;
    rig.leftArm.rotation.x = -0.9;
    rig.rightArm.rotation.x = -0.9;
    rig.leftArm.rotation.y = 0.3;
    rig.rightArm.rotation.y = -0.3;
  } else if (state === 'react_hit') {
    // Stagger / flinch reaction from slap or kick
    rig.head.rotation.y = -0.6;
    rig.head.rotation.x = -0.3;
    rig.torso.position.y = 0.9;
    rig.leftArm.rotation.x = -0.7;
    rig.rightArm.rotation.x = -0.7;
    rig.leftArm.rotation.z = -0.4;
    rig.rightArm.rotation.z = 0.4;
  }
}

/**
 * Applies synchronized interactive social gesture positions between Leo (male) and Female NPC
 */
export function applyDuoGesture(
  maleRig: CharacterRig,
  femaleRig: CharacterRig,
  gesture: GesturePosition,
  progress: number // 0 to 1 or continuous time
) {
  if (gesture === 'warm_hug') {
    // Close chest-to-chest embrace
    maleRig.torso.position.y = 0.95;
    femaleRig.torso.position.y = 0.92;

    maleRig.head.rotation.x = 0.2;
    maleRig.head.rotation.y = 0.25;
    femaleRig.head.rotation.x = 0.2;
    femaleRig.head.rotation.y = -0.25;

    // Male arms wrapping around upper back
    maleRig.leftArm.rotation.x = -1.2;
    maleRig.leftArm.rotation.y = 0.6;
    maleRig.rightArm.rotation.x = -1.2;
    maleRig.rightArm.rotation.y = -0.6;

    // Female arms around male's neck/shoulders
    femaleRig.leftArm.rotation.x = -1.4;
    femaleRig.leftArm.rotation.y = 0.5;
    femaleRig.rightArm.rotation.x = -1.4;
    femaleRig.rightArm.rotation.y = -0.5;

  } else if (gesture === 'deep_hug') {
    // Tighter embrace with rhythmic sway
    const sway = Math.sin(progress * 2) * 0.08;
    maleRig.torso.rotation.z = sway;
    femaleRig.torso.rotation.z = sway;

    maleRig.head.rotation.x = 0.3;
    maleRig.head.rotation.y = 0.35;
    femaleRig.head.rotation.x = 0.3;
    femaleRig.head.rotation.y = -0.35;

    maleRig.leftArm.rotation.x = -1.4;
    maleRig.leftArm.rotation.y = 0.7;
    maleRig.rightArm.rotation.x = -1.4;
    maleRig.rightArm.rotation.y = -0.7;

    femaleRig.leftArm.rotation.x = -1.5;
    femaleRig.leftArm.rotation.y = 0.6;
    femaleRig.rightArm.rotation.x = -1.5;
    femaleRig.rightArm.rotation.y = -0.6;

  } else if (gesture === 'gentle_kiss') {
    // Tender kiss: heads tilted close
    maleRig.head.rotation.x = 0.15;
    maleRig.head.rotation.y = 0.22;
    femaleRig.head.rotation.x = 0.15;
    femaleRig.head.rotation.y = -0.22;

    // Male hands gently holding her waist
    maleRig.leftArm.rotation.x = -0.8;
    maleRig.leftArm.rotation.y = 0.4;
    maleRig.rightArm.rotation.x = -0.8;
    maleRig.rightArm.rotation.y = -0.4;

    // Female hands on his chest
    femaleRig.leftArm.rotation.x = -0.9;
    femaleRig.leftArm.rotation.y = 0.3;
    femaleRig.rightArm.rotation.x = -0.9;
    femaleRig.rightArm.rotation.y = -0.3;

  } else if (gesture === 'long_kiss') {
    // Deep passionate long kiss: slow rhythmic embrace and head rotation
    const intimacyPulse = Math.sin(progress * 3) * 0.04;
    maleRig.head.rotation.x = 0.2 + intimacyPulse;
    maleRig.head.rotation.y = 0.28;
    femaleRig.head.rotation.x = 0.2 + intimacyPulse;
    femaleRig.head.rotation.y = -0.28;

    // Passionate close hold
    maleRig.leftArm.rotation.x = -1.35;
    maleRig.leftArm.rotation.y = 0.55;
    maleRig.rightArm.rotation.x = -1.1; // Hand on cheek/hair
    maleRig.rightArm.rotation.y = -0.7;

    femaleRig.leftArm.rotation.x = -1.4;
    femaleRig.leftArm.rotation.y = 0.65;
    femaleRig.rightArm.rotation.x = -1.4;
    femaleRig.rightArm.rotation.y = -0.65;

    // Soft synchronized swaying
    const danceSway = Math.sin(progress * 1.5) * 0.05;
    maleRig.root.rotation.y += danceSway * 0.01;
    femaleRig.root.rotation.y -= danceSway * 0.01;

  } else if (gesture === 'slow_dance') {
    // Ballroom / romantic slow dance
    const waltz = Math.sin(progress * 2) * 0.1;
    maleRig.root.rotation.y += 0.01;
    femaleRig.root.rotation.y += 0.01;

    maleRig.torso.rotation.z = waltz;
    femaleRig.torso.rotation.z = -waltz;

    // Hand in hand raised, other hand at waist
    maleRig.leftArm.rotation.x = -1.3;
    maleRig.leftArm.rotation.z = -0.8;
    femaleRig.rightArm.rotation.x = -1.3;
    femaleRig.rightArm.rotation.z = 0.8;

    maleRig.rightArm.rotation.x = -0.8;
    maleRig.rightArm.rotation.y = -0.4;
    femaleRig.leftArm.rotation.x = -1.1;
    femaleRig.leftArm.rotation.y = 0.3;

  } else if (gesture === 'sit_together') {
    // Seated together on hood or bench
    maleRig.torso.position.y = 0.45;
    femaleRig.torso.position.y = 0.42;

    maleRig.leftLeg.rotation.x = -Math.PI / 2;
    maleRig.rightLeg.rotation.x = -Math.PI / 2;
    femaleRig.leftLeg.rotation.x = -Math.PI / 2;
    femaleRig.rightLeg.rotation.x = -Math.PI / 2;

    // Male arm around her shoulders
    maleRig.rightArm.rotation.x = -0.9;
    maleRig.rightArm.rotation.y = -0.6;
    femaleRig.head.rotation.z = 0.25; // Leaning head on his shoulder

  } else if (gesture === 'lean_on_car') {
    maleRig.torso.rotation.z = 0.15;
    maleRig.leftLeg.rotation.x = 0.2;
    maleRig.rightLeg.rotation.x = -0.1;
    maleRig.leftArm.rotation.x = -0.7;
    maleRig.rightArm.rotation.x = -0.7;

    femaleRig.torso.rotation.z = -0.15;
    femaleRig.leftArm.rotation.x = -0.6;
    femaleRig.rightArm.rotation.x = -0.6;

  } else if (gesture === 'hold_hands') {
    // Standing side by side, inner hands joined
    maleRig.rightArm.rotation.x = -0.3;
    maleRig.rightArm.rotation.z = 0.25;
    femaleRig.leftArm.rotation.x = -0.3;
    femaleRig.leftArm.rotation.z = -0.25;

    maleRig.head.rotation.y = 0.3;
    femaleRig.head.rotation.y = -0.3;

  } else if (gesture === 'playful_slap') {
    // Leo's arm swings across in slap motion
    if (progress < 0.5) {
      maleRig.rightArm.rotation.x = -1.2;
      maleRig.rightArm.rotation.y = -1.0;
      femaleRig.head.rotation.y = 0;
    } else {
      maleRig.rightArm.rotation.x = -0.8;
      maleRig.rightArm.rotation.y = 1.0;
      // Female reacts with recoil
      femaleRig.head.rotation.y = -0.7;
      femaleRig.torso.rotation.y = -0.3;
      femaleRig.rightArm.rotation.x = -1.0; // hand to cheek
    }

  } else if (gesture === 'roundhouse_kick') {
    // Leo spins right leg in kick
    if (progress < 0.5) {
      maleRig.rightLeg.rotation.x = -1.4;
      maleRig.rightLeg.rotation.z = 0.8;
      maleRig.torso.rotation.y = 0.6;
    } else {
      maleRig.rightLeg.rotation.x = -0.3;
      maleRig.rightLeg.rotation.z = 0.2;
      maleRig.torso.rotation.y = 0;
      femaleRig.torso.position.z -= 0.05;
      femaleRig.head.rotation.x = -0.3;
    }
  }
}

import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Material,
} from 'three';
import { DEFAULT_ANCHORS } from '../config/anchors';
import { EC_CHIP } from '../config/constants';

/**
 * The EC drawn as an exploded package: the QFP body with its lid off, the
 * silicon die inside, and the functional blocks laid out on it.
 *
 * Wildly out of scale — a real Super I/O is a few millimetres square. The point
 * is that the eight-step walkthrough has somewhere physical to happen, and that
 * the blocks sit where the block diagram says they do.
 *
 * The firmware flash is placed *outside* the package on purpose: it genuinely
 * is a separate chip, and that separation is the whole reason an EC survives a
 * failed BIOS update.
 */

const [EC_X, EC_Y, EC_Z] = EC_CHIP.position;

function local(x: number, y: number, z: number): Vector3 {
  return new Vector3(EC_X + x, EC_Y + y, EC_Z + z);
}

interface Materials {
  package: MeshStandardMaterial;
  die: MeshStandardMaterial;
  block: MeshStandardMaterial;
  core: MeshStandardMaterial;
  memory: MeshStandardMaterial;
  lead: MeshStandardMaterial;
  flash: MeshStandardMaterial;
  trace: MeshStandardMaterial;
}

function createMaterials(): Materials {
  return {
    package: new MeshStandardMaterial({ color: 0x14171d, roughness: 0.62, metalness: 0.25 }),
    die: new MeshStandardMaterial({ color: 0x2b3a4a, roughness: 0.34, metalness: 0.55 }),
    block: new MeshStandardMaterial({ color: 0x3c5468, roughness: 0.45, metalness: 0.4 }),
    core: new MeshStandardMaterial({ color: 0x4a7fa8, roughness: 0.38, metalness: 0.45 }),
    memory: new MeshStandardMaterial({ color: 0x486b5c, roughness: 0.45, metalness: 0.4 }),
    lead: new MeshStandardMaterial({ color: 0xc2cad6, roughness: 0.3, metalness: 0.95 }),
    flash: new MeshStandardMaterial({ color: 0x1b1f26, roughness: 0.6, metalness: 0.3 }),
    trace: new MeshStandardMaterial({ color: 0x6f8296, roughness: 0.4, metalness: 0.7 }),
  };
}

function addBox(
  parent: Group,
  material: Material,
  size: [number, number, number],
  position: Vector3,
  name?: string,
): Mesh {
  const mesh = new Mesh(new BoxGeometry(...size), material);
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh);
  return mesh;
}

/** A functional block sitting on the die, sized to hint at its real area. */
function addBlock(
  parent: Group,
  material: Material,
  w: number,
  d: number,
  anchor: Vector3,
  name: string,
): void {
  // Anchors sit slightly above the block so signal paths clear it.
  const position = anchor.clone();
  position.y -= 0.35;
  addBox(parent, material, [w, 0.5, d], position, name);
}

export interface EcInternals {
  group: Group;
  setVisible(visible: boolean): void;
  update(dt: number): void;
  dispose(): void;
}

export function createEcInternals(): EcInternals {
  const m = createMaterials();
  const root = new Group();
  root.name = 'ec-internals';
  root.visible = false;

  const a = DEFAULT_ANCHORS;

  // --- Package body, open at the top ---
  addBox(root, m.package, [EC_CHIP.width, 1.1, EC_CHIP.depth], local(0, -0.3, 0), 'ec-package');

  // Lead frame: pins along all four edges.
  const halfW = EC_CHIP.width / 2;
  const halfD = EC_CHIP.depth / 2;
  for (let i = 0; i < 11; i += 1) {
    const offset = -halfD + 1.4 + i * ((halfD * 2 - 2.8) / 10);
    addBox(root, m.lead, [1.3, 0.16, 0.42], local(-halfW - 0.5, -0.3, offset));
    addBox(root, m.lead, [1.3, 0.16, 0.42], local(halfW + 0.5, -0.3, offset));
    addBox(root, m.lead, [0.42, 0.16, 1.3], local(offset, -0.3, -halfD - 0.5));
    addBox(root, m.lead, [0.42, 0.16, 1.3], local(offset, -0.3, halfD + 0.5));
  }

  // --- The die, recessed inside the package ---
  addBox(root, m.die, [EC_CHIP.width - 3, 0.3, EC_CHIP.depth - 3], local(0, 0.35, 0), 'ec-die');

  // --- Functional blocks on the die ---
  addBlock(root, m.core, 4.2, 4.2, a.ecCore, 'ec-core');
  addBlock(root, m.memory, 2.6, 2.2, a.ecSram, 'ec-sram');
  addBlock(root, m.block, 1.8, 3.4, a.ecGpio, 'ec-gpio');
  addBlock(root, m.block, 2.4, 1.8, a.ecEspi, 'ec-espi');
  addBlock(root, m.block, 1.6, 1.4, a.ecAdc, 'ec-adc');
  addBlock(root, m.block, 1.6, 1.4, a.ecPwm, 'ec-pwm');
  addBlock(root, m.block, 1.6, 1.4, a.ecI2c, 'ec-i2c');
  addBlock(root, m.block, 1.6, 1.8, a.ecKbd, 'ec-kbd');
  addBlock(root, m.block, 1.6, 1.4, a.ecWdt, 'ec-wdt');

  // --- Bond wires: thin links from the die edge out to the pins ---
  for (const [from, to] of [
    [a.ecVsbIn, a.ecCore],
    [a.ecPwrbtnIn, a.ecGpio],
    [a.ecPsonOut, a.ecCore],
  ] as const) {
    const mid = from.clone().lerp(to, 0.5);
    mid.y = Math.max(from.y, to.y) + 0.1;
    const span = from.distanceTo(to);
    const wire = addBox(root, m.trace, [span * 0.55, 0.08, 0.12], mid);
    wire.lookAt(to);
  }

  // --- The firmware flash, a separate package beside the EC ---
  addBox(root, m.flash, [3.2, 0.9, 2.4], local(10.5, 0.1, -2), 'ec-spi-flash');
  for (let i = 0; i < 4; i += 1) {
    const z = -2 - 0.9 + i * 0.6;
    addBox(root, m.lead, [0.9, 0.12, 0.3], local(10.5 - 1.9, -0.2, z));
    addBox(root, m.lead, [0.9, 0.12, 0.3], local(10.5 + 1.9, -0.2, z));
  }

  return {
    group: root,
    setVisible(visible: boolean) {
      root.visible = visible;
    },
    update() {
      // Nothing animates on its own; the signal paths carry the motion.
    },
    dispose() {
      root.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
      for (const material of Object.values(m) as Material[]) material.dispose();
      root.removeFromParent();
    },
  };
}

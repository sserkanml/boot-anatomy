import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type Material,
} from 'three';
import { DEFAULT_ANCHORS } from '../config/anchors';
import { BOARD, COLORS, FLOOR_Y } from '../config/constants';
import { createPcbTexture } from './textures';

const TOP = BOARD.thickness / 2;

/** Shared placeholder materials — all discarded once the real model arrives. */
function createMaterials() {
  const pcbTexture = createPcbTexture();
  pcbTexture.repeat.set(1, 1);

  return {
    pcbTop: new MeshStandardMaterial({
      map: pcbTexture,
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0.12,
    }),
    pcbSide: new MeshStandardMaterial({
      color: COLORS.pcb,
      roughness: 0.8,
      metalness: 0.05,
    }),
    dark: new MeshStandardMaterial({ color: 0x1b1f26, roughness: 0.6, metalness: 0.3 }),
    plastic: new MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.75, metalness: 0.05 }),
    slot: new MeshStandardMaterial({ color: 0x1d2530, roughness: 0.55, metalness: 0.2 }),
    metal: new MeshStandardMaterial({ color: COLORS.metal, roughness: 0.32, metalness: 0.95 }),
    heatsink: new MeshStandardMaterial({ color: 0x39414d, roughness: 0.42, metalness: 0.8 }),
    connector: new MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.65, metalness: 0.05 }),
    green: new MeshStandardMaterial({ color: 0x2f7d5b, roughness: 0.6, metalness: 0.1 }),
  };
}

type Materials = ReturnType<typeof createMaterials>;

/** Adds a simple box component sitting on the board surface. */
function addBlock(
  parent: Group,
  material: Material,
  size: [number, number, number],
  position: [number, number, number],
  name?: string,
): Mesh {
  const [w, h, d] = size;
  const mesh = new Mesh(new BoxGeometry(w, h, d), material);
  mesh.position.set(position[0], position[1] + h / 2, position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh);
  return mesh;
}

function addComponents(group: Group, m: Materials): void {
  const a = DEFAULT_ANCHORS;

  // --- CPU socket + IHS ---
  addBlock(group, m.slot, [7, 0.5, 7], [a.cpu.x, TOP, a.cpu.z], 'cpu-socket');
  addBlock(group, m.metal, [4.4, 0.4, 4.4], [a.cpu.x, TOP + 0.5, a.cpu.z], 'cpu-ihs');

  // --- VRM: chokes + heatsink ---
  for (let i = 0; i < 6; i += 1) {
    addBlock(group, m.dark, [1.1, 0.9, 1.1], [a.vrm.x + i * 1.4 - 3.5, TOP, a.vrm.z], 'choke');
  }
  addBlock(group, m.heatsink, [9, 1.6, 2], [a.vrm.x, TOP, a.vrm.z - 1.8], 'vrm-heatsink');

  // --- DIMM slots: 133mm connectors running along X, stacked along Z ---
  for (let i = 0; i < 4; i += 1) {
    addBlock(
      group,
      m.slot,
      [10.5, 1.1, 0.75],
      [a.ram.x, TOP, a.ram.z + i * 1.25 - 1.9],
      `dimm-${i}`,
    );
  }

  // --- Chipset and its heatsink ---
  addBlock(group, m.dark, [4, 0.5, 4], [a.chipset.x, TOP, a.chipset.z], 'pch');
  addBlock(group, m.heatsink, [4.6, 0.9, 4.6], [a.chipset.x, TOP + 0.5, a.chipset.z], 'pch-heatsink');

  // --- M.2 NVMe SSD ---
  addBlock(group, m.green, [1.8, 0.22, 6], [a.m2.x, TOP + 0.15, a.m2.z], 'm2-ssd');
  addBlock(group, m.slot, [1.4, 0.5, 0.7], [a.m2.x, TOP, a.m2.z - 3.2], 'm2-slot');

  // --- PCIe x16: card edge runs along X, away from the rear I/O ---
  addBlock(group, m.slot, [9, 1.1, 1.8], [a.pcie.x, TOP, a.pcie.z], 'pcie-x16');

  // --- Power connectors ---
  addBlock(group, m.connector, [2.2, 1.8, 5.4], [a.atx24.x, TOP, a.atx24.z], 'atx24-connector');
  addBlock(group, m.connector, [1.9, 1.6, 3.8], [a.eps12v.x, TOP, a.eps12v.z], 'eps12v-connector');

  // --- Super I/O / EC chip and the front panel header ---
  addBlock(group, m.dark, [2.4, 0.45, 2.4], [a.superio.x, TOP, a.superio.z], 'super-io');
  addBlock(group, m.plastic, [1.3, 0.8, 2.6], [a.fpanel.x, TOP, a.fpanel.z], 'f-panel');

  // --- Rear I/O panel: along the far Z edge, offset toward +X like the model ---
  addBlock(group, m.metal, [15.4, 2.6, 0.4], [4.3, TOP, -BOARD.depth / 2 + 0.3], 'rear-io');
}

/**
 * The physical power button on the case front panel. It is not part of the
 * motherboard model, so (like the PSU) it always stays in the scene as a
 * representative prop.
 */
export function createPowerButtonProp(): { group: Group; dispose(): void } {
  const group = new Group();
  group.name = 'power-button-prop';
  const anchor = DEFAULT_ANCHORS.powerButton;

  const plastic = new MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.75, metalness: 0.05 });
  const dark = new MeshStandardMaterial({ color: 0x1b1f26, roughness: 0.6, metalness: 0.3 });

  const base = new Mesh(new CylinderGeometry(1.5, 1.6, 0.5, 32), plastic);
  base.position.y = 0.25;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const cap = new Mesh(new CylinderGeometry(1.15, 1.15, 0.45, 32), dark);
  cap.position.y = 0.6;
  cap.castShadow = true;
  group.add(cap);

  // Rest it on the floor
  group.position.set(anchor.x, FLOOR_Y, anchor.z);

  return {
    group,
    dispose() {
      group.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
      plastic.dispose();
      dark.dispose();
    },
  };
}

export interface PlaceholderBoard {
  group: Group;
  dispose(): void;
}

/**
 * The stand-in motherboard used until the real GLB arrives: a PCB slab plus
 * simple component blocks placed at the anchor positions.
 *
 * Once the model is loaded, BoardScene removes this group from the scene and
 * disposes it.
 */
export function createPlaceholderBoard(): PlaceholderBoard {
  const materials = createMaterials();
  const group = new Group();
  group.name = 'placeholder-board';

  // BoxGeometry material order: [+X, -X, +Y, -Y, +Z, -Z] — traces on the top face.
  const board = new Mesh(
    new BoxGeometry(BOARD.width, BOARD.thickness, BOARD.depth),
    [
      materials.pcbSide,
      materials.pcbSide,
      materials.pcbTop,
      materials.pcbSide,
      materials.pcbSide,
      materials.pcbSide,
    ],
  );
  board.name = 'pcb';
  board.castShadow = true;
  board.receiveShadow = true;
  group.add(board);

  addComponents(group, materials);

  return {
    group,
    dispose() {
      group.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
      for (const material of Object.values(materials)) {
        if ('map' in material && material.map) material.map.dispose();
        material.dispose();
      }
    },
  };
}

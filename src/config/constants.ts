/** Scene dimensions and color palette — every module reads from here. */

/**
 * An ATX motherboard is 305x244mm. The 305mm edge runs along X and the 244mm
 * edge along Z, matching the aspect ratio of the bundled GLB so the placeholder
 * board and the real model are interchangeable.
 */
export const BOARD = {
  width: 24,
  depth: 19,
  thickness: 0.4,
} as const;

/** An ATX PSU is ~150x86x140mm. */
export const PSU_BOX = {
  width: 15,
  height: 8.6,
  depth: 14,
  position: [22, 2.8, 3] as const,
};

/** Ground level of the scene. The motherboard and PSU sit on top of it. */
export const FLOOR_Y = -1.5;

/**
 * Height of the signal paths above the PCB surface. Tall enough to clear the
 * heatsinks and shrouds of a real motherboard model.
 */
export const SIGNAL_HEIGHT = 2.4;

/** Placeholder monitor — behind the board, facing the camera. */
export const MONITOR = {
  width: 22,
  height: 13,
  position: [-1, 9.5, -19] as const,
};

export const COLORS = {
  background: 0x05070c,
  fog: 0x05070c,
  floor: 0x0a0e16,
  grid: 0x16324a,
  pcb: 0x0f3d2e,
  pcbTrace: 0x1f7a5c,
  socket: 0x2b3138,
  metal: 0xb8c0cc,
  psuShell: 0x23272e,
} as const;

/**
 * Rail and signal colors, faithful to the ATX color code:
 * +12V yellow, +5V red, +3.3V orange, PS_ON# green, PWR_OK gray/blue.
 */
export const RAIL_COLORS = {
  '+5VSB': 0xa77bff,
  '+12V': 0xffd166,
  '+5V': 0xff5c5c,
  '+3.3V': 0xff9f45,
  vcore: 0xffb347,
  'PS_ON#': 0x3ddc84,
  PWR_OK: 0x5ec8ff,
  logic: 0xe8eef7,
  data: 0x8be9fd,
  firmware: 0xffc857,
  kernel: 0x7bd88f,
  video: 0x63b3ff,
} as const;

export const CAMERA = {
  fov: 42,
  near: 0.1,
  far: 500,
  position: [27, 21, 30] as const,
  target: [1, 2, -1] as const,
  minDistance: 14,
  maxDistance: 95,
} as const;

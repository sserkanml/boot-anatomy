import { Vector3 } from 'three';
import type { AnchorId } from '../types';
import { PSU_BOX, SIGNAL_HEIGHT } from './constants';

/**
 * Anchors inside the PSU are authored in the unit's local frame (origin at the
 * center of the box, +Z toward the rear where the mains inlet sits) and then
 * offset into world space, so moving the PSU moves its internals with it.
 */
const [PSU_X, PSU_Y, PSU_Z] = PSU_BOX.position;
const inPsu = (x: number, y: number, z: number): Vector3 =>
  new Vector3(PSU_X + x, PSU_Y + y, PSU_Z + z);

/**
 * Anchor layout, expressed in the scene's coordinate frame:
 * X is the 305mm edge (-12 left .. +12 right), Z is the 244mm edge
 * (-9.5 rear I/O edge .. +9.5 front edge), origin at the board center.
 *
 * The CPU / RAM / M.2 / chipset values below were measured from the bundled
 * GLB, so the placeholder board and the real model agree on where things are.
 * The remaining points are placed by hand from standard ATX geometry, because
 * the model has no distinguishable geometry to bind them to — see
 * MODEL_ANCHOR_HINTS.
 */
export const DEFAULT_ANCHORS: Record<AnchorId, Vector3> = {
  // Off-board props
  psu: new Vector3(14.5, 3.6, 2),
  powerButton: new Vector3(19, 1.2, 10),
  display: new Vector3(-1, 4, -14),

  // Measured from the model
  cpu: new Vector3(5.2, SIGNAL_HEIGHT, 1),
  ram: new Vector3(5.2, SIGNAL_HEIGHT, 6.5),
  chipset: new Vector3(-4.8, SIGNAL_HEIGHT, 6.1),
  m2: new Vector3(-0.8, SIGNAL_HEIGHT, -0.2),

  // Placed by hand
  vrm: new Vector3(7.5, SIGNAL_HEIGHT, -4.5),
  eps12v: new Vector3(-8, SIGNAL_HEIGHT, -8.3),
  atx24: new Vector3(10.8, SIGNAL_HEIGHT, 3.5),
  pcie: new Vector3(-5.5, SIGNAL_HEIGHT, 1.2),
  superio: new Vector3(9.5, SIGNAL_HEIGHT, 7.8),
  fpanel: new Vector3(11, SIGNAL_HEIGHT, 8.6),

  // --- Inside the PSU ---
  // The wall outlet sits behind the unit, close enough that the PSU view frames
  // both it and the internals — the mains run is part of the story.
  wallSocket: new Vector3(PSU_X + 2, 6, PSU_Z + 14),
  // Primary side runs down the +X half, from the rear inlet to the front.
  psuInlet: inPsu(3.6, -2.4, 6.4),
  psuEmi: inPsu(3.6, -2.4, 3.4),
  psuRectifier: inPsu(3.6, -1.4, 0.6),
  psuPfc: inPsu(3.6, -1.9, -2.2),
  psuSwitching: inPsu(3.6, -1.9, -4.9),
  // The transformers straddle x=0, the only things energy crosses on.
  psuTransformer: inPsu(0, -1.7, -4.9),
  psuStandby: inPsu(0, -2.4, 1.6),
  // Secondary side runs back up the -X half toward the output cables.
  psuSecondary: inPsu(-3.6, -1.9, -4.9),
  psuFilter: inPsu(-3.6, -1.9, -1.6),
  psuSupervisor: inPsu(-3.6, -2.6, 1.4),
  psuOutput: inPsu(-3.6, -2.2, 4.6),
};

/** Anchors labelled while the camera is framing the motherboard. */
export const BOARD_VIEW_ANCHORS: AnchorId[] = [
  'psu',
  'atx24',
  'eps12v',
  'powerButton',
  'fpanel',
  'superio',
  'chipset',
  'cpu',
  'vrm',
  'ram',
  'm2',
  'pcie',
];

/** Anchors labelled while the camera is inside the PSU. */
export const PSU_VIEW_ANCHORS: AnchorId[] = [
  'wallSocket',
  'psuInlet',
  'psuEmi',
  'psuRectifier',
  'psuPfc',
  'psuSwitching',
  'psuTransformer',
  'psuStandby',
  'psuSecondary',
  'psuFilter',
  'psuSupervisor',
  'psuOutput',
  'atx24',
];

/** Human-readable names shown in the label layer. */
export const ANCHOR_LABELS: Record<AnchorId, string> = {
  psu: 'PSU',
  atx24: 'ATX 24-pin',
  eps12v: 'EPS 12V',
  powerButton: 'Power Button',
  fpanel: 'F_PANEL',
  superio: 'Super I/O / EC',
  chipset: 'Chipset (PCH)',
  cpu: 'CPU',
  vrm: 'VRM',
  ram: 'DIMM',
  m2: 'M.2 NVMe',
  pcie: 'PCIe x16',
  display: 'Monitor',

  wallSocket: 'Wall Socket · 230 V',
  psuInlet: 'AC Inlet',
  psuEmi: 'EMI Filter',
  psuRectifier: 'Bridge + Bulk Caps',
  psuPfc: 'Active PFC',
  psuSwitching: 'Switching MOSFETs',
  psuTransformer: 'Main Transformer',
  psuStandby: 'Standby Flyback',
  psuSecondary: 'Rectification',
  psuFilter: 'LC Filter',
  psuSupervisor: 'Supervisory IC',
  psuOutput: 'Output Block',
};

/**
 * Name patterns used to derive anchor coordinates from the loaded GLB.
 * AnchorRegistry.bindFromModel() prefers exact name matches and falls back to
 * substring matches, then unions the bounding boxes of everything it matched —
 * so a hint list can legitimately cover several objects (all four DIMMs, for
 * instance).
 *
 * The bundled Sketchfab model exports objects as `<node>_<Material>_0`, which
 * means material names are matchable here too (`BoardChipsetM` is the only way
 * to find the chipset — its node is called `pCube123`).
 *
 * Anchors missing from this map keep their hand-placed DEFAULT_ANCHORS values.
 */
export const MODEL_ANCHOR_HINTS: Partial<Record<AnchorId, string[]>> = {
  cpu: ['cpu', 'cpu_basem', 'cpulidm'],
  ram: ['ram', 'ram1', 'ram2', 'ram3', 'ram2m', 'ram3m', 'ram4m'],
  m2: ['m2', 'm2_basem', 'm2_chip1m'],
  chipset: ['boardchipsetm'],
};

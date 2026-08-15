import type { Localized } from '../i18n';

/**
 * Named connection points in the scene.
 *
 * Signal routes are defined with these names rather than coordinates, so when
 * the real GLB model arrives only the AnchorRegistry's source changes — the
 * boot step data file is never touched.
 */
export type AnchorId =
  | 'psu' // Cable outlet on the PSU body
  | 'atx24' // 24-pin main power connector
  | 'eps12v' // 8-pin CPU (EPS) power connector
  | 'powerButton' // Physical button on the case front panel
  | 'fpanel' // F_PANEL header on the motherboard
  | 'superio' // Super I/O / Embedded Controller
  | 'chipset' // PCH / chipset
  | 'cpu' // CPU socket
  | 'vrm' // CPU power VRM
  | 'ram' // DIMM slots
  | 'm2' // M.2 NVMe SSD
  | 'pcie' // PCIe x16 (graphics card)
  | 'display' // Monitor (off-board)
  // --- Inside the PSU, revealed in the 'psu' view ---
  | 'wallSocket' // Mains outlet on the wall
  | 'psuInlet' // IEC socket at the rear of the unit
  | 'psuEmi' // EMI filter board
  | 'psuRectifier' // Bridge rectifier + bulk capacitors
  | 'psuPfc' // Active PFC choke and switches
  | 'psuSwitching' // Primary switching MOSFETs
  | 'psuTransformer' // Main transformer, straddling the isolation barrier
  | 'psuSecondary' // Secondary side rectification
  | 'psuFilter' // Output inductors and capacitors
  | 'psuStandby' // Standby flyback transformer
  | 'psuSupervisor' // Supervisory IC
  | 'psuOutput'; // Output connector block

/** Top-level phases of the boot chain — used for colors/badges in the UI. */
export type Phase = 'psu' | 'standby' | 'power' | 'firmware' | 'os';

/** Which part of the scene a step is staged in. */
export type SceneView = 'board' | 'psu';

/** Definition of a single visual signal path. */
export interface SignalSpec {
  /** Anchors to traverse in order. Must contain at least two entries. */
  route: AnchorId[];
  /** Path color (hex). Picking from RAIL_COLORS keeps things consistent. */
  color: number;
  /** Short label shown on the path, e.g. "PS_ON#" */
  label?: string;
  /** Number of flowing particles. Pass 0 to draw the path only. */
  particles?: number;
  /** Start delay as a fraction of the step duration (0..1). */
  delay?: number;
  /** Draw duration as a fraction of the step duration (0..1). Defaults to the remaining time. */
  spread?: number;
  /** Should it stay on screen after the step ends? (true for power rails) */
  persist?: boolean;
  /**
   * Starts fully drawn, with no reveal animation. For showing states that are
   * "already flowing", such as standby power.
   */
  instant?: boolean;
  /** Path thickness multiplier. */
  thickness?: number;
}

/** A single step in the boot chain. */
export interface BootStep {
  id: string;
  phase: Phase;
  /** Heading shown in the info panel. */
  title: Localized;
  /**
   * Technical name of the signal, e.g. "PWR_OK". Rendered as a badge, and never
   * translated — it is the name of the thing, not a description of it.
   */
  signal?: string;
  /** One or two sentences of technical explanation. */
  description: Localized;
  /** Step duration (ms). */
  duration: number;
  /** Signal paths played during this step. */
  signals: SignalSpec[];
  /** Components highlighted throughout the step (their labels light up). */
  highlight?: AnchorId[];
  /** Fake console/POST output — printed line by line in the bottom-right panel. */
  console?: string[];
  /** Which screen the monitor shows during this step. */
  screen?: 'off' | 'post' | 'boot' | 'login';
  /**
   * Where the camera is staged for this step. Steps inside the PSU set 'psu',
   * which flies the camera in and makes the PSU shell transparent.
   */
  view?: SceneView;
  /**
   * Nested steps shown under this one in the timeline. They are not part of the
   * main chain's playback: selecting one enters that step's `view` and plays it
   * there, which is how the PSU internals stay a detour rather than a delay.
   */
  substeps?: BootStep[];
  /** Shows a button that opens the block-diagram dialog for this step. */
  schematic?: boolean;
}

export type BootState = 'idle' | 'running' | 'complete';

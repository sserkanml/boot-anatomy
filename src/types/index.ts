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
  | 'display'; // Monitor (off-board)

/** Top-level phases of the boot chain — used for colors/badges in the UI. */
export type Phase = 'standby' | 'power' | 'firmware' | 'os';

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
  title: string;
  /** Technical name of the signal, e.g. "PWR_OK". Rendered as a badge. */
  signal?: string;
  /** One or two sentences of technical explanation. */
  description: string;
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
}

export type BootState = 'idle' | 'running' | 'complete';

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
  | 'psuOutput' // Output connector block
  // --- Inside the EC, revealed in the 'ec' view ---
  | 'ecVsbIn' // Standby power pin
  | 'ecPwrbtnIn' // PWRBTN# pin from the front panel
  | 'ecGpio' // GPIO bank on the die
  | 'ecCore' // The processor core
  | 'ecSram' // On-die working memory
  | 'ecFlash' // External SPI NOR holding EC firmware
  | 'ecEspi' // LPC / eSPI interface to the PCH
  | 'ecAdc'
  | 'ecPwm'
  | 'ecI2c'
  | 'ecKbd'
  | 'ecWdt'
  | 'ecPsonOut' // Pin driving PS_ON#
  // --- Board power management, revealed in the 'vrm' view ---
  | 'sequencer' // Chip ordering the rails
  | 'vcore' // CPU core voltage
  | 'vccsa' // System agent
  | 'vccio' // I/O voltage
  | 'vddq' // Memory voltage
  // --- Inside the CPU, revealed in the 'cpu' view ---
  | 'spiFlash' // SPI NOR holding the firmware image
  | 'cpuPll' // Internal PLLs feeding the clock domains
  | 'cpuBsp' // The core elected Bootstrap Processor
  | 'cpuAp' // The cores parked in wait-for-SIPI
  | 'cpuUcode' // Microcode patch RAM
  | 'cpuCache'; // L2/L3 used as Cache-as-RAM before DRAM exists

/** Top-level phases of the boot chain — used for colors/badges in the UI. */
export type Phase = 'psu' | 'standby' | 'power' | 'firmware' | 'os';

/** Which part of the scene a step is staged in. */
export type SceneView = 'board' | 'psu' | 'ec' | 'vrm' | 'cpu' | 'coreboot';

/**
 * A stage in a walkthrough dialog: one entry in the list, one highlighted set
 * of blocks in the diagram, one card of prose.
 */
export interface ModalStage {
  id: string;
  title: Localized;
  badge: Localized | string;
  description: Localized;
  /** Optional callout tying the stage back to the wider boot chain. */
  note?: Localized;
  /** SVG `data-node` ids lit while this stage is active. */
  nodes: string[];
  /** SVG `data-edge` ids animated while this stage is active. */
  edges?: string[];
}

/**
 * The minimum a nested stage has to expose to be listed under its parent in the
 * timeline. Both full BootSteps and ModalStages satisfy it, which is what lets
 * the PSU chain and the EC walkthrough hang off the same mechanism.
 */
export interface SubstepRef {
  id: string;
  title: Localized;
}

/** Where a step's nested stages are explored. */
export type SubstepAction = 'psu' | 'ec' | 'psu-powerup' | 'vrm' | 'cpu' | 'coreboot';

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
   * Name of the signal, rendered as a badge. Pure technical names ("PWR_OK",
   * "start_kernel()") are plain strings and stay identical in both languages;
   * the few descriptive ones carry a translation.
   */
  signal?: string | Localized;
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
   * Nested stages shown under this one in the timeline. They are not part of
   * the main chain's playback: selecting one opens wherever `substepAction`
   * points, which is how these detours stay detours rather than delays.
   */
  substeps?: SubstepRef[];
  /** Which walkthrough a nested stage opens in. */
  substepAction?: SubstepAction;
  /** Shows a button that opens the block-diagram dialog for this step. */
  schematic?: boolean;
  /**
   * Where this step lives in source, as a repo-relative path. Only set on steps
   * that really are a function or an entry symbol — not on ones that describe a
   * region inside one, where a line range would imply more precision than the
   * explanation carries.
   */
  source?: string;
  /**
   * Nesting level in the timeline. 0 is a section step, 1 is one of the stages
   * that belong to it. Purely presentational — the chain itself is flat, so
   * every step plays in order regardless of depth.
   */
  depth?: 0 | 1;
}

export type BootState = 'idle' | 'running' | 'complete';

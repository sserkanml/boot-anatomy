/**
 * The internals of the power supply, as a chain of stages from the wall socket
 * to the DC rails. Shown in the PSU modal, which is opened by clicking the PSU
 * in the scene.
 *
 * `nodes` and `edges` reference element ids in the SVG built by
 * `src/ui/psuDiagram.ts`; keep the two files in sync when adding a stage.
 */
export interface PsuStage {
  id: string;
  /** Heading in the detail panel and label in the stage list. */
  title: string;
  /** Short state of the energy at this point, rendered as a badge. */
  badge: string;
  description: string;
  /** SVG node ids highlighted while this stage is active. */
  nodes: string[];
  /** SVG edge ids animated while this stage is active. */
  edges?: string[];
  /** Cross-reference back to the boot chain, when there is one. */
  bootNote?: string;
}

export const PSU_STAGES: PsuStage[] = [
  {
    id: 'ac-emi',
    title: 'AC Input & EMI Filter',
    badge: '230 V AC',
    description:
      'Mains AC arrives from the wall socket and passes straight into a filter stage built from common-mode chokes and capacitors. It stops the supply\'s own switching noise from leaking back out into the grid, and grid noise from getting in. Many units also put an NTC inrush limiter here, to soften the surge of current that flows while the bulk capacitors charge on the very first power-up.',
    nodes: ['ac', 'emi'],
    edges: ['e-ac-emi'],
  },
  {
    id: 'rectifier',
    title: 'Bridge Rectifier & Bulk Capacitors',
    badge: 'pulsating DC',
    description:
      'Four diodes fold the AC sine wave into pulsating DC — still rippling, but now always positive. That raw DC is banked in the bulk capacitors: the large cylindrical cans that dominate the inside of the unit, typically rated somewhere in the 200–450 V range.',
    nodes: ['rectifier'],
    edges: ['e-emi-rect'],
  },
  {
    id: 'pfc',
    title: 'Active Power Factor Correction',
    badge: '≈400 V DC',
    description:
      'A small boost converter shapes the current waveform to follow the voltage waveform, pulling the power factor toward 1 so the current drawn from the grid is clean. It also regulates the bulk rail to a steady 380–400 V DC, which is what absorbs the difference between a 110 V and a 230 V supply — the reason modern units are universal input with no voltage selector switch.',
    nodes: ['pfc'],
    edges: ['e-rect-pfc'],
  },
  {
    id: 'switching',
    title: 'Primary Switching Stage',
    badge: '50–150 kHz',
    description:
      'This is where the "switched-mode" part actually happens. MOSFETs chop the ~400 V DC at high frequency — a half-bridge, or an LLC resonant converter in newer and more efficient designs. The DC becomes a high-frequency AC waveform purely so the transformer that follows can be small: core size scales inversely with frequency, so a tiny transformer does the job a huge 50 Hz one would otherwise need to.',
    nodes: ['switching'],
    edges: ['e-pfc-sw'],
    bootNote: 'PS_ON# is the signal that switches this stage on.',
  },
  {
    id: 'transformer',
    title: 'Transformer & Galvanic Isolation',
    badge: 'isolation barrier',
    description:
      'The high-frequency waveform crosses a ferrite transformer that does two jobs at once. It steps the voltage down toward the levels that will become 12 V, 5 V and 3.3 V — and it galvanically isolates the output side from the mains side. There is no electrical path across it, only magnetic coupling. Without that, every metal surface in the case would be sitting at mains potential.',
    nodes: ['transformer', 'barrier'],
    edges: ['e-sw-tr'],
  },
  {
    id: 'secondary',
    title: 'Secondary Rectification & Filtering',
    badge: '+12V / +5V / +3.3V',
    description:
      'On the far side of the barrier, Schottky diodes — or synchronous rectification using MOSFETs in higher-efficiency units — turn the low-voltage HF AC back into DC, and LC filters smooth it into clean rails. In modern designs only +12 V comes off the transformer directly; +5 V and +3.3 V are derived from it by buck converters. Older units wound all three rails separately, a design known as group regulation.',
    nodes: ['secondary', 'filter'],
    edges: ['e-tr-sec', 'e-sec-filt'],
  },
  {
    id: 'standby',
    title: 'Standby Converter — Separate, Small, Always On',
    badge: '+5VSB',
    description:
      'The +5VSB rail comes from a completely separate miniature copy of the whole circuit: a small flyback converter with its own transformer, its own MOSFET and its own controller. It runs the entire time the unit is plugged in, even with the PFC and main switching stage shut down. It only has to feed the board\'s sleep-mode logic — the EC/PCH, Wake-on-LAN, the real-time clock — so a couple of amps is plenty. This is why you can see two transformers inside a PSU: the large main one, and a tiny standby one beside it.',
    nodes: ['standby'],
    edges: ['e-rect-sb', 'e-sb-out'],
    bootNote: 'This is the rail that keeps the EC awake in S5, listening for the power button.',
  },
  {
    id: 'feedback',
    title: 'Feedback Loop & Regulation',
    badge: 'optocoupler',
    description:
      'To hold the outputs steady, a feedback signal travels from the secondary side back to the primary through an optocoupler — critical here, because that information has to cross the isolation barrier on light rather than copper. The primary-side PWM controller trims its switching frequency or duty cycle in response, so the rails hold their voltage even when the CPU suddenly slams into a high-power state.',
    nodes: ['opto', 'switching'],
    edges: ['e-fb'],
  },
  {
    id: 'supervisor',
    title: 'Supervisory IC — Where PWR_OK Comes From',
    badge: 'PWR_OK',
    description:
      'A separate supervisory IC watches every rail continuously and shuts the unit down the moment a threshold is crossed: OVP for overvoltage, UVP for undervoltage, OCP for overcurrent, OTP for overtemperature, SCP for a short circuit. That same chip produces PWR_OK, raising it only once every rail has passed its checks and settled.',
    nodes: ['supervisor'],
    edges: ['e-sup-mon1', 'e-sup-mon2', 'e-sup-out'],
    bootNote: 'This is the signal the chipset waits for before releasing the CPU from reset.',
  },
  {
    id: 'outputs',
    title: 'Output Connectors',
    badge: 'to the motherboard',
    description:
      'The regulated rails fan out to the 24-pin main connector and the auxiliary ones: EPS 4/8-pin for the CPU, PCIe 6/8-pin for the graphics card, plus SATA and Molex. In high-power systems the CPU and GPU get their own dedicated +12 V runs, because carrying that much current through the 24-pin connector alone is not practical.',
    nodes: ['outputs'],
    edges: ['e-filt-out'],
  },
];

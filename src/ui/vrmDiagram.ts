/**
 * Block diagram of a CPU voltage regulator module.
 *
 * The layout mirrors what the VRM actually is: one controller on the left
 * fanning out into four identical phases, and those phases converging again on
 * a single output plane under the socket. Drawing the phases as four parallel
 * rows rather than one representative row is the whole point — the reason a
 * VRM looks the way it does on a board is that the work is divided.
 *
 * The rails the chipset needs sit below, and the two feedback paths that close
 * the loop — sense back to the controller, PWRGD forward to the sequencer —
 * run above and below so they never cross a phase.
 *
 * Element ids here are referenced by `nodes` / `edges` in config/vrmStages.ts.
 * The `psu-*` class names are shared diagram chrome, not PSU-specific.
 */

interface DiagramNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  caption: string;
}

/** Vertical centre of each phase row. */
const PHASE_Y = [176, 246, 316, 386];
const PHASE_H = 52;

const NODES: DiagramNode[] = [
  // Input side.
  { id: 'eps', x: 20, y: 246, w: 150, h: 122, title: 'EPS 12V', caption: 'from the PSU' },
  { id: 'pwrok', x: 20, y: 40, w: 180, h: 58, title: 'PWR_OK', caption: 'rails are stable' },
  { id: 'sequencer', x: 240, y: 40, w: 190, h: 58, title: 'Sequencer', caption: 'enables in order' },

  // The controller and its inputs.
  {
    id: 'controller',
    x: 240,
    y: 176,
    w: 190,
    h: 192,
    title: 'PWM Controller',
    caption: 'one clock, four outputs',
  },
  { id: 'vid', x: 240, y: 430, w: 190, h: 56, title: 'VID / SVID', caption: 'CPU asks for a voltage' },

  // Four identical phases: driver, switches, inductor.
  ...PHASE_Y.map((y, i) => ({
    id: `phase${i + 1}`,
    x: 500,
    y,
    w: 300,
    h: PHASE_H,
    title: `Phase ${i + 1}`,
    caption: 'driver · MOSFETs · choke',
  })),

  // Output plane and the load.
  { id: 'plane', x: 870, y: 176, w: 150, h: 262, title: 'Output Plane', caption: 'caps under the socket' },
  { id: 'vcore', x: 1090, y: 176, w: 170, h: 112, title: 'VCORE', caption: '0.7–1.4 V · up to 200 A' },
  { id: 'vccsa', x: 1090, y: 326, w: 170, h: 52, title: 'VCCSA / VCCIO', caption: 'system agent · I/O' },
  { id: 'vddq', x: 1090, y: 398, w: 170, h: 52, title: 'VDDQ', caption: 'to the DIMMs' },

  // What closes the loop.
  { id: 'sense', x: 870, y: 486, w: 300, h: 52, title: 'Remote Sense', caption: 'measured at the die' },
  { id: 'pwrgd', x: 500, y: 40, w: 300, h: 58, title: 'PWRGD per rail', caption: 'all-good gate' },
];

interface DiagramEdge {
  id: string;
  d: string;
  variant?: 'standby' | 'feedback' | 'monitor' | 'pwrok' | 'enable';
  label?: { text: string; x: number; y: number };
}

const EDGES: DiagramEdge[] = [
  // PWR_OK arrives and releases the sequencer, which enables the controller.
  { id: 'e-pwrok-seq', d: 'M200,69 H240', variant: 'pwrok' },
  { id: 'e-seq-ctrl', d: 'M335,98 V176', variant: 'enable', label: { text: 'enable', x: 300, y: 140 } },

  // Input power into the phases.
  { id: 'e-eps-ctrl', d: 'M170,307 H240' },
  // The gap between the controller and the phases is only 70px wide, so the
  // label for the fan-out sits above the first phase rather than inside it.
  ...PHASE_Y.map((y, i) => ({
    id: `e-ctrl-p${i + 1}`,
    d: `M430,${y + PHASE_H / 2} H500`,
    label: i === 0 ? { text: 'PWM, 90° apart', x: 650, y: 166 } : undefined,
  })),

  // Phases converge on the output plane.
  ...PHASE_Y.map((y, i) => ({
    id: `e-p${i + 1}-plane`,
    d: `M800,${y + PHASE_H / 2} H870`,
  })),

  // The plane feeds the die and the other rails.
  { id: 'e-plane-vcore', d: 'M1020,232 H1090', label: { text: 'VCORE', x: 1055, y: 220 } },
  { id: 'e-plane-vccsa', d: 'M1020,352 H1090' },
  { id: 'e-plane-vddq', d: 'M1020,400 V424 H1090' },

  // Remote sense: measured at the load, fed back to the controller.
  {
    id: 'e-sense-plane',
    d: 'M1020,438 V512 H1170',
    variant: 'feedback',
  },
  {
    id: 'e-sense-ctrl',
    d: 'M870,512 H335 V368',
    variant: 'feedback',
    label: { text: 'measured at the die, not at the VRM', x: 620, y: 502 },
  },

  // VID: the CPU tells the controller what voltage it wants.
  { id: 'e-vid-ctrl', d: 'M335,430 V368', variant: 'monitor' },
  {
    id: 'e-vcore-vid',
    d: 'M1175,288 V460 H430',
    variant: 'monitor',
    label: { text: 'VID / SVID from the CPU', x: 800, y: 450 },
  },

  // Every rail reports back, and the gate releases RESET#.
  { id: 'e-vcore-pwrgd', d: 'M1175,176 V69 H800', variant: 'monitor' },
  { id: 'e-vccsa-pwrgd', d: 'M1260,326 V120 H650 V98', variant: 'monitor' },
  {
    id: 'e-pwrgd-seq',
    d: 'M500,69 H430',
    variant: 'pwrok',
    label: { text: 'all good', x: 465, y: 57 },
  },
];

function renderNode(node: DiagramNode): string {
  const cx = node.x + node.w / 2;
  return `
    <g class="psu-node" data-node="${node.id}">
      <rect class="psu-node-box" x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" rx="10" />
      <text class="psu-node-title" x="${cx}" y="${node.y + node.h / 2 - 4}">${node.title}</text>
      <text class="psu-node-caption" x="${cx}" y="${node.y + node.h / 2 + 18}">${node.caption}</text>
    </g>`;
}

function renderEdge(edge: DiagramEdge): string {
  const variant = edge.variant ? ` psu-edge--${edge.variant}` : '';
  const label = edge.label
    ? `<text class="psu-edge-label" x="${edge.label.x}" y="${edge.label.y}">${edge.label.text}</text>`
    : '';
  return `
    <g class="psu-edge${variant}" data-edge="${edge.id}">
      <path class="psu-edge-path" d="${edge.d}" marker-end="url(#vrm-arrow)" />
      ${label}
    </g>`;
}

export function createVrmDiagram(): string {
  return `
<svg class="psu-diagram vrm-diagram" viewBox="0 0 1300 560" role="img"
     aria-label="Block diagram of a CPU voltage regulator: PWR_OK releases a sequencer which enables a PWM controller, the controller drives four phases 90 degrees apart, the phases converge on an output plane under the socket, and remote sense at the die closes the loop.">
  <defs>
    <marker id="vrm-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
    </marker>
  </defs>

  ${EDGES.map(renderEdge).join('')}
  ${NODES.map(renderNode).join('')}
</svg>`;
}

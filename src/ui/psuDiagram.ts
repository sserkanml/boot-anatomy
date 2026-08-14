/**
 * The PSU block diagram, built as a single inline SVG.
 *
 * Layout notes: the main chain runs left to right at y=140. A dashed vertical
 * barrier at x=950 marks galvanic isolation, and the two blocks that contain a
 * transformer (the main one and the standby flyback) deliberately straddle it —
 * they are the only things energy crosses on. The supervisory IC sits above the
 * secondary side and the standby converter below it, which keeps every routed
 * path free of crossings.
 *
 * Element ids here are referenced by `nodes` / `edges` in config/psuStages.ts.
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

const ROW_Y = 140;
const ROW_H = 80;
const BOX_W = 140;
/** Center of the isolation barrier, and of the two blocks that straddle it. */
const BARRIER_X = 950;

const NODES: DiagramNode[] = [
  { id: 'ac', x: 20, y: ROW_Y, w: BOX_W, h: ROW_H, title: 'AC Inlet', caption: '230 V AC' },
  { id: 'emi', x: 192, y: ROW_Y, w: BOX_W, h: ROW_H, title: 'EMI Filter', caption: 'noise blocked' },
  {
    id: 'rectifier',
    x: 364,
    y: ROW_Y,
    w: BOX_W,
    h: ROW_H,
    title: 'Bridge + Bulk',
    caption: 'pulsating DC',
  },
  { id: 'pfc', x: 536, y: ROW_Y, w: BOX_W, h: ROW_H, title: 'Active PFC', caption: '≈400 V DC' },
  {
    id: 'switching',
    x: 708,
    y: ROW_Y,
    w: BOX_W,
    h: ROW_H,
    title: 'Switching',
    caption: '50–150 kHz',
  },
  {
    id: 'transformer',
    x: 880,
    y: ROW_Y,
    w: BOX_W,
    h: ROW_H,
    title: 'Transformer',
    caption: 'step down + isolate',
  },
  {
    id: 'secondary',
    x: 1052,
    y: ROW_Y,
    w: BOX_W,
    h: ROW_H,
    title: 'Rectification',
    caption: 'back to DC',
  },
  {
    id: 'filter',
    x: 1224,
    y: ROW_Y,
    w: BOX_W,
    h: ROW_H,
    title: 'LC Filter',
    caption: '+12V +5V +3.3V',
  },
  {
    id: 'outputs',
    x: 1396,
    y: ROW_Y,
    w: BOX_W,
    h: ROW_H,
    title: 'Connectors',
    caption: '24-pin · EPS · PCIe',
  },
  {
    id: 'supervisor',
    x: 1100,
    y: 30,
    w: 260,
    h: 60,
    title: 'Supervisory IC',
    caption: 'OVP · UVP · OCP · OTP · SCP',
  },
  {
    id: 'standby',
    x: 880,
    y: 292,
    w: BOX_W,
    h: 68,
    title: 'Standby Flyback',
    caption: 'always on',
  },
];

interface DiagramEdge {
  id: string;
  d: string;
  /** Extra class controlling color and dash pattern. */
  variant?: 'standby' | 'feedback' | 'monitor' | 'pwrok';
  label?: { text: string; x: number; y: number };
}

const EDGES: DiagramEdge[] = [
  { id: 'e-ac-emi', d: 'M160,180 H192' },
  { id: 'e-emi-rect', d: 'M332,180 H364' },
  { id: 'e-rect-pfc', d: 'M504,180 H536' },
  { id: 'e-pfc-sw', d: 'M676,180 H708' },
  { id: 'e-sw-tr', d: 'M848,180 H880' },
  { id: 'e-tr-sec', d: 'M1020,180 H1052' },
  { id: 'e-sec-filt', d: 'M1192,180 H1224' },
  { id: 'e-filt-out', d: 'M1364,180 H1396' },

  // Standby: taps the bulk rail, crosses the barrier through its own flyback.
  { id: 'e-rect-sb', d: 'M434,220 V326 H880', variant: 'standby' },
  {
    id: 'e-sb-out',
    d: 'M1020,326 H1466 V220',
    variant: 'standby',
    label: { text: '+5VSB', x: 1200, y: 314 },
  },

  // Feedback: secondary back to the primary controller, across the barrier.
  {
    id: 'e-fb',
    d: 'M1294,220 V258 H778 V220',
    variant: 'feedback',
    label: { text: 'feedback', x: 1080, y: 248 },
  },

  // Supervisor watches the rails and emits PWR_OK.
  { id: 'e-sup-mon1', d: 'M1122,140 V90', variant: 'monitor' },
  { id: 'e-sup-mon2', d: 'M1294,140 V90', variant: 'monitor' },
  {
    id: 'e-sup-out',
    d: 'M1360,60 H1466 V140',
    variant: 'pwrok',
    label: { text: 'PWR_OK', x: 1416, y: 50 },
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
      <path class="psu-edge-path" d="${edge.d}" marker-end="url(#psu-arrow)" />
      ${label}
    </g>`;
}

/** Returns the complete SVG markup for the PSU block diagram. */
export function createPsuDiagram(): string {
  return `
<svg class="psu-diagram" viewBox="0 0 1560 430" role="img"
     aria-label="Block diagram of a switched-mode power supply, from the AC inlet through rectification, power factor correction, high-frequency switching and the isolation transformer, to the rectified and filtered DC rails.">
  <defs>
    <marker id="psu-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
    </marker>
  </defs>

  <g class="psu-barrier" data-node="barrier">
    <line class="psu-barrier-line" x1="${BARRIER_X}" y1="16" x2="${BARRIER_X}" y2="392" />
    <text class="psu-barrier-label psu-barrier-label--left" x="${BARRIER_X - 14}" y="412">
      primary · mains-referenced
    </text>
    <text class="psu-barrier-label psu-barrier-label--right" x="${BARRIER_X + 14}" y="412">
      secondary · isolated
    </text>
  </g>

  ${EDGES.map(renderEdge).join('')}
  ${NODES.map(renderNode).join('')}

  <g class="psu-opto" data-node="opto">
    <rect class="psu-opto-box" x="${BARRIER_X - 30}" y="242" width="60" height="32" rx="8" />
    <text class="psu-opto-label" x="${BARRIER_X}" y="263">OPTO</text>
  </g>
</svg>`;
}

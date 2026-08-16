/**
 * Block diagram of an Embedded Controller.
 *
 * The layout puts the signal that matters on one straight line across the
 * middle — button, GPIO, core, PS_ON# driver, PSU — and hangs everything else
 * off the core above and below it. That way the eight-step walkthrough reads as
 * a left-to-right journey even though the EC is really a hub.
 *
 * Element ids here are referenced by `nodes` / `edges` in config/ecStages.ts.
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

const NODES: DiagramNode[] = [
  // Top: memory, the bus to the chipset, and the OS-facing window.
  { id: 'vsb', x: 20, y: 40, w: 210, h: 60, title: '+5VSB', caption: 'always on' },
  { id: 'sram', x: 470, y: 40, w: 150, h: 60, title: 'SRAM', caption: 'runtime state' },
  { id: 'flash', x: 650, y: 40, w: 200, h: 60, title: 'SPI NOR', caption: 'EC firmware' },
  { id: 'espi', x: 880, y: 40, w: 160, h: 60, title: 'LPC / eSPI', caption: 'to the PCH' },
  { id: 'acpi', x: 1060, y: 40, w: 160, h: 60, title: 'ACPI region', caption: '0x62 / 0x66 · SCI' },

  // Middle: the press-to-PS_ON# path.
  { id: 'btn', x: 20, y: 185, w: 160, h: 120, title: 'Power Button', caption: 'momentary switch' },
  { id: 'gpio', x: 240, y: 185, w: 170, h: 120, title: 'GPIO', caption: 'interrupt source' },
  { id: 'core', x: 470, y: 185, w: 380, h: 120, title: 'EC Core', caption: '8051 / Cortex-M · firmware' },
  { id: 'pson', x: 910, y: 185, w: 200, h: 120, title: 'PS_ON# driver', caption: 'active low' },

  // Bottom: everything else the EC is responsible for.
  { id: 'adc', x: 240, y: 380, w: 150, h: 60, title: 'ADC', caption: 'thermal' },
  { id: 'pwm', x: 420, y: 380, w: 150, h: 60, title: 'PWM', caption: 'fan speed' },
  { id: 'i2c', x: 600, y: 380, w: 170, h: 60, title: 'I2C / SMBus', caption: 'battery · sensors' },
  { id: 'kbd', x: 800, y: 380, w: 180, h: 60, title: 'Keyboard matrix', caption: 'laptops' },
  { id: 'wdt', x: 1010, y: 380, w: 150, h: 60, title: 'Watchdog', caption: 'liveness' },
];

interface DiagramEdge {
  id: string;
  d: string;
  variant?: 'standby' | 'feedback' | 'monitor' | 'pwrok';
  label?: { text: string; x: number; y: number };
}

const EDGES: DiagramEdge[] = [
  // The main path.
  { id: 'e-btn-gpio', d: 'M180,245 H240', label: { text: 'PWRBTN#', x: 210, y: 233 } },
  { id: 'e-gpio-core', d: 'M410,245 H470' },
  { id: 'e-core-pson', d: 'M850,245 H910' },
  {
    id: 'e-pson-out',
    d: 'M1110,245 H1215',
    variant: 'pwrok',
    label: { text: 'to the PSU', x: 1165, y: 233 },
  },

  // Standby power reaching the core.
  { id: 'e-vsb-core', d: 'M125,100 V140 H500 V185', variant: 'standby' },

  // Memory and buses.
  { id: 'e-sram-core', d: 'M545,100 V185' },
  { id: 'e-flash-core', d: 'M750,100 V185' },
  { id: 'e-espi-core', d: 'M960,100 V150 H790 V185' },
  { id: 'e-espi-acpi', d: 'M1040,70 H1060', variant: 'monitor' },

  // Peripherals hanging off the core.
  { id: 'e-adc-core', d: 'M315,380 V345 H480 V305', variant: 'monitor' },
  { id: 'e-pwm-core', d: 'M495,380 V305', variant: 'monitor' },
  { id: 'e-i2c-core', d: 'M685,380 V305', variant: 'monitor' },
  { id: 'e-kbd-core', d: 'M890,380 V345 H820 V305', variant: 'monitor' },
  { id: 'e-wdt-core', d: 'M1085,380 V335 H840 V305', variant: 'monitor' },
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
      <path class="psu-edge-path" d="${edge.d}" marker-end="url(#ec-arrow)" />
      ${label}
    </g>`;
}

export function createEcDiagram(): string {
  return `
<svg class="psu-diagram ec-diagram" viewBox="0 0 1240 470" role="img"
     aria-label="Block diagram of an embedded controller: the power button reaches a GPIO interrupt, the core decides on standby power using its own SRAM and firmware flash, and drives the PS_ON# line to the power supply.">
  <defs>
    <marker id="ec-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
    </marker>
  </defs>

  ${EDGES.map(renderEdge).join('')}
  ${NODES.map(renderNode).join('')}
</svg>`;
}

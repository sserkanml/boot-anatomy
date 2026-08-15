/**
 * Reference material shown alongside the PSU block diagram: a glossary of the
 * technical terms the walkthrough uses, and the connector pinouts.
 *
 * Links point at English Wikipedia. Swap the hrefs if you would rather send
 * readers to the Turkish articles.
 */

export interface FaqEntry {
  /** The term being explained, used as the accordion heading. */
  term: string;
  question: string;
  answer: string;
  /** Further reading. */
  href: string;
  /** Ties the term back to a stage in the walkthrough, when there is one. */
  stageId?: string;
}

export const PSU_FAQ: FaqEntry[] = [
  {
    term: 'SMPS',
    question: 'What does a switched-mode power supply actually do differently?',
    answer:
      'An old linear supply drops unwanted voltage as heat across a regulator, which wastes most of the energy. A switched-mode supply instead chops the input into high-frequency pulses, passes them through a small transformer, and rebuilds the DC on the other side. Because the switches are either fully on or fully off, they dissipate very little, which is how a modern unit reaches 90% efficiency in a box you can lift with one hand.',
    href: 'https://en.wikipedia.org/wiki/Switched-mode_power_supply',
    stageId: 'switching',
  },
  {
    term: 'EMI filter',
    question: 'Why does the supply need a filter before anything else?',
    answer:
      'Switching hundreds of watts on and off 100,000 times a second generates a lot of electrical noise. Without a filter that noise would travel back down the mains cable and interfere with everything else on the circuit — and regulators would not certify the unit. The filter is a network of chokes and capacitors that presents a high impedance to that noise while passing 50 Hz mains freely.',
    href: 'https://en.wikipedia.org/wiki/Electromagnetic_interference',
    stageId: 'ac-emi',
  },
  {
    term: 'Common-mode choke',
    question: 'What is a common-mode choke and why two windings?',
    answer:
      'Both mains conductors are wound around the same core in the same direction. Normal load current flows out on one and back on the other, so the magnetic fields cancel and the choke barely affects it. Noise that appears on both conductors at once (common mode) does not cancel, so it sees a large inductance and is blocked. One component that ignores the signal you want and stops the one you do not.',
    href: 'https://en.wikipedia.org/wiki/Choke_(electronics)',
    stageId: 'ac-emi',
  },
  {
    term: 'NTC inrush limiter',
    question: 'Why does a supply need an inrush current limiter?',
    answer:
      'At the instant you plug it in, the bulk capacitors are empty and behave almost like a short circuit — the surge can be tens of amps and would weld relay contacts or trip a breaker. An NTC thermistor starts out with high resistance when cold, limiting that first surge, then heats up within a second or two and drops to near zero so it stops wasting power.',
    href: 'https://en.wikipedia.org/wiki/Inrush_current_limiter',
    stageId: 'ac-emi',
  },
  {
    term: 'Bridge rectifier',
    question: 'How do four diodes turn AC into DC?',
    answer:
      'The four diodes are arranged so that whichever way the AC swings, current is routed out of the same terminal. The negative half of the sine wave is effectively folded up to become positive. The result is not smooth DC yet — it is a series of humps at twice the mains frequency, which is what the bulk capacitors are there to fill in.',
    href: 'https://en.wikipedia.org/wiki/Diode_bridge',
    stageId: 'rectifier',
  },
  {
    term: 'Bulk capacitor',
    question: 'Why are the big capacitors so large, and why 400 V?',
    answer:
      'They have to hold enough energy to carry the whole system through the gaps between mains peaks, and to ride out a brief power dip — the hold-up time an ATX unit must guarantee. Because they sit after the rectifier and PFC stage, they store the full rectified line voltage, which is why they are rated for 400 V or more rather than the 12 V you see at the other end.',
    href: 'https://en.wikipedia.org/wiki/Electrolytic_capacitor',
    stageId: 'rectifier',
  },
  {
    term: 'Power factor',
    question: 'What is power factor and why correct it?',
    answer:
      'A rectifier with a capacitor behind it only draws current in short spikes at the top of each mains cycle, rather than smoothly across the whole waveform. That means it pulls far more peak current than its actual power consumption justifies, stressing the wiring and the grid. Active PFC reshapes the current draw to follow the voltage waveform, so the supply behaves like a well-mannered resistive load.',
    href: 'https://en.wikipedia.org/wiki/Power_factor',
    stageId: 'pfc',
  },
  {
    term: 'Boost converter',
    question: 'How does active PFC also give universal input?',
    answer:
      'The PFC stage is a boost converter: it steps voltage up to a fixed target, around 390 V, regardless of what came in. Feed it 110 V and it boosts harder; feed it 230 V and it boosts less. Everything downstream sees the same rail either way, which is why modern supplies have no 110/230 selector switch to get wrong.',
    href: 'https://en.wikipedia.org/wiki/Boost_converter',
    stageId: 'pfc',
  },
  {
    term: 'MOSFET',
    question: 'Why MOSFETs rather than ordinary transistors?',
    answer:
      'MOSFETs are voltage-controlled and switch extremely fast, which matters when you are doing it 100,000 times a second — every transition is a moment where both voltage and current are non-zero, and therefore where heat is made. They also have very low resistance when fully on, so conduction losses stay small. Fast and low-loss is exactly what a switching supply needs.',
    href: 'https://en.wikipedia.org/wiki/MOSFET',
    stageId: 'switching',
  },
  {
    term: 'Ferrite core',
    question: 'Why is the transformer core ferrite instead of iron?',
    answer:
      'Laminated iron works well at 50 Hz but becomes extremely lossy at 100 kHz, heating up rather than transferring power. Ferrite is a ceramic that keeps its magnetic properties at high frequency while barely conducting electricity, which suppresses the eddy currents that would otherwise waste the energy.',
    href: 'https://en.wikipedia.org/wiki/Ferrite_core',
    stageId: 'transformer',
  },
  {
    term: 'Galvanic isolation',
    question: 'What exactly is isolated, and why does it matter?',
    answer:
      'There is no conductive path between the mains side and the output side — energy crosses only as a magnetic field through the transformer core. That is what lets you touch the case, the connectors and the motherboard safely. It is also why a fault on the primary side does not put mains voltage on your hardware.',
    href: 'https://en.wikipedia.org/wiki/Galvanic_isolation',
    stageId: 'transformer',
  },
  {
    term: 'Schottky diode',
    question: 'Why Schottky diodes on the output side?',
    answer:
      'Every diode drops some voltage while conducting, and that drop times the current is heat. A standard silicon diode loses about 0.7 V; a Schottky loses roughly half that. On a 12 V rail carrying 20 A, that difference is tens of watts. Schottkys also recover from conduction faster, which matters at switching frequencies.',
    href: 'https://en.wikipedia.org/wiki/Schottky_diode',
    stageId: 'secondary',
  },
  {
    term: 'Synchronous rectification',
    question: 'How can a MOSFET replace a rectifier diode?',
    answer:
      'A MOSFET turned fully on is just a very low resistance, so the voltage across it can be far below even a Schottky drop. The controller switches it on precisely when the diode would have conducted. It costs complexity and demands accurate timing, but it is where a large part of the efficiency in a high-rated unit comes from.',
    href: 'https://en.wikipedia.org/wiki/Rectifier',
    stageId: 'secondary',
  },
  {
    term: 'Buck converter (DC-DC)',
    question: 'Why derive +5V and +3.3V instead of winding them separately?',
    answer:
      'Older units wound all three rails on the same transformer and regulated them as a group, so a heavy load on +12V would pull +5V out of spec. A DC-DC design takes only +12V off the transformer and steps it down locally with buck converters, giving each rail its own tight regulation. It is the reason modern supplies hold voltage so much better under uneven loads.',
    href: 'https://en.wikipedia.org/wiki/Buck_converter',
    stageId: 'secondary',
  },
  {
    term: 'Flyback converter',
    question: 'Why is the standby supply a flyback?',
    answer:
      'A flyback stores energy in the transformer during the on-time and releases it during the off-time, so it needs very few parts — one switch, one transformer, one diode. That makes it cheap and efficient at the handful of watts +5VSB requires, and it provides isolation at the same time. Using the big main converter for standby would be wasteful and noisy.',
    href: 'https://en.wikipedia.org/wiki/Flyback_converter',
    stageId: 'standby',
  },
  {
    term: 'Optocoupler',
    question: 'Why send feedback over light?',
    answer:
      'The regulator on the primary side needs to know the output voltage, but wiring the two sides together would destroy the isolation that makes the unit safe. An optocoupler puts an LED and a phototransistor in one package with an insulating gap between them, so the information crosses as light while the electrical barrier stays intact.',
    href: 'https://en.wikipedia.org/wiki/Opto-isolator',
    stageId: 'feedback',
  },
  {
    term: 'PWM',
    question: 'How does the controller actually change the output voltage?',
    answer:
      'It varies the duty cycle — the fraction of each switching period the MOSFET is on. Longer on-time transfers more energy per cycle and the output rises; shorter and it falls. The controller adjusts this thousands of times a second based on the feedback signal, which is why the rails barely move when the CPU suddenly demands more current.',
    href: 'https://en.wikipedia.org/wiki/Pulse-width_modulation',
    stageId: 'feedback',
  },
  {
    term: 'Ripple',
    question: 'What is ripple and how much is acceptable?',
    answer:
      'Ripple is the small AC residue left riding on a DC rail after filtering, mostly at the switching frequency. The ATX specification allows up to 120 mV peak-to-peak on +12V and 50 mV on +5V and +3.3V. Excessive ripple shows up as instability rather than an obvious failure, which makes it one of the more insidious ways a cheap supply causes trouble.',
    href: 'https://en.wikipedia.org/wiki/Ripple_(electrical)',
    stageId: 'secondary',
  },
  {
    term: 'Protections (OVP/OCP/OTP/SCP)',
    question: 'What is the supervisory IC watching for?',
    answer:
      'Overvoltage (a regulation failure about to destroy every component downstream), undervoltage, overcurrent per rail, overtemperature, and a short circuit. Any of them latches the supply off. This is the difference between a supply that dies alone and one that takes the motherboard with it.',
    href: 'https://en.wikipedia.org/wiki/Switched-mode_power_supply',
    stageId: 'supervisor',
  },
  {
    term: 'PWR_OK / Power Good',
    question: 'Why does the board wait for a separate signal?',
    answer:
      'Rails take a few hundred milliseconds to rise and settle. A CPU clocked while its supply is still ramping would execute garbage. PWR_OK is the supply telling the chipset that every rail is now within tolerance, and it is what permits the chipset to release the CPU from reset. Too short a delay is a classic cause of unreliable cold boots.',
    href: 'https://en.wikipedia.org/wiki/ATX',
    stageId: 'supervisor',
  },
  {
    term: 'PS_ON#',
    question: 'Why is the power-on signal active low?',
    answer:
      'The trailing # means asserted when pulled to ground. That choice is a safety default: if the wire falls off or the board loses power, the line floats high through a pull-up and the supply stays off. Shorting pin 16 to any ground pin is also why the paperclip test switches a supply on with no motherboard attached.',
    href: 'https://en.wikipedia.org/wiki/ATX',
    stageId: 'switching',
  },
  {
    term: '+5VSB',
    question: 'What still runs while the machine is "off"?',
    answer:
      'The standby rail feeds the embedded controller that watches the power button, the network chip when Wake-on-LAN is enabled, USB charging ports on many boards, and the logic that remembers power state. This is ACPI state S5 — soft off, not disconnected. Only unplugging the unit or flipping its rear switch truly kills it.',
    href: 'https://en.wikipedia.org/wiki/Advanced_Configuration_and_Power_Interface',
    stageId: 'standby',
  },
  {
    term: '80 PLUS',
    question: 'What does an 80 PLUS rating actually certify?',
    answer:
      'That the unit is at least 80% efficient at 20%, 50% and 100% of its rated load, with the higher tiers (Bronze through Titanium) demanding more. It says nothing directly about ripple, protection quality or hold-up time — a certified supply can still be a poor one, which is why load-testing reviews remain worth reading.',
    href: 'https://en.wikipedia.org/wiki/80_Plus',
  },
];

// --- Connector pinouts ---

export type RailKey =
  | '+3.3V'
  | '+5V'
  | '+12V'
  | '-12V'
  | '+5VSB'
  | 'COM'
  | 'PWR_OK'
  | 'PS_ON#'
  | 'NC'
  | 'SENSE';

export interface RailStyle {
  /** Conventional wire color for this rail. */
  wire: string;
  /** Swatch color used in the UI; black wires need lifting to stay visible. */
  swatch: string;
  label: string;
}

export const RAIL_STYLES: Record<RailKey, RailStyle> = {
  '+3.3V': { wire: 'orange', swatch: '#ff9f45', label: '+3.3 V' },
  '+5V': { wire: 'red', swatch: '#ff5c5c', label: '+5 V' },
  '+12V': { wire: 'yellow', swatch: '#ffd166', label: '+12 V' },
  '-12V': { wire: 'blue', swatch: '#63b3ff', label: '-12 V' },
  '+5VSB': { wire: 'purple', swatch: '#a77bff', label: '+5 VSB' },
  COM: { wire: 'black', swatch: '#5b6677', label: 'COM' },
  PWR_OK: { wire: 'gray', swatch: '#cbd5e0', label: 'PWR_OK' },
  'PS_ON#': { wire: 'green', swatch: '#3ddc84', label: 'PS_ON#' },
  NC: { wire: 'none', swatch: '#2d3748', label: 'N/C' },
  SENSE: { wire: 'brown', swatch: '#b08968', label: 'Sense' },
};

export interface Pin {
  number: number;
  rail: RailKey;
  /** Set for the pins the boot walkthrough actually talks about. */
  note?: string;
}

export interface Connector {
  id: string;
  name: string;
  subtitle: string;
  /** Pins are laid out in rows of this length. */
  columns: number;
  pins: Pin[];
}

export const CONNECTORS: Connector[] = [
  {
    id: 'atx24',
    name: 'ATX 24-pin',
    subtitle: 'Main motherboard connector',
    columns: 12,
    pins: [
      { number: 1, rail: '+3.3V' },
      { number: 2, rail: '+3.3V' },
      { number: 3, rail: 'COM' },
      { number: 4, rail: '+5V' },
      { number: 5, rail: 'COM' },
      { number: 6, rail: '+5V' },
      { number: 7, rail: 'COM' },
      { number: 8, rail: 'PWR_OK', note: 'Power Good — released once every rail is stable' },
      { number: 9, rail: '+5VSB', note: 'Standby rail — live whenever the unit is plugged in' },
      { number: 10, rail: '+12V' },
      { number: 11, rail: '+12V' },
      { number: 12, rail: '+3.3V' },
      { number: 13, rail: '+3.3V' },
      { number: 14, rail: '-12V' },
      { number: 15, rail: 'COM' },
      { number: 16, rail: 'PS_ON#', note: 'Pulled low by the EC to switch the main converter on' },
      { number: 17, rail: 'COM' },
      { number: 18, rail: 'COM' },
      { number: 19, rail: 'COM' },
      { number: 20, rail: 'NC', note: 'Was -5V before ATX 2.01' },
      { number: 21, rail: '+5V' },
      { number: 22, rail: '+5V' },
      { number: 23, rail: '+5V' },
      { number: 24, rail: 'COM' },
    ],
  },
  {
    id: 'eps',
    name: 'EPS 12V 8-pin',
    subtitle: 'CPU power',
    columns: 4,
    pins: [
      { number: 1, rail: 'COM' },
      { number: 2, rail: 'COM' },
      { number: 3, rail: 'COM' },
      { number: 4, rail: 'COM' },
      { number: 5, rail: '+12V' },
      { number: 6, rail: '+12V' },
      { number: 7, rail: '+12V' },
      { number: 8, rail: '+12V' },
    ],
  },
  {
    id: 'pcie',
    name: 'PCIe 8-pin (6+2)',
    subtitle: 'Graphics card power',
    columns: 4,
    pins: [
      { number: 1, rail: '+12V' },
      { number: 2, rail: '+12V' },
      { number: 3, rail: '+12V' },
      { number: 4, rail: 'SENSE', note: 'Tells the card an 8-pin is connected' },
      { number: 5, rail: 'COM' },
      { number: 6, rail: 'COM' },
      { number: 7, rail: 'COM' },
      { number: 8, rail: 'COM' },
    ],
  },
  {
    id: 'sata',
    name: 'SATA power',
    subtitle: '15-pin, three contacts per rail',
    columns: 5,
    pins: [
      { number: 1, rail: '+3.3V' },
      { number: 2, rail: 'COM' },
      { number: 3, rail: '+5V' },
      { number: 4, rail: 'COM' },
      { number: 5, rail: '+12V' },
    ],
  },
  {
    id: 'molex',
    name: 'Molex 4-pin',
    subtitle: 'Legacy peripheral power',
    columns: 4,
    pins: [
      { number: 1, rail: '+12V' },
      { number: 2, rail: 'COM' },
      { number: 3, rail: 'COM' },
      { number: 4, rail: '+5V' },
    ],
  },
];

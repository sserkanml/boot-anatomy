/**
 * Waveform plotting for the PSU walkthrough.
 *
 * Every trace is generated from an actual function rather than drawn by hand,
 * so the shapes are honest: the capacitor ripple really is an exponential decay
 * chasing a rectified sine, and the PFC-less current spikes really are narrow
 * because they only flow while the line exceeds the capacitor voltage.
 */

export type WaveSpec =
  /** Clean mains sine, optionally with high-frequency switching noise on it. */
  | { kind: 'sine'; cycles?: number; noise?: number; amplitude?: number }
  /** Full-wave rectified sine: the humps after the bridge. */
  | { kind: 'rectified'; cycles?: number }
  /** Rectified sine with a capacitor holding the peaks up between humps. */
  | { kind: 'rippleDc'; cycles?: number; decay?: number }
  /** Narrow current pulses drawn only at the top of each half cycle. */
  | { kind: 'spikes'; cycles?: number; sharpness?: number }
  /** High-frequency switching, with a duty cycle. */
  | { kind: 'square'; cycles?: number; duty?: number; amplitude?: number }
  /** Rectified switching: all blocks positive, before the LC filter. */
  | { kind: 'choppedDc'; cycles?: number; duty?: number; amplitude?: number }
  /** A settled rail, with a little ripple riding on it. */
  | { kind: 'flat'; level?: number; ripple?: number; rippleCycles?: number }
  /** A rail ramping up from zero and settling. */
  | { kind: 'ramp'; start?: number; rise?: number; level?: number }
  /** A logic signal that goes high once and stays there. */
  | { kind: 'step'; at?: number; level?: number }
  /**
   * Inductor current in one phase of a buck converter: a triangle, because the
   * current ramps up while the high-side switch is on and back down while it is
   * off. It is asymmetric — `duty` sets how much of the period is spent ramping
   * up — and that asymmetry is not cosmetic: it is the reason four phases do
   * not cancel perfectly. `phase` shifts it, which is how a multi-phase VRM
   * staggers its phases against each other.
   */
  | { kind: 'triangle'; cycles?: number; phase?: number; amplitude?: number; level?: number; duty?: number }
  /**
   * The sum of `phases` such triangles evenly spread over the period, divided
   * back down to the per-phase average so the two plots compare like with like.
   * What is left is real residual ripple at `phases` times the switching
   * frequency — small, but not the flat line an idealised symmetric triangle
   * would wrongly produce.
   */
  | { kind: 'phaseSum'; cycles?: number; phases?: number; amplitude?: number; level?: number; duty?: number }
  /**
   * A regulated rail hit by a sudden load step: it dips as the inductors cannot
   * change current instantly, then the loop pulls it back.
   */
  | { kind: 'droop'; at?: number; depth?: number; recover?: number; level?: number; settle?: number };

export type Tone =
  | 'accent'
  | 'muted'
  | 'v12'
  | 'v5'
  | 'v33'
  | 'standby'
  | 'ok'
  | 'phase1'
  | 'phase2'
  | 'phase3'
  | 'phase4';

export interface Trace {
  spec: WaveSpec;
  tone?: Tone;
  /** Small caption drawn at the left of the trace, e.g. a rail name. */
  name?: string;
}

const VIEW_W = 620;
const VIEW_H = 120;
const PAD_X = 14;
const SAMPLES = 420;

/** Maps a value in -1..1 to a y coordinate, 0 sitting on the mid line. */
function toY(value: number): number {
  const usable = VIEW_H / 2 - 12;
  return VIEW_H / 2 - value * usable;
}

function toX(t: number): number {
  return PAD_X + t * (VIEW_W - PAD_X * 2);
}

function buildPath(valueAt: (t: number) => number): string {
  let d = '';
  for (let i = 0; i <= SAMPLES; i += 1) {
    const t = i / SAMPLES;
    const x = toX(t).toFixed(2);
    const y = toY(valueAt(t)).toFixed(2);
    d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
  }
  return d;
}

/**
 * Simulates a capacitor fed by a rectified sine: it charges to the peak, then
 * discharges exponentially until the next hump catches up with it.
 */
function rippleDcSampler(cycles: number, decay: number): (t: number) => number {
  const rectifiedAt = (t: number): number => Math.abs(Math.sin(Math.PI * cycles * 2 * t));

  // Run one throwaway pass first, so the plot shows the steady state rather
  // than the capacitor charging up from empty on the very first hump.
  let held = 0;
  for (let i = 0; i <= SAMPLES; i += 1) {
    held = Math.max(rectifiedAt(i / SAMPLES), held - decay);
  }

  const values: number[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    held = Math.max(rectifiedAt(i / SAMPLES), held - decay);
    values.push(held);
  }
  return (t) => values[Math.round(t * SAMPLES)] ?? 0;
}

function sampler(spec: WaveSpec): (t: number) => number {
  switch (spec.kind) {
    case 'sine': {
      const { cycles = 4, noise = 0, amplitude = 0.85 } = spec;
      return (t) => {
        const base = Math.sin(Math.PI * 2 * cycles * t) * amplitude;
        if (noise === 0) return base;
        // Switching hash riding on the fundamental.
        const hash =
          Math.sin(Math.PI * 2 * cycles * 26 * t) * 0.6 +
          Math.sin(Math.PI * 2 * cycles * 61 * t) * 0.4;
        return base + hash * noise;
      };
    }
    case 'rectified': {
      const { cycles = 4 } = spec;
      return (t) => Math.abs(Math.sin(Math.PI * cycles * 2 * t)) * 1.7 - 0.85;
    }
    case 'rippleDc': {
      const { cycles = 4, decay = 0.012 } = spec;
      const sample = rippleDcSampler(cycles, decay);
      return (t) => sample(t) * 1.7 - 0.85;
    }
    case 'spikes': {
      const { cycles = 4, sharpness = 16 } = spec;
      return (t) =>
        Math.pow(Math.abs(Math.sin(Math.PI * cycles * 2 * t)), sharpness) * 1.7 - 0.85;
    }
    case 'square': {
      const { cycles = 14, duty = 0.5, amplitude = 0.85 } = spec;
      return (t) => (((t * cycles) % 1) < duty ? amplitude : -amplitude);
    }
    case 'choppedDc': {
      const { cycles = 14, duty = 0.5, amplitude = 1.7 } = spec;
      return (t) => (((t * cycles) % 1) < duty ? amplitude - 0.85 : -0.85);
    }
    case 'flat': {
      const { level = 0.45, ripple = 0.04, rippleCycles = 26 } = spec;
      return (t) => level + Math.sin(Math.PI * 2 * rippleCycles * t) * ripple;
    }
    case 'ramp': {
      const { start = 0.08, rise = 0.22, level = 0.55 } = spec;
      return (t) => {
        if (t < start) return -0.85;
        const p = Math.min(1, (t - start) / rise);
        // Ease out so it settles rather than arriving at a corner.
        return -0.85 + (level + 0.85) * (1 - Math.pow(1 - p, 3));
      };
    }
    case 'step': {
      const { at = 0.55, level = 0.55 } = spec;
      return (t) => (t < at ? -0.85 : level);
    }
    case 'triangle': {
      const { cycles = 6, phase = 0, amplitude = 0.34, level = 0, duty = 0.5 } = spec;
      return (t) => level + triangleAt(t, cycles, phase, duty) * amplitude;
    }
    case 'phaseSum': {
      const { cycles = 6, phases = 4, amplitude = 0.34, level = 0, duty = 0.5 } = spec;
      return (t) => {
        let sum = 0;
        for (let i = 0; i < phases; i += 1) sum += triangleAt(t, cycles, i / phases, duty);
        // Divided by the phase count so the plot compares like with like: this
        // is the same average current, carrying much less ripple.
        return level + (sum / phases) * amplitude;
      };
    }
    case 'droop': {
      const { at = 0.4, depth = 0.42, recover = 0.28, level = 0.45, settle = 0.12 } = spec;
      return (t) => {
        if (t < at) return level;
        const p = (t - at) / recover;
        if (p >= 1) return level - settle;
        // Fall fast, come back slowly, and settle slightly low — the loop is
        // deliberately allowed to keep a droop proportional to the load.
        const dip = depth * Math.exp(-p * 4) * Math.sin(Math.PI * Math.min(1, p * 1.6));
        return level - settle * p - dip;
      };
    }
  }
}

/**
 * Inductor current over one switching period, in -1..1, offset by `phase` of a
 * cycle. `duty` is the fraction spent ramping up — steeply, because the input
 * is twelve times the output — against a long shallow ramp down. Equal halves
 * would be a lie that happens to cancel exactly when summed.
 */
function triangleAt(t: number, cycles: number, phase: number, duty: number): number {
  const u = (t * cycles + phase) % 1;
  return u < duty ? -1 + (2 * u) / duty : 1 - (2 * (u - duty)) / (1 - duty);
}

function renderTrace(trace: Trace): string {
  const tone = trace.tone ?? 'accent';
  const valueAt = sampler(trace.spec);
  const path = buildPath(valueAt);

  // Label the trace where it settles, not at a fixed slot, so multi-trace
  // plots like the power-up timing read without a legend.
  const name = trace.name
    ? `<text class="wave-trace-name" x="${PAD_X + 2}" y="${(toY(valueAt(0.96)) - 6).toFixed(1)}">${trace.name}</text>`
    : '';

  return `<path class="wave-path wave-path--${tone}" d="${path}" />${name}`;
}

/** Renders one plot: a mid line plus every trace on it. */
export function renderWave(traces: Trace[]): string {
  // Uniform scaling on purpose — stretching the viewBox would distort the
  // trace labels along with it.
  return `
    <svg class="wave-plot" viewBox="0 0 ${VIEW_W} ${VIEW_H}" aria-hidden="true">
      <line class="wave-axis" x1="${PAD_X}" y1="${VIEW_H / 2}" x2="${VIEW_W - PAD_X}" y2="${VIEW_H / 2}" />
      ${traces.map(renderTrace).join('')}
    </svg>`;
}

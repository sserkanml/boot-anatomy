import type { AnchorId, BootStep, SignalSpec } from '../types';
import { RAIL_COLORS } from './constants';
import { EC_STAGES } from './ecStages';

/**
 * The 3D staging for the EC walkthrough: which blocks inside the package the
 * signal moves between at each of the eight steps.
 *
 * Prose comes from EC_STAGES, so the dialog and the scene can never drift.
 */
const EC_STAGE_SCENE: Record<string, { signals: SignalSpec[]; highlight: AnchorId[] }> = {
  standby: {
    highlight: ['ecVsbIn', 'ecCore'],
    signals: [
      {
        route: ['ecVsbIn', 'ecCore'],
        color: RAIL_COLORS['+5VSB'],
        label: '+5VSB',
        particles: 10,
        instant: true,
        persist: true,
        thickness: 0.9,
      },
    ],
  },
  press: {
    highlight: ['powerButton', 'ecPwrbtnIn'],
    signals: [
      {
        route: ['powerButton', 'ecPwrbtnIn'],
        color: RAIL_COLORS.logic,
        label: 'PWRBTN#',
        particles: 12,
        thickness: 1.1,
      },
    ],
  },
  interrupt: {
    highlight: ['ecPwrbtnIn', 'ecGpio', 'ecCore'],
    signals: [
      {
        route: ['ecPwrbtnIn', 'ecGpio'],
        color: RAIL_COLORS.logic,
        particles: 8,
        spread: 0.45,
      },
      {
        route: ['ecGpio', 'ecCore'],
        color: RAIL_COLORS.data,
        label: 'IRQ',
        particles: 10,
        delay: 0.4,
        spread: 0.45,
      },
    ],
  },
  debounce: {
    highlight: ['ecGpio', 'ecCore'],
    signals: [
      {
        route: ['ecGpio', 'ecCore'],
        color: RAIL_COLORS.data,
        label: 're-read',
        particles: 6,
        spread: 0.4,
      },
    ],
  },
  duration: {
    // Nothing travels here — the core is simply counting.
    highlight: ['ecCore'],
    signals: [],
  },
  'acpi-state': {
    highlight: ['ecCore', 'ecEspi'],
    signals: [
      {
        route: ['ecCore', 'ecEspi'],
        color: RAIL_COLORS.data,
        label: 'S0 / S3 / S5',
        particles: 8,
        spread: 0.5,
      },
    ],
  },
  decide: {
    highlight: ['ecFlash', 'ecSram', 'ecCore'],
    signals: [
      {
        route: ['ecFlash', 'ecCore'],
        color: RAIL_COLORS.firmware,
        label: 'EC firmware',
        particles: 10,
        spread: 0.45,
      },
      {
        route: ['ecSram', 'ecCore'],
        color: RAIL_COLORS.firmware,
        particles: 6,
        delay: 0.35,
        spread: 0.45,
      },
    ],
  },
  assert: {
    highlight: ['ecCore', 'ecPsonOut', 'atx24'],
    signals: [
      {
        route: ['ecCore', 'ecPsonOut'],
        color: RAIL_COLORS['PS_ON#'],
        particles: 10,
        spread: 0.4,
      },
      {
        route: ['ecPsonOut', 'atx24'],
        color: RAIL_COLORS['PS_ON#'],
        label: 'PS_ON# → LOW',
        particles: 14,
        persist: true,
        delay: 0.35,
        spread: 0.5,
        thickness: 1.2,
      },
    ],
  },
};

/**
 * The EC stages as a playable chain inside the EC view — the counterpart of
 * PSU_SEQUENCE_STEPS, built from the same stage definitions the dialog uses.
 */
export const EC_SEQUENCE_STEPS: BootStep[] = EC_STAGES.map((stage) => {
  const scene = EC_STAGE_SCENE[stage.id];
  if (!scene) throw new Error(`No 3D staging defined for EC stage: ${stage.id}`);

  return {
    id: `ec-${stage.id}`,
    phase: 'power',
    title: stage.title,
    signal: stage.badge,
    description: stage.note
      ? { en: `${stage.description.en} ${stage.note.en}`, tr: `${stage.description.tr} ${stage.note.tr}` }
      : stage.description,
    duration: 5200,
    view: 'ec',
    screen: 'off',
    highlight: scene.highlight,
    signals: scene.signals,
  };
});

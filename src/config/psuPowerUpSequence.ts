import type { AnchorId, BootStep, SignalSpec } from '../types';
import { RAIL_COLORS } from './constants';
import { PSU_POWERUP_STAGES } from './psuPowerUp';

/**
 * The 3D staging for the PSU power-up stages. Prose comes from
 * PSU_POWERUP_STAGES so the dialog and the scene can never drift apart.
 */
const SCENE: Record<string, { signals: SignalSpec[]; highlight: AnchorId[] }> = {
  detect: {
    highlight: ['atx24', 'psuOutput', 'psuSupervisor'],
    signals: [
      {
        route: ['atx24', 'psuOutput', 'psuSupervisor'],
        color: RAIL_COLORS['PS_ON#'],
        label: 'PS_ON# → LOW',
        particles: 12,
        spread: 0.6,
      },
    ],
  },
  enable: {
    highlight: ['psuSupervisor', 'psuPfc', 'psuSwitching'],
    signals: [
      {
        route: ['psuSupervisor', 'psuPfc'],
        color: RAIL_COLORS.data,
        label: 'enable',
        particles: 8,
        spread: 0.4,
      },
      {
        route: ['psuSupervisor', 'psuSwitching'],
        color: RAIL_COLORS.data,
        particles: 8,
        delay: 0.3,
        spread: 0.4,
      },
    ],
  },
  'soft-start': {
    highlight: ['psuSwitching'],
    signals: [
      {
        route: ['psuPfc', 'psuSwitching'],
        color: RAIL_COLORS.hvdc,
        label: 'duty ramp',
        particles: 14,
        spread: 0.7,
      },
    ],
  },
  bulk: {
    highlight: ['psuRectifier', 'psuPfc'],
    signals: [
      {
        route: ['psuRectifier', 'psuPfc'],
        color: RAIL_COLORS.hvdc,
        label: '~300 V → 390 V',
        particles: 12,
        persist: true,
        thickness: 1.1,
      },
    ],
  },
  energise: {
    highlight: ['psuSwitching', 'psuTransformer', 'psuSecondary', 'psuFilter'],
    signals: [
      {
        route: ['psuSwitching', 'psuTransformer'],
        color: RAIL_COLORS.hvdc,
        particles: 14,
        spread: 0.3,
        thickness: 1.2,
      },
      {
        route: ['psuTransformer', 'psuSecondary', 'psuFilter'],
        color: RAIL_COLORS['+12V'],
        label: 'rails rising',
        particles: 14,
        delay: 0.3,
        spread: 0.5,
        persist: true,
        thickness: 1.2,
      },
    ],
  },
  regulate: {
    highlight: ['psuFilter', 'psuSwitching'],
    signals: [
      {
        route: ['psuFilter', 'psuSwitching'],
        color: RAIL_COLORS.data,
        label: 'optocoupler',
        particles: 10,
        thickness: 0.8,
      },
    ],
  },
  compare: {
    highlight: ['psuFilter', 'psuSecondary', 'psuSupervisor'],
    signals: [
      {
        route: ['psuFilter', 'psuSupervisor'],
        color: RAIL_COLORS.PWR_OK,
        label: '±5%',
        particles: 8,
        spread: 0.5,
      },
    ],
  },
  delay: {
    highlight: ['psuSupervisor'],
    signals: [
      {
        route: ['psuSupervisor', 'psuFilter'],
        color: RAIL_COLORS.PWR_OK,
        label: '100–500 ms',
        particles: 6,
        thickness: 0.8,
        spread: 0.8,
      },
    ],
  },
  assert: {
    highlight: ['psuSupervisor', 'psuOutput', 'atx24'],
    signals: [
      {
        route: ['psuSupervisor', 'psuOutput', 'atx24'],
        color: RAIL_COLORS.PWR_OK,
        label: 'PWR_OK → HIGH',
        particles: 14,
        persist: true,
        spread: 0.7,
        thickness: 1.2,
      },
    ],
  },
};

/** The PSU power-up stages as playable steps inside the PSU view. */
export const PSU_POWERUP_SEQUENCE_STEPS: BootStep[] = PSU_POWERUP_STAGES.map((stage) => {
  const scene = SCENE[stage.id];
  if (!scene) throw new Error(`No 3D staging for PSU power-up stage: ${stage.id}`);

  return {
    id: `psu-up-${stage.id}`,
    phase: 'power',
    title: stage.title,
    signal: stage.badge,
    description: stage.note
      ? {
          en: `${stage.description.en} ${stage.note.en}`,
          tr: `${stage.description.tr} ${stage.note.tr}`,
        }
      : stage.description,
    duration: 5200,
    view: 'psu',
    screen: 'off',
    depth: 1,
    highlight: scene.highlight,
    signals: scene.signals,
  };
});

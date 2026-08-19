import type { ModalStage } from '../types';
import { VRM_SEQUENCE_STEPS } from './vrmSequence';

/**
 * Which blocks of the VRM diagram light up at each step of the walkthrough.
 *
 * Kept apart from the prose the same way PSU_STAGE_SCENE is: the explanation
 * lives once, in vrmSequence.ts, and is shown both on the timeline card and in
 * the dialog. This file only says where to look while reading it, so the two
 * can never describe different things.
 *
 * Keys are the chain step ids with the `vrm-` prefix removed, which is also
 * what the detail button on a card uses to open the dialog at the right stage.
 */
const STAGE_FOCUS: Record<string, { nodes: string[]; edges?: string[] }> = {
  handoff: {
    nodes: ['pwrok', 'sequencer'],
    edges: ['e-pwrok-seq'],
  },
  why: {
    nodes: ['eps', 'controller', 'vcore'],
    edges: ['e-eps-ctrl'],
  },
  phases: {
    nodes: ['controller', 'phase1', 'phase2', 'phase3', 'phase4', 'plane'],
    edges: [
      'e-ctrl-p1',
      'e-ctrl-p2',
      'e-ctrl-p3',
      'e-ctrl-p4',
      'e-p1-plane',
      'e-p2-plane',
      'e-p3-plane',
      'e-p4-plane',
    ],
  },
  rails: {
    nodes: ['plane', 'vcore', 'vccsa', 'vddq'],
    edges: ['e-plane-vcore', 'e-plane-vccsa', 'e-plane-vddq'],
  },
  order: {
    nodes: ['sequencer', 'controller', 'vccsa', 'vddq'],
    edges: ['e-seq-ctrl'],
  },
  pwrgd: {
    nodes: ['vcore', 'vccsa', 'pwrgd'],
    edges: ['e-vcore-pwrgd', 'e-vccsa-pwrgd'],
  },
  gate: {
    nodes: ['pwrgd', 'sequencer'],
    edges: ['e-pwrgd-seq'],
  },
  reset: {
    nodes: ['sequencer', 'vcore', 'sense'],
    edges: ['e-sense-plane', 'e-sense-ctrl'],
  },
};

/**
 * The walkthrough shown in the VRM dialog: the same eight steps the timeline
 * plays, adapted to the shape the dialog widget expects.
 */
export const VRM_STAGES: ModalStage[] = VRM_SEQUENCE_STEPS.map((step) => {
  const key = step.id.replace(/^vrm-/, '');
  const focus = STAGE_FOCUS[key];
  if (!focus) throw new Error(`No VRM diagram focus defined for stage: ${key}`);

  return {
    id: key,
    title: step.title,
    badge: step.signal ?? 'VRM',
    description: step.description,
    nodes: focus.nodes,
    ...(focus.edges ? { edges: focus.edges } : {}),
  };
});

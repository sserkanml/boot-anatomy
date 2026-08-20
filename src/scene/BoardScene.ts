import { Group, type Object3D, type Scene } from 'three';
import {
  BOARD_VIEW_ANCHORS,
  EC_VIEW_ANCHORS,
  PSU_VIEW_ANCHORS,
  VRM_VIEW_ANCHORS,
  CPU_VIEW_ANCHORS,
  COREBOOT_VIEW_ANCHORS,
} from '../config/anchors';
import { BOOT_STEPS } from '../config/bootSteps';
import { SignalOrchestrator } from '../signals/SignalOrchestrator';
import type { BootStep, SceneView } from '../types';
import { AnchorLabels } from './AnchorLabels';
import { AnchorRegistry } from './AnchorRegistry';
import { createMonitor, type MonitorObject } from './monitor';
import { createPlaceholderBoard, createPowerButtonProp } from './placeholderBoard';
import { createPsu, type PsuObject } from './psu';
import { createEcInternals, type EcInternals } from './ecInternals';
import { createPsuInternals, type PsuInternals } from './psuInternals';

/** The PSU fan spins from this step onward (when the main converter turns on). */
const PSU_RUNNING_FROM = BOOT_STEPS.findIndex((step) => step.id === 'rails');

/**
 * The contents of the scene: the motherboard (placeholder or real model), the
 * PSU, the monitor, the labels and the signal orchestrator. It knows nothing
 * about timing — main.ts tells it which step is active.
 */
export class BoardScene {
  readonly anchors = new AnchorRegistry();
  readonly signals: SignalOrchestrator;

  /**
   * Invoked when the PSU is activated, either by clicking it in the scene or by
   * pressing its label. Assigned by main.ts once the UI exists.
   */
  onPsuActivate: (() => void) | null = null;

  /** Invoked when the Super I/O / EC label is activated. */
  onEcActivate: (() => void) | null = null;

  private readonly root = new Group();
  private readonly labels: AnchorLabels;
  private readonly psu: PsuObject;
  private readonly internals: PsuInternals;
  private readonly ecInternals: EcInternals;
  private readonly monitor: MonitorObject;
  private view: SceneView = 'board';
  private readonly placeholder = createPlaceholderBoard();
  private readonly powerButton = createPowerButtonProp();
  private model: Object3D | null = null;
  private currentStep: BootStep | null = null;

  constructor(scene: Scene) {
    this.root.name = 'board-scene';
    scene.add(this.root);

    this.root.add(this.placeholder.group, this.powerButton.group);

    this.psu = createPsu();
    this.root.add(this.psu.group);

    this.internals = createPsuInternals();
    this.root.add(this.internals.group);

    this.ecInternals = createEcInternals();
    this.root.add(this.ecInternals.group);

    this.monitor = createMonitor();
    this.root.add(this.monitor.group);

    this.signals = new SignalOrchestrator(this.root, this.anchors);
    this.labels = new AnchorLabels(this.anchors, this.root, {
      actions: {
        psu: () => this.onPsuActivate?.(),
        superio: () => this.onEcActivate?.(),
      },
    });
    this.labels.setVisibleSet(BOARD_VIEW_ANCHORS);
  }

  /**
   * Switches between framing the motherboard and looking inside the PSU. The
   * board is deliberately left in place while the PSU is open, so the spatial
   * relationship between the two is never lost.
   */
  setView(view: SceneView): void {
    if (this.view === view) return;
    this.view = view;

    const inPsu = view === 'psu';
    const inEc = view === 'ec';

    this.internals.setVisible(inPsu);
    this.psu.setShellOpacity(inPsu ? 0.12 : 1);
    this.ecInternals.setVisible(inEc);

    const labelSet =
      inPsu
        ? PSU_VIEW_ANCHORS
        : inEc
          ? EC_VIEW_ANCHORS
          : view === 'vrm'
            ? VRM_VIEW_ANCHORS
            : view === 'cpu'
              ? CPU_VIEW_ANCHORS
              : view === 'coreboot'
                ? COREBOOT_VIEW_ANCHORS
                : BOARD_VIEW_ANCHORS;
    this.labels.setVisibleSet(labelSet);
    this.signals.clear();
  }

  get currentView(): SceneView {
    return this.view;
  }

  /** The PSU assembly, registered with the Picker so it can be clicked. */
  get psuObject(): Object3D {
    return this.psu.group;
  }

  setPsuHighlighted(highlighted: boolean): void {
    this.psu.setHighlighted(highlighted);
  }

  /**
   * Puts the loaded GLB model to work: hides the placeholder board, re-derives
   * the anchors from the model's meshes and rebuilds the active step's paths.
   */
  setModel(model: Object3D): void {
    this.model = model;
    this.root.add(model);

    this.placeholder.group.visible = false;

    const bound = this.anchors.bindFromModel(model);
    this.labels.refresh();

    // The anchor coordinates changed, so the existing path geometry is stale.
    this.signals.clear();
    if (this.currentStep) this.applyStep(this.currentStep, this.currentIndex);

    console.info(
      `[boot-anatomy] Model active. Anchors bound from the model: ${
        bound.length > 0 ? bound.join(', ') : 'none (all placeholders)'
      }`,
    );
  }

  private currentIndex = 0;

  /**
   * Hands the chain to the signal layer, which needs it to reconstruct the
   * board when a step is picked out of order rather than played into.
   */
  setChain(steps: readonly BootStep[]): void {
    this.signals.setChain(steps);
  }

  /** Applies the active step to the scene. */
  applyStep(step: BootStep, index: number): void {
    this.currentStep = step;
    this.currentIndex = index;

    this.signals.enterStep(step, index);
    this.labels.setActive(step.highlight ?? []);
    this.internals.setBarrierActive(step.id === 'psu-transformer');

    // Both of these are a function of where you are, not of how you got here.
    //
    // The monitor used to update only on board-view steps, which dated from
    // when the PSU chain was a detour you could enter at any moment. Once the
    // chain was flattened that guard hid two thirds of it — every coreboot,
    // GRUB and kernel step asking for the boot log was ignored, so the screen
    // kept whatever the last board step happened to leave on it. Each step now
    // states the screen for its own position and the monitor simply obeys.
    this.monitor.setScreen(step.screen ?? 'off', step.console ?? []);
    this.psu.setRunning(PSU_RUNNING_FROM >= 0 && index >= PSU_RUNNING_FROM);
  }

  setStepProgress(progress: number): void {
    this.signals.setStepProgress(progress);
  }

  /** Clears the scene when starting over. */
  reset(): void {
    this.signals.clear();
    this.psu.setRunning(false);
    this.monitor.setScreen('off', []);
  }

  update(dt: number, elapsed: number): void {
    this.signals.update(dt, elapsed);
    this.psu.update(dt);
    this.internals.update(dt);
    this.ecInternals.update(dt);
    this.monitor.update(dt);
  }

  dispose(): void {
    this.signals.dispose();
    this.labels.dispose();
    this.psu.dispose();
    this.internals.dispose();
    this.ecInternals.dispose();
    this.monitor.dispose();
    this.placeholder.dispose();
    this.powerButton.dispose();
    this.model?.removeFromParent();
    this.root.removeFromParent();
  }
}

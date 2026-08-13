import { Group, type Object3D, type Scene } from 'three';
import { BOOT_STEPS } from '../config/bootSteps';
import { SignalOrchestrator } from '../signals/SignalOrchestrator';
import type { BootStep } from '../types';
import { AnchorLabels } from './AnchorLabels';
import { AnchorRegistry } from './AnchorRegistry';
import { createMonitor, type MonitorObject } from './monitor';
import { createPlaceholderBoard, createPowerButtonProp } from './placeholderBoard';
import { createPsu, type PsuObject } from './psu';

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

  private readonly root = new Group();
  private readonly labels: AnchorLabels;
  private readonly psu: PsuObject;
  private readonly monitor: MonitorObject;
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

    this.monitor = createMonitor();
    this.root.add(this.monitor.group);

    this.signals = new SignalOrchestrator(this.root, this.anchors);
    this.labels = new AnchorLabels(this.anchors, this.root);
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

  /** Applies the active step to the scene. */
  applyStep(step: BootStep, index: number): void {
    this.currentStep = step;
    this.currentIndex = index;

    this.signals.enterStep(step);
    this.labels.setActive(step.highlight ?? []);
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
    this.monitor.update(dt);
  }

  dispose(): void {
    this.signals.dispose();
    this.labels.dispose();
    this.psu.dispose();
    this.monitor.dispose();
    this.placeholder.dispose();
    this.powerButton.dispose();
    this.model?.removeFromParent();
    this.root.removeFromParent();
  }
}

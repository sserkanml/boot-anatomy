import { Group, type Object3D, type Texture } from 'three';
import type { AnchorRegistry } from '../scene/AnchorRegistry';
import { createGlowTexture } from '../scene/textures';
import type { BootStep, SignalSpec } from '../types';
import { SignalPath } from './SignalPath';
import { buildRoutePoints } from './routing';

/** How long non-persistent paths take to fade out on a step change (seconds). */
const FADE_DURATION = 0.7;

interface ActiveSignal {
  path: SignalPath;
  spec: SignalSpec;
  delay: number;
  spread: number;
  persist: boolean;
  /** No reveal animation; the path starts fully drawn. */
  instant: boolean;
  /** Its step is over and it is fading out. */
  fading: boolean;
  fadeElapsed: number;
}

/**
 * Translates boot steps into 3D signal paths.
 *
 * It does not listen to BootSequence — main.ts forwards the events here. That
 * keeps the orchestrator pure and drivable on its own in a test.
 */
export class SignalOrchestrator {
  private readonly root = new Group();
  private readonly glowTexture: Texture;
  private active: ActiveSignal[] = [];
  private currentStepId: string | null = null;

  constructor(
    parent: Object3D,
    private readonly anchors: AnchorRegistry,
  ) {
    this.root.name = 'signals';
    parent.add(this.root);
    this.glowTexture = createGlowTexture();
  }

  /**
   * Moves to a new step: starts fading out the previous step's temporary paths
   * and creates the new ones. Persistent paths stay on screen.
   */
  enterStep(step: BootStep): void {
    if (this.currentStepId === step.id) return;
    this.currentStepId = step.id;

    for (const signal of this.active) {
      if (!signal.persist) signal.fading = true;
    }

    for (const spec of step.signals) {
      this.active.push(this.createSignal(spec));
    }
  }

  /** Progress of the active step (0..1) — drives how much of each path is drawn. */
  setStepProgress(progress: number): void {
    for (const signal of this.active) {
      if (signal.fading || signal.instant) continue;
      // Every path has its own time window inside the step.
      const local = (progress - signal.delay) / signal.spread;
      signal.path.setProgress(local);
    }
  }

  update(dt: number, elapsed: number): void {
    for (let i = this.active.length - 1; i >= 0; i -= 1) {
      const signal = this.active[i]!;
      signal.path.update(elapsed);

      if (!signal.fading) continue;

      signal.fadeElapsed += dt;
      const remaining = 1 - signal.fadeElapsed / FADE_DURATION;
      if (remaining <= 0) {
        signal.path.dispose();
        this.active.splice(i, 1);
      } else {
        signal.path.setOpacity(remaining);
      }
    }
  }

  /** Removes every path immediately (on reset and after the model loads). */
  clear(): void {
    for (const signal of this.active) signal.path.dispose();
    this.active = [];
    this.currentStepId = null;
  }

  dispose(): void {
    this.clear();
    this.glowTexture.dispose();
    this.root.removeFromParent();
  }

  private createSignal(spec: SignalSpec): ActiveSignal {
    const path = new SignalPath({
      points: buildRoutePoints(this.anchors, spec.route),
      color: spec.color,
      particles: spec.particles ?? 8,
      thickness: spec.thickness ?? 1,
      glowTexture: this.glowTexture,
    });

    this.root.add(path.group);

    const instant = spec.instant ?? false;
    // Paths without a reveal animation show up fully drawn.
    if (instant) path.setProgress(1);

    const delay = spec.delay ?? 0;
    // Default: spread across whatever time is left after the delay.
    const spread = Math.max(0.05, spec.spread ?? Math.max(0.05, 0.85 - delay));

    return {
      path,
      spec,
      delay,
      spread,
      instant,
      persist: spec.persist ?? false,
      fading: false,
      fadeElapsed: 0,
    };
  }
}

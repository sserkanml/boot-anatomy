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
  /** -1 means nothing has been entered yet, so any step is a jump. */
  private currentIndex = -1;
  /**
   * The whole chain, needed because what belongs on screen is a function of
   * where you are, not of how you got there. Without it the orchestrator can
   * only move forward one step at a time.
   */
  private chain: readonly BootStep[] = [];

  constructor(
    parent: Object3D,
    private readonly anchors: AnchorRegistry,
  ) {
    this.root.name = 'signals';
    parent.add(this.root);
    this.glowTexture = createGlowTexture();
  }

  /** The chain the indices passed to enterStep refer to. */
  setChain(steps: readonly BootStep[]): void {
    this.chain = steps;
  }

  /**
   * Moves to a step.
   *
   * Playing straight through is the cheap case: the previous step's temporary
   * paths start fading, the persistent ones stay, and the new ones are added.
   *
   * Any other move — picking a step from the timeline, stepping backwards — is
   * a jump, and there the incremental approach is simply wrong. Jumping forward
   * would miss every persistent rail raised in between, and jumping backwards
   * would leave the future still drawn on the board. So a jump rebuilds the
   * scene from the chain: every persistent path from the steps before this one,
   * drawn as already established, then this step's own.
   */
  enterStep(step: BootStep, index: number): void {
    if (this.currentStepId === step.id && this.currentIndex === index) return;

    const sequential = index === this.currentIndex + 1;
    this.currentStepId = step.id;
    this.currentIndex = index;

    if (sequential) {
      for (const signal of this.active) {
        if (!signal.persist) signal.fading = true;
      }
    } else {
      this.rebuildHistory(index);
    }

    for (const spec of step.signals) {
      this.active.push(this.createSignal(spec));
    }
  }

  /**
   * Puts the board into the state the steps before `index` would have left it
   * in. Only persistent paths survive a step, so only those are replayed, and
   * they are drawn complete rather than animated — they are history, not
   * something happening now.
   */
  private rebuildHistory(index: number): void {
    this.disposeAll();

    for (let i = 0; i < index && i < this.chain.length; i += 1) {
      for (const spec of this.chain[i]!.signals) {
        if (spec.persist) this.active.push(this.createSignal(spec, true));
      }
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
    this.disposeAll();
    this.currentStepId = null;
    this.currentIndex = -1;
  }

  /** Drops every path without forgetting where we are. */
  private disposeAll(): void {
    for (const signal of this.active) signal.path.dispose();
    this.active = [];
  }

  dispose(): void {
    this.clear();
    this.glowTexture.dispose();
    this.root.removeFromParent();
  }

  /**
   * `alreadyDrawn` is for paths replayed from history: they appear complete and
   * are excluded from progress updates, so the current step's progress cannot
   * rewind a rail that was raised long before it.
   */
  private createSignal(spec: SignalSpec, alreadyDrawn = false): ActiveSignal {
    const path = new SignalPath({
      points: buildRoutePoints(this.anchors, spec.route),
      color: spec.color,
      particles: spec.particles ?? 8,
      thickness: spec.thickness ?? 1,
      glowTexture: this.glowTexture,
    });

    this.root.add(path.group);

    const instant = alreadyDrawn || (spec.instant ?? false);
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

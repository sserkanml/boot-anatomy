import { BOOT_STEPS, FIRST_ACTIVE_STEP } from '../config/bootSteps';
import type { BootState, BootStep } from '../types';
import { Emitter } from './Emitter';

export interface BootEvents {
  /** A new step was entered. */
  'step:enter': { step: BootStep; index: number };
  /** A step was left (moving on to the next one, or on reset). */
  'step:exit': { step: BootStep; index: number };
  /** Emitted every frame. */
  progress: { index: number; stepProgress: number; totalProgress: number };
  /** idle / running / complete transitions. */
  state: { state: BootState };
  /** The end of the chain was reached. */
  complete: undefined;
}

/**
 * The finite state machine driving the boot chain. It knows nothing about
 * Three.js or the DOM; the scene and UI layers merely listen to the events it
 * emits. Thanks to that separation, changing the visualization never requires
 * touching this file.
 */
export class BootSequence extends Emitter<BootEvents> {
  readonly steps: readonly BootStep[];

  private index = 0;
  private elapsed = 0; // time spent in the active step (ms)
  private currentState: BootState = 'idle';
  private paused = false;
  private speed = 1;
  /**
   * Index the chain starts from. The main chain reserves index 0 for a passive
   * step shown at idle; the PSU sub-chain has no such step and starts at 0.
   */
  private readonly firstActive: number;

  constructor(
    steps: readonly BootStep[] = BOOT_STEPS,
    firstActiveIndex: number = FIRST_ACTIVE_STEP,
  ) {
    super();
    this.steps = steps;
    this.firstActive = firstActiveIndex;
  }

  get state(): BootState {
    return this.currentState;
  }

  get currentIndex(): number {
    return this.index;
  }

  get currentStep(): BootStep {
    // The step list can never be empty; the config file defines at least one.
    return this.steps[this.index]!;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  /** Total duration (ms) — from the first active step to the end of the chain. */
  get totalDuration(): number {
    return this.steps
      .slice(this.firstActive)
      .reduce((sum, step) => sum + step.duration, 0);
  }

  /**
   * Called once the scene is ready: shows the passive standby step (index 0)
   * without starting the timer.
   */
  init(): void {
    this.index = 0;
    this.elapsed = 0;
    this.setState('idle');
    this.emit('step:enter', { step: this.currentStep, index: 0 });
  }

  /** The power button. Starts the chain from the first active step. */
  start(): void {
    if (this.currentState === 'running') return;
    this.paused = false;
    this.goTo(this.firstActive);
    this.setState('running');
  }

  /** Skips the active step and moves to the next one. */
  next(): void {
    if (this.currentState === 'complete') return;
    if (this.currentState === 'idle') {
      this.start();
      return;
    }
    this.advance();
  }

  /** Goes back to the previous step. */
  previous(): void {
    if (this.index <= this.firstActive) return;
    this.goTo(this.index - 1);
    this.setState('running');
  }

  /** Jumps straight to a step from the timeline. */
  seek(index: number): void {
    const clamped = Math.min(this.steps.length - 1, Math.max(0, index));
    if (clamped === this.index && this.currentState !== 'complete') return;
    // Change the state first: 'idle' listeners clear the scene, so they have to
    // run before the new step's paths are built.
    this.setState(clamped < this.firstActive ? 'idle' : 'running');
    this.goTo(clamped);
  }

  /**
   * Re-announces the current step without changing anything. Used after the UI
   * is rebuilt (on a language change) so the fresh panels repopulate.
   */
  emitCurrent(): void {
    this.emit('step:enter', { step: this.currentStep, index: this.index });
    this.emitProgress();
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  togglePaused(): boolean {
    this.paused = !this.paused;
    return this.paused;
  }

  setSpeed(speed: number): void {
    this.speed = Math.max(0.1, speed);
  }

  /** Starts over: returns to the passive standby state. */
  reset(): void {
    this.emit('step:exit', { step: this.currentStep, index: this.index });
    this.paused = false;
    this.init();
  }

  /**
   * Called every frame.
   * @param dt Elapsed time in seconds.
   */
  update(dt: number): void {
    if (this.currentState !== 'running' || this.paused) return;

    this.elapsed += dt * 1000 * this.speed;
    const duration = this.currentStep.duration;

    if (this.elapsed >= duration) {
      this.advance();
      return;
    }

    this.emitProgress();
  }

  private advance(): void {
    const nextIndex = this.index + 1;
    if (nextIndex >= this.steps.length) {
      this.emit('step:exit', { step: this.currentStep, index: this.index });
      this.elapsed = this.currentStep.duration;
      this.setState('complete');
      this.emit('complete', undefined);
      return;
    }
    this.goTo(nextIndex);
  }

  private goTo(index: number): void {
    this.emit('step:exit', { step: this.currentStep, index: this.index });
    this.index = index;
    this.elapsed = 0;
    this.emit('step:enter', { step: this.currentStep, index });
    this.emitProgress();
  }

  private emitProgress(): void {
    const stepProgress = Math.min(1, this.elapsed / this.currentStep.duration);

    let elapsedBefore = 0;
    for (let i = this.firstActive; i < this.index; i += 1) {
      elapsedBefore += this.steps[i]!.duration;
    }
    const total = this.totalDuration;
    const totalProgress =
      total === 0
        ? 0
        : Math.min(1, (elapsedBefore + stepProgress * this.currentStep.duration) / total);

    this.emit('progress', { index: this.index, stepProgress, totalProgress });
  }

  private setState(state: BootState): void {
    if (this.currentState === state) return;
    this.currentState = state;
    this.emit('state', { state });
  }
}

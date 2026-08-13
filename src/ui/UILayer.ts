import type { BootSequence } from '../state/BootSequence';
import { ConsolePanel } from './ConsolePanel';
import { Controls } from './Controls';
import { InfoPanel } from './InfoPanel';
import { Timeline } from './Timeline';

/**
 * Builds the entire DOM interface and wires it to BootSequence events.
 *
 * It knows nothing about the scene layer; the two stay in sync because both
 * listen to the same state machine. If you ever move the UI to React, this is
 * the only folder that changes.
 */
export class UILayer {
  private readonly infoPanel: InfoPanel;
  private readonly timeline: Timeline;
  private readonly consolePanel: ConsolePanel;
  private readonly controls: Controls;
  private readonly disposers: Array<() => void> = [];

  constructor(
    private readonly root: HTMLElement,
    private readonly sequence: BootSequence,
  ) {
    this.infoPanel = new InfoPanel(sequence.steps.length);
    this.consolePanel = new ConsolePanel();
    this.timeline = new Timeline(sequence.steps, (index) => sequence.seek(index));
    this.controls = new Controls({
      onPower: () => sequence.start(),
      onPrevious: () => sequence.previous(),
      onNext: () => sequence.next(),
      onTogglePause: () => this.controls.setPaused(sequence.togglePaused()),
      onReset: () => sequence.reset(),
    });

    this.root.append(
      this.createBrand(),
      this.timeline.element,
      this.infoPanel.element,
      this.consolePanel.element,
      this.controls.element,
      this.createHint(),
    );

    this.bindSequence();
    this.bindKeyboard();
  }

  dispose(): void {
    for (const dispose of this.disposers) dispose();
    this.root.replaceChildren();
  }

  private bindSequence(): void {
    const { sequence } = this;

    this.disposers.push(
      sequence.on('step:enter', ({ step, index }) => {
        this.infoPanel.setStep(step, index);
        this.infoPanel.setProgress(0);
        this.timeline.setActive(index);
        this.consolePanel.setLines(step.console);
      }),

      sequence.on('progress', ({ stepProgress }) => {
        this.infoPanel.setProgress(stepProgress);
        this.consolePanel.setProgress(stepProgress);
      }),

      sequence.on('state', ({ state }) => {
        this.controls.setState(state);
        this.controls.setPaused(sequence.isPaused);
      }),

      sequence.on('complete', () => {
        this.infoPanel.setProgress(1);
        this.consolePanel.setProgress(1);
      }),
    );

    this.controls.setState(sequence.state);
  }

  private bindKeyboard(): void {
    const onKeyDown = (event: KeyboardEvent): void => {
      // Disable the shortcuts while a form element has focus.
      if (event.target instanceof HTMLInputElement) return;

      switch (event.key) {
        case ' ':
          event.preventDefault();
          if (this.sequence.state === 'idle') this.sequence.start();
          else this.controls.setPaused(this.sequence.togglePaused());
          break;
        case 'ArrowRight':
          this.sequence.next();
          break;
        case 'ArrowLeft':
          this.sequence.previous();
          break;
        case 'r':
        case 'R':
          this.sequence.reset();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    this.disposers.push(() => window.removeEventListener('keydown', onKeyDown));
  }

  private createBrand(): HTMLElement {
    const brand = document.createElement('header');
    brand.className = 'brand';
    brand.innerHTML = `
      <h1>Boot<span>Anatomy</span></h1>
      <p>From power button to login screen: the order in which a desktop wakes up.</p>
    `;
    return brand;
  }

  private createHint(): HTMLElement {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.innerHTML = `
      <span>Drag: orbit</span>
      <span>Scroll: zoom</span>
      <span>Space / &larr; &rarr; / R</span>
    `;
    return hint;
  }
}

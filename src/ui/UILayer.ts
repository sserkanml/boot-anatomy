import { t } from '../i18n';
import { UI } from '../i18n/strings';
import type { BootSequence } from '../state/BootSequence';
import type { BootStep } from '../types';
import { ConsolePanel } from './ConsolePanel';
import { Controls } from './Controls';
import { InfoPanel } from './InfoPanel';
import { LanguageSwitch } from './LanguageSwitch';
import { createEcModal } from './EcModal';
import { createPsuModal } from './PsuModal';
import { createPsuPowerUpModal } from './PsuPowerUpModal';
import type { ReferenceModal } from './ReferenceModal';
import { Timeline } from './Timeline';

/**
 * Builds the entire DOM interface and wires it to BootSequence events.
 *
 * It knows nothing about the scene layer; the two stay in sync because both
 * listen to the same state machine. If you ever move the UI to React, this is
 * the only folder that changes.
 *
 * There are two chains: the board chain, and the PSU chain that plays inside
 * the unit. Only one is ever running — entering the PSU pauses the board.
 */
export class UILayer {
  private readonly infoPanel: InfoPanel;
  private readonly timeline: Timeline;
  private readonly consolePanel: ConsolePanel;
  private readonly controls: Controls;
  private readonly psuModal: ReferenceModal;
  private readonly ecModal: ReferenceModal;
  private readonly psuPowerUpModal: ReferenceModal;
  private readonly disposers: Array<() => void> = [];

  constructor(
    private readonly root: HTMLElement,
    private readonly sequence: BootSequence,
  ) {
    this.infoPanel = new InfoPanel(sequence.steps.length, (step) => this.openSchematic(step));
    this.consolePanel = new ConsolePanel();
    this.timeline = new Timeline(sequence.steps, {
      onSelect: (index) => sequence.seek(index),
    });
    this.controls = new Controls({
      onPower: () => sequence.start(),
      onPrevious: () => sequence.previous(),
      onNext: () => sequence.next(),
      onTogglePause: () => this.controls.setPaused(sequence.togglePaused()),
      onReset: () => sequence.reset(),
    });

    this.psuModal = createPsuModal();
    this.ecModal = createEcModal();
    this.psuPowerUpModal = createPsuPowerUpModal();

    this.root.append(
      this.createBrand(),
      new LanguageSwitch().element,
      this.timeline.element,
      this.infoPanel.element,
      this.consolePanel.element,
      this.controls.element,
      this.createHint(),
      this.psuModal.element,
      this.ecModal.element,
      this.psuPowerUpModal.element,
    );

    this.bindSequence();
    this.bindKeyboard();
  }

  /** The section steps that have a diagram behind them. */
  private openSchematic(step: BootStep): void {
    if (step.id === 'psu') this.psuModal.openAt(0);
    else if (step.id === 'ps-on') this.ecModal.openAt(0);
    else if (step.id === 'rails') this.psuPowerUpModal.openAt(0);
  }

  get isModalOpen(): boolean {
    return this.psuModal.isOpen || this.ecModal.isOpen || this.psuPowerUpModal.isOpen;
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
      // The block-diagram dialog owns the keyboard while it is open.
      if (this.isModalOpen) return;

      const active = this.sequence;

      switch (event.key) {
        case ' ':
          event.preventDefault();
          if (active.state === 'idle') active.start();
          else this.controls.setPaused(active.togglePaused());
          break;
        case 'ArrowRight':
          active.next();
          break;
        case 'ArrowLeft':
          active.previous();
          break;
        case 'r':
        case 'R':
          active.reset();
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
      <p>${t(UI.brandTagline)}</p>
    `;
    return brand;
  }

  private createHint(): HTMLElement {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.innerHTML = `
      <span>${t(UI.hintOrbit)}</span>
      <span>${t(UI.hintZoom)}</span>
      <span>${t(UI.hintPsu)}</span>
    `;
    return hint;
  }
}

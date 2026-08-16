import { t } from '../i18n';
import { UI } from '../i18n/strings';
import { EC_SEQUENCE_STEPS } from '../config/ecSequence';
import { PSU_SEQUENCE_STEPS } from '../config/bootSteps';
import type { BootSequence } from '../state/BootSequence';
import type { SceneView, SubstepAction } from '../types';
import { ConsolePanel } from './ConsolePanel';
import { Controls } from './Controls';
import { InfoPanel } from './InfoPanel';
import { LanguageSwitch } from './LanguageSwitch';
import { createEcModal } from './EcModal';
import { createPsuModal } from './PsuModal';
import { createPsuPowerUpModal } from './PsuPowerUpModal';
import { PsuPanel } from './PsuPanel';
import type { ReferenceModal } from './ReferenceModal';
import { Timeline } from './Timeline';

export interface UIHandlers {
  /** Fired when the scene should reframe, e.g. on entering the PSU. */
  onViewChange: (view: SceneView) => void;
}

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
  private readonly psuPanel: PsuPanel;
  private readonly ecPanel: PsuPanel;
  private readonly disposers: Array<() => void> = [];
  /** Whether the board chain should resume once we leave the PSU. */
  private resumeAfterPsu = false;

  constructor(
    private readonly root: HTMLElement,
    private readonly sequence: BootSequence,
    private readonly psuSequence: BootSequence,
    private readonly ecSequence: BootSequence,
    private readonly handlers: UIHandlers,
  ) {
    this.infoPanel = new InfoPanel(sequence.steps.length, (step) =>
      this.openSubsteps(step.substepAction, 0),
    );
    this.consolePanel = new ConsolePanel();
    this.timeline = new Timeline(sequence.steps, {
      onSelect: (index) => {
        this.exitWalkthrough();
        sequence.seek(index);
      },
      onSelectSubstep: (parentIndex, substepIndex) =>
        this.openSubsteps(sequence.steps[parentIndex]?.substepAction, substepIndex),
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
    this.psuPanel = new PsuPanel(
      psuSequence,
      { id: 'psu', eyebrow: UI.psuEyebrow, title: UI.psuTitle, steps: PSU_SEQUENCE_STEPS },
      { onExit: () => this.exitWalkthrough(), onSchematic: () => this.psuModal.openAt(0) },
    );
    this.ecPanel = new PsuPanel(
      ecSequence,
      { id: 'ec', eyebrow: UI.ecEyebrow, title: UI.ecViewTitle, steps: EC_SEQUENCE_STEPS },
      { onExit: () => this.exitWalkthrough(), onSchematic: () => this.ecModal.openAt(0) },
    );

    this.root.append(
      this.createBrand(),
      new LanguageSwitch().element,
      this.timeline.element,
      this.infoPanel.element,
      this.consolePanel.element,
      this.controls.element,
      this.createHint(),
      this.psuPanel.element,
      this.ecPanel.element,
      this.psuModal.element,
      this.ecModal.element,
      this.psuPowerUpModal.element,
    );

    this.bindSequence();
    this.bindKeyboard();
  }

  /**
   * Opens a walkthrough view and starts its chain at the given stage. The board
   * chain is paused so the two are never animating at once.
   */
  enterWalkthrough(view: 'psu' | 'ec', stageIndex = 0): void {
    const panel = view === 'ec' ? this.ecPanel : this.psuPanel;
    const chain = view === 'ec' ? this.ecSequence : this.psuSequence;

    if (!panel.isOpen) {
      // Leaving whichever one might already be open keeps the two exclusive.
      this.exitWalkthrough();
      this.resumeAfterPsu = this.sequence.state === 'running' && !this.sequence.isPaused;
      this.sequence.setPaused(true);
      this.controls.setPaused(true);
      this.root.classList.add('is-psu-view');
      panel.show();
      this.handlers.onViewChange(view);
    }

    chain.setPaused(false);
    panel.setPaused(false);
    // seek() alone would leave stage 0 idle, so start the chain first.
    chain.start();
    chain.seek(stageIndex);
  }

  /** Backwards-compatible entry point for the PSU, used by the picker. */
  enterPsuView(stageIndex = 0): void {
    this.enterWalkthrough('psu', stageIndex);
  }

  exitWalkthrough(): void {
    const open = this.psuPanel.isOpen ? this.psuPanel : this.ecPanel.isOpen ? this.ecPanel : null;
    if (!open) return;

    this.psuSequence.setPaused(true);
    this.ecSequence.setPaused(true);
    open.hide();
    this.root.classList.remove('is-psu-view');
    this.handlers.onViewChange('board');

    if (this.resumeAfterPsu) this.sequence.setPaused(false);
    this.controls.setPaused(this.sequence.isPaused);
  }

  get isPsuViewOpen(): boolean {
    return this.psuPanel.isOpen || this.ecPanel.isOpen;
  }

  /**
   * Opens whichever walkthrough a step's nested stages belong to. The PSU is
   * explored in the scene itself; the EC, being a single chip, in a dialog.
   */
  private openSubsteps(action: SubstepAction | undefined, index: number): void {
    if (action === 'ec') this.enterWalkthrough('ec', index);
    else if (action === 'psu-powerup') this.psuPowerUpModal.openAt(index);
    else this.enterWalkthrough('psu', index);
  }

  /** Opens the EC walkthrough in the scene; wired to the Super I/O / EC label. */
  openEcView(): void {
    this.enterWalkthrough('ec', 0);
  }

  get isModalOpen(): boolean {
    return this.psuModal.isOpen || this.ecModal.isOpen || this.psuPowerUpModal.isOpen;
  }

  private get activePanel(): PsuPanel | null {
    if (this.psuPanel.isOpen) return this.psuPanel;
    if (this.ecPanel.isOpen) return this.ecPanel;
    return null;
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

      // Inside the PSU the same keys drive the PSU chain instead.
      const active = this.psuPanel.isOpen
        ? this.psuSequence
        : this.ecPanel.isOpen
          ? this.ecSequence
          : this.sequence;

      switch (event.key) {
        case 'Escape':
          this.exitWalkthrough();
          break;
        case ' ':
          event.preventDefault();
          if (this.isPsuViewOpen) this.activePanel?.setPaused(active.togglePaused());
          else if (active.state === 'idle') active.start();
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
          if (!this.isPsuViewOpen) active.reset();
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

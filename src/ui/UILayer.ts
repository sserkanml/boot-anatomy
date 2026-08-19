import { t, type Localized } from '../i18n';
import { UI } from '../i18n/strings';
import type { BootSequence } from '../state/BootSequence';
import type { BootStep } from '../types';
import { ConsolePanel } from './ConsolePanel';
import { Controls } from './Controls';
import { InfoPanel } from './InfoPanel';
import { LanguageSwitch } from './LanguageSwitch';
import { createEcModal } from './EcModal';
import { createKernelModal } from './KernelModal';
import { createPsuModal } from './PsuModal';
import { createPsuPowerUpModal } from './PsuPowerUpModal';
import { createSystemdModal } from './SystemdModal';
import { createVrmModal } from './VrmModal';
import type { ReferenceModal } from './ReferenceModal';
import { Timeline } from './Timeline';

/**
 * What the info panel's action button says on a section step. The half that
 * opens a block diagram and the half that opens a glossary read differently,
 * and a button labelled "Block diagram" that opens a word list is worse than
 * no button. Keyed by step id so this list and openSchematic stay together.
 */
const SECTION_LABELS: Record<string, Localized> = {
  psu: UI.blockDiagram,
  'ps-on': UI.blockDiagram,
  rails: UI.blockDiagram,
  'pwr-ok': UI.blockDiagram,
  kernel: UI.tabGlossary,
  initramfs: UI.tabGlossary,
  systemd: UI.tabGlossary,
  login: UI.tabGlossary,
};

/** Which dialog a section step opens. */
type ModalKey = 'psu' | 'ec' | 'psu-powerup' | 'vrm' | 'kernel' | 'systemd';

const SECTION_MODALS: Record<string, ModalKey> = {
  psu: 'psu',
  'ps-on': 'ec',
  rails: 'psu-powerup',
  'pwr-ok': 'vrm',
  kernel: 'kernel',
  initramfs: 'kernel',
  systemd: 'systemd',
  login: 'systemd',
};

/**
 * The hardware chains whose nested steps each correspond to one stage of a
 * dialog. Every id in them is the dialog's stage id with a prefix, which is
 * what lets a card open the dialog already showing the stage being described
 * rather than dumping the reader at the beginning.
 *
 * Order matters: `psu-up-` has to be tested before `psu-`, or the power-up
 * chain would be mistaken for the supply's own.
 */
const DETAIL_CHAINS: ReadonlyArray<{ prefix: string; modal: ModalKey }> = [
  { prefix: 'psu-up-', modal: 'psu-powerup' },
  { prefix: 'psu-', modal: 'psu' },
  { prefix: 'ec-', modal: 'ec' },
  { prefix: 'vrm-', modal: 'vrm' },
];

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
  private readonly kernelModal: ReferenceModal;
  private readonly systemdModal: ReferenceModal;
  private readonly vrmModal: ReferenceModal;
  private readonly disposers: Array<() => void> = [];

  constructor(
    private readonly root: HTMLElement,
    private readonly sequence: BootSequence,
  ) {
    this.infoPanel = new InfoPanel(
      sequence.steps.length,
      (step) => this.openSchematic(step),
      (step) => this.actionLabel(step),
    );
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
    this.kernelModal = createKernelModal();
    this.systemdModal = createSystemdModal();
    this.vrmModal = createVrmModal();

    this.root.append(
      this.createBrand(),
      new LanguageSwitch().element,
      this.timeline.backdrop,
      this.timeline.element,
      this.timeline.toggle,
      this.infoPanel.element,
      this.consolePanel.element,
      this.controls.element,
      this.createHint(),
      this.psuModal.element,
      this.ecModal.element,
      this.psuPowerUpModal.element,
      this.kernelModal.element,
      this.systemdModal.element,
      this.vrmModal.element,
    );

    this.bindSequence();
    this.bindKeyboard();
  }

  private modal(key: ModalKey): ReferenceModal {
    switch (key) {
      case 'psu':
        return this.psuModal;
      case 'ec':
        return this.ecModal;
      case 'psu-powerup':
        return this.psuPowerUpModal;
      case 'vrm':
        return this.vrmModal;
      case 'kernel':
        return this.kernelModal;
      case 'systemd':
        return this.systemdModal;
    }
  }

  /**
   * A nested step's dialog and the stage inside it, or null when the step is
   * software with no diagram to point at.
   */
  private detailTarget(step: BootStep): { key: ModalKey; stageId: string } | null {
    for (const chain of DETAIL_CHAINS) {
      if (step.id.startsWith(chain.prefix)) {
        return { key: chain.modal, stageId: step.id.slice(chain.prefix.length) };
      }
    }
    return null;
  }

  /** What the action button says, or null to hide it. */
  private actionLabel(step: BootStep): Localized | null {
    const section = SECTION_LABELS[step.id];
    if (section) return section;
    return this.detailTarget(step) ? UI.vrmDetail : null;
  }

  /** Opens whatever sits behind the step — at its stage, if it has one. */
  private openSchematic(step: BootStep): void {
    const sectionKey = SECTION_MODALS[step.id];
    if (sectionKey) {
      this.modal(sectionKey).openAt(0);
      return;
    }

    const detail = this.detailTarget(step);
    if (detail) this.modal(detail.key).openStage(detail.stageId);
  }

  get isModalOpen(): boolean {
    return (
      this.psuModal.isOpen ||
      this.ecModal.isOpen ||
      this.psuPowerUpModal.isOpen ||
      this.kernelModal.isOpen ||
      this.systemdModal.isOpen ||
      this.vrmModal.isOpen
    );
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

      // Escape backs out of the step sheet before it means anything else.
      if (event.key === 'Escape' && this.timeline.isOpen) {
        this.timeline.setOpen(false);
        return;
      }

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

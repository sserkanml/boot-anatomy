import type { BootSequence } from '../state/BootSequence';
import { t, type Localized } from '../i18n';
import { UI } from '../i18n/strings';
import type { BootStep } from '../types';

export interface PsuPanelHandlers {
  /** Leave this view and return to the board. */
  onExit: () => void;
  /** Open the block-diagram dialog. */
  /** Omit when the walkthrough has no diagram of its own. */
  onSchematic?: () => void;
}

export interface PsuPanelConfig {
  /** Distinguishes the instance in the DOM. */
  id: string;
  eyebrow: Localized;
  title: Localized;
  /** The chain this panel drives; also the source of the stage list. */
  steps: readonly BootStep[];
}

/**
 * The overlay that drives the PSU view. Unlike a modal it does not block the
 * scene — the 3D animation is the point, so the panel sits to one side and the
 * stages play behind it.
 *
 * Each instance is bound to its own BootSequence, which is why stepping through
 * the PSU or the EC never disturbs where the board chain is. The same widget
 * drives both views; only the config differs.
 */
export class PsuPanel {
  readonly element: HTMLElement;

  private readonly stageButtons: HTMLButtonElement[] = [];
  private readonly title: HTMLElement;
  private readonly badge: HTMLElement;
  private readonly body: HTMLElement;
  private readonly counter: HTMLElement;
  private readonly progressBar: HTMLElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly card: HTMLElement;

  constructor(
    private readonly sequence: BootSequence,
    private readonly config: PsuPanelConfig,
    handlers: PsuPanelHandlers,
  ) {
    this.element = document.createElement('div');
    this.element.className = 'psu-view';
    this.element.dataset.view = config.id;
    this.element.hidden = true;
    this.element.innerHTML = `
      <header class="psu-view-head panel">
        <button type="button" class="psu-back" data-action="exit">${t(UI.backToBoard)}</button>
        <div class="psu-view-heading">
          <p class="psu-view-eyebrow">${t(config.eyebrow)}</p>
          <h2 class="psu-view-title">${t(config.title)}</h2>
        </div>
        <button type="button" class="psu-schematic" data-action="schematic">${t(UI.blockDiagram)}</button>
      </header>

      <nav class="panel psu-view-stages" aria-label="${t(UI.psuStages)}">
        <ol class="psu-stage-list"></ol>
      </nav>

      <section class="panel psu-view-detail" data-phase="psu">
        <div class="panel-head">
          <span class="psu-stage-badge"></span>
          <span class="psu-stage-index"></span>
        </div>
        <h3 class="psu-stage-title"></h3>
        <p class="psu-stage-desc"></p>
        <div class="progress-track"><div class="progress-bar"></div></div>
      </section>

      <div class="transport psu-view-transport">
        <button type="button" data-action="prev" title="${t(UI.previousStep)} (&larr;)">&#8249;</button>
        <button type="button" data-action="pause" title="${t(UI.pause)} (Space)">${t(UI.pause)}</button>
        <button type="button" data-action="next" title="${t(UI.nextStep)} (&rarr;)">&#8250;</button>
      </div>
    `;

    this.title = this.query('.psu-stage-title');
    this.badge = this.query('.psu-stage-badge');
    this.body = this.query('.psu-stage-desc');
    this.counter = this.query('.psu-stage-index');
    this.progressBar = this.query('.progress-bar');
    this.pauseButton = this.query('[data-action="pause"]');
    this.card = this.query('.psu-view-detail');

    // Nothing to open when the subject has no diagram of its own — the board
    // power walkthrough plays out on components that are already visible.
    if (!handlers.onSchematic) this.query<HTMLElement>('.psu-schematic').hidden = true;

    this.buildStageList();

    this.element.addEventListener('click', (event) => {
      const action = (event.target as HTMLElement)
        .closest('[data-action]')
        ?.getAttribute('data-action');
      if (action === 'exit') handlers.onExit();
      if (action === 'schematic') handlers.onSchematic?.();
      if (action === 'prev') sequence.previous();
      if (action === 'next') sequence.next();
      if (action === 'pause') this.setPaused(sequence.togglePaused());
    });

    sequence.on('step:enter', ({ step, index }) => this.setStage(step, index));
    sequence.on('progress', ({ stepProgress }) => this.setProgress(stepProgress));
    sequence.on('complete', () => this.setProgress(1));
  }

  get isOpen(): boolean {
    return !this.element.hidden;
  }

  show(): void {
    this.element.hidden = false;
  }

  hide(): void {
    this.element.hidden = true;
  }

  setPaused(paused: boolean): void {
    this.pauseButton.textContent = paused ? t(UI.resume) : t(UI.pause);
  }

  private buildStageList(): void {
    const list = this.query<HTMLElement>('.psu-stage-list');

    this.config.steps.forEach((step, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'psu-stage-item';
      button.innerHTML = `
        <span class="psu-stage-num">${String(index + 1).padStart(2, '0')}</span>
        <span class="psu-stage-name">${t(step.title)}</span>
      `;
      button.addEventListener('click', () => this.sequence.seek(index));
      item.appendChild(button);
      list.appendChild(item);
      this.stageButtons.push(button);
    });
  }

  private setStage(step: BootStep, index: number): void {
    this.title.textContent = t(step.title);
    this.badge.textContent = step.signal ? t(step.signal) : '';
    this.body.textContent = t(step.description);
    this.counter.textContent = `${index + 1} / ${this.config.steps.length}`;
    this.setProgress(0);

    this.stageButtons.forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
      button.classList.toggle('is-done', i < index);
    });
    this.stageButtons[index]?.scrollIntoView({ block: 'nearest' });

    this.card.classList.remove('is-entering');
    void this.card.offsetWidth; // force reflow
    this.card.classList.add('is-entering');
  }

  private setProgress(value: number): void {
    this.progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
  }

  private query<T extends HTMLElement>(selector: string): T {
    const found = this.element.querySelector<T>(selector);
    if (!found) throw new Error(`PsuPanel: ${selector} not found`);
    return found;
  }
}

import { PHASE_LABELS } from '../config/bootSteps';
import { t } from '../i18n';
import { UI } from '../i18n/strings';
import type { BootStep } from '../types';

/**
 * The explanation card in the bottom-left corner: which step we are on, which
 * signal is being discussed, and what is technically happening.
 */
export class InfoPanel {
  readonly element: HTMLElement;

  private readonly phaseChip: HTMLElement;
  private readonly counter: HTMLElement;
  private readonly title: HTMLElement;
  private readonly signal: HTMLElement;
  private readonly description: HTMLElement;
  private readonly progressBar: HTMLElement;
  private readonly action: HTMLButtonElement;

  constructor(
    private readonly totalSteps: number,
    onAction?: () => void,
  ) {
    this.element = document.createElement('section');
    this.element.className = 'panel info-panel';
    this.element.innerHTML = `
      <div class="panel-head">
        <span class="phase-chip"></span>
        <span class="step-counter"></span>
      </div>
      <h2 class="info-title"></h2>
      <code class="signal-badge"></code>
      <p class="info-desc"></p>
      <button type="button" class="info-action" hidden></button>
      <div class="progress-track"><div class="progress-bar"></div></div>
    `;

    this.action = this.query('.info-action');
    if (onAction) this.action.addEventListener('click', onAction);

    this.phaseChip = this.query('.phase-chip');
    this.counter = this.query('.step-counter');
    this.title = this.query('.info-title');
    this.signal = this.query('.signal-badge');
    this.description = this.query('.info-desc');
    this.progressBar = this.query('.progress-bar');
  }

  setStep(step: BootStep, index: number): void {
    this.element.dataset.phase = step.phase;
    this.phaseChip.textContent = t(PHASE_LABELS[step.phase]);
    this.counter.textContent = `${index + 1} / ${this.totalSteps}`;
    this.title.textContent = t(step.title);
    this.description.textContent = t(step.description);

    if (step.signal) {
      this.signal.textContent = t(step.signal);
      this.signal.hidden = false;
    } else {
      this.signal.hidden = true;
    }

    // Steps with nested stages offer a way into them.
    const hasSubsteps = (step.substeps?.length ?? 0) > 0;
    this.action.hidden = !hasSubsteps;
    if (hasSubsteps) this.action.textContent = t(UI.lookInsidePsu);

    // Trigger a short enter animation whenever the step changes.
    this.element.classList.remove('is-entering');
    void this.element.offsetWidth; // force reflow
    this.element.classList.add('is-entering');
  }

  setProgress(value: number): void {
    this.progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
  }

  private query<T extends HTMLElement>(selector: string): T {
    const found = this.element.querySelector<T>(selector);
    if (!found) throw new Error(`InfoPanel: ${selector} not found`);
    return found;
  }
}

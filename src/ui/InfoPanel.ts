import { PHASE_LABELS } from '../config/bootSteps';
import { t, type Localized } from '../i18n';
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
  private readonly source: HTMLElement;
  private readonly description: HTMLElement;
  private readonly progressBar: HTMLElement;
  private readonly action: HTMLButtonElement;

  /** The step currently shown, so the action button knows what it opens. */
  private currentStep: BootStep | null = null;

  constructor(
    private readonly totalSteps: number,
    onAction?: (step: BootStep) => void,
    /**
     * What the action button says for a given step, or null when the step has
     * nothing behind it. The panel does not decide which steps those are —
     * that knowledge lives next to the routing in UILayer, and splitting it
     * across two files is how the button and the dialog drift apart.
     */
    private readonly actionLabel?: (step: BootStep) => Localized | string | null,
  ) {
    this.element = document.createElement('section');
    this.element.className = 'panel info-panel';
    // The card is the only place the chain exists as words, so it is the one
    // thing that has to be announced. `polite` because steps arrive every few
    // seconds on their own — interrupting on each would be unusable.
    this.element.setAttribute('aria-live', 'polite');
    this.element.setAttribute('aria-atomic', 'true');
    this.element.setAttribute('aria-label', t(UI.bootSteps));
    this.element.innerHTML = `
      <div class="panel-head">
        <span class="phase-chip"></span>
        <span class="step-counter"></span>
      </div>
      <h2 class="info-title"></h2>
      <code class="signal-badge"></code>
      <code class="info-source"></code>
      <p class="info-desc"></p>
      <button type="button" class="info-action" hidden></button>
      <div class="progress-track"><div class="progress-bar"></div></div>
    `;

    this.action = this.query('.info-action');
    if (onAction) {
      this.action.addEventListener('click', () => {
        if (this.currentStep) onAction(this.currentStep);
      });
    }

    this.phaseChip = this.query('.phase-chip');
    this.counter = this.query('.step-counter');
    this.title = this.query('.info-title');
    this.signal = this.query('.signal-badge');
    this.source = this.query('.info-source');
    this.description = this.query('.info-desc');
    this.progressBar = this.query('.progress-bar');
  }

  setStep(step: BootStep, index: number): void {
    this.currentStep = step;
    this.element.dataset.phase = step.phase;
    this.phaseChip.textContent = t(PHASE_LABELS[step.phase]);
    this.counter.textContent = `${index + 1} / ${this.totalSteps}`;
    this.title.textContent = t(step.title);
    this.description.textContent = t(step.description);

    // Only steps that are genuinely a function carry a path.
    if (step.source) {
      this.source.textContent = step.source;
      this.source.hidden = false;
    } else {
      this.source.hidden = true;
    }

    if (step.signal) {
      this.signal.textContent = t(step.signal);
      this.signal.hidden = false;
    } else {
      this.signal.hidden = true;
    }

    // Steps with reference material behind them offer a way in — the section
    // step opens its dialog at the beginning, a nested step opens it at the
    // stage it is describing.
    const label = this.actionLabel?.(step) ?? null;
    this.action.hidden = label === null;
    if (label !== null) this.action.textContent = t(label);

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

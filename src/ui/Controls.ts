import { t } from '../i18n';
import { UI } from '../i18n/strings';
import type { BootState } from '../types';

export interface ControlHandlers {
  onPower: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePause: () => void;
  onReset: () => void;
}

const POWER_ICON = /* html */ `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3v9" />
    <path d="M6.6 6.6a8 8 0 1 0 10.8 0" />
  </svg>
`;

/**
 * The control bar at the bottom center: the large Power button, plus the
 * previous / pause / next / restart buttons that appear once the chain starts.
 */
export class Controls {
  readonly element: HTMLElement;

  private readonly powerButton: HTMLButtonElement;
  private readonly transport: HTMLElement;
  private readonly pauseButton: HTMLButtonElement;

  constructor(handlers: ControlHandlers) {
    this.element = document.createElement('div');
    this.element.className = 'controls';
    this.element.innerHTML = `
      <button type="button" class="power-button">
        ${POWER_ICON}
        <span class="power-label">${t(UI.power)}</span>
      </button>
      <div class="transport" hidden>
        <button type="button" data-action="prev" title="${t(UI.previousStep)} (&larr;)">&#8249;</button>
        <button type="button" data-action="pause" title="${t(UI.pause)} (Space)">${t(UI.pause)}</button>
        <button type="button" data-action="next" title="${t(UI.nextStep)} (&rarr;)">&#8250;</button>
        <button type="button" data-action="reset" title="${t(UI.startOver)} (R)">${t(UI.restart)}</button>
      </div>
    `;

    this.powerButton = this.query('.power-button');
    this.transport = this.query('.transport');
    this.pauseButton = this.query('[data-action="pause"]');

    this.powerButton.addEventListener('click', handlers.onPower);
    this.query<HTMLButtonElement>('[data-action="prev"]').addEventListener(
      'click',
      handlers.onPrevious,
    );
    this.query<HTMLButtonElement>('[data-action="next"]').addEventListener(
      'click',
      handlers.onNext,
    );
    this.pauseButton.addEventListener('click', handlers.onTogglePause);
    this.query<HTMLButtonElement>('[data-action="reset"]').addEventListener(
      'click',
      handlers.onReset,
    );
  }

  setState(state: BootState): void {
    this.element.dataset.state = state;
    this.transport.hidden = state === 'idle';
    this.powerButton.hidden = state !== 'idle';
  }

  setPaused(paused: boolean): void {
    this.pauseButton.textContent = paused ? t(UI.resume) : t(UI.pause);
  }

  private query<T extends HTMLElement>(selector: string): T {
    const found = this.element.querySelector<T>(selector);
    if (!found) throw new Error(`Controls: ${selector} not found`);
    return found;
  }
}

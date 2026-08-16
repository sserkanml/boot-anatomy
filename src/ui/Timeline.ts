import { t } from '../i18n';
import { UI } from '../i18n/strings';
import type { BootStep, SubstepRef } from '../types';

export interface TimelineHandlers {
  /** A top-level step was picked. */
  onSelect: (index: number) => void;
  /** A nested stage was picked, e.g. one of the PSU internals. */
  onSelectSubstep: (parentIndex: number, substepIndex: number) => void;
}

/**
 * The step list in the top-right corner. Shows which steps are done, active or
 * still pending; clicking a step jumps straight to it.
 *
 * Steps that carry substeps render them nested underneath. Those are not part
 * of the main chain's playback — picking one hands off to the view that owns
 * it, which for the PSU means going inside the unit.
 */
export class Timeline {
  readonly element: HTMLElement;
  private readonly items: HTMLButtonElement[] = [];

  constructor(steps: readonly BootStep[], handlers: TimelineHandlers) {
    this.element = document.createElement('nav');
    this.element.className = 'panel timeline';
    this.element.setAttribute('aria-label', t(UI.bootSteps));

    const list = document.createElement('ol');
    list.className = 'timeline-list';

    steps.forEach((step, index) => {
      const item = document.createElement('li');
      item.appendChild(this.createStepButton(step, index, handlers));

      if (step.substeps?.length) {
        item.appendChild(this.createSubstepList(step.substeps, index, handlers));
      }

      list.appendChild(item);
    });

    this.element.appendChild(list);
  }

  setActive(index: number): void {
    this.items.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
      item.classList.toggle('is-done', i < index);
    });
  }

  private createStepButton(
    step: BootStep,
    index: number,
    handlers: TimelineHandlers,
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'timeline-item';
    button.dataset.phase = step.phase;
    button.innerHTML = `
      <span class="timeline-dot"></span>
      <span class="timeline-label">${t(step.title)}</span>
    `;
    button.addEventListener('click', () => handlers.onSelect(index));
    this.items.push(button);
    return button;
  }

  private createSubstepList(
    substeps: readonly SubstepRef[],
    parentIndex: number,
    handlers: TimelineHandlers,
  ): HTMLElement {
    const list = document.createElement('ol');
    list.className = 'timeline-sublist';

    substeps.forEach((substep, substepIndex) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'timeline-subitem';
      button.textContent = t(substep.title);
      button.addEventListener('click', () =>
        handlers.onSelectSubstep(parentIndex, substepIndex),
      );
      item.appendChild(button);
      list.appendChild(item);
    });

    return list;
  }
}

import { t } from '../i18n';
import { UI } from '../i18n/strings';
import type { BootStep } from '../types';

export interface TimelineHandlers {
  /** A step was picked. */
  onSelect: (index: number) => void;
}

/**
 * The step list in the top-right corner. Shows which steps are done, active or
 * still pending; clicking one jumps straight to it.
 *
 * The chain is flat, so this is a flat list — steps carrying `depth: 1` are
 * simply indented under the section step above them. That keeps a seventy-step
 * run readable without the list pretending to be a tree.
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
      const button = document.createElement('button');
      button.type = 'button';
      button.className = step.depth === 1 ? 'timeline-item is-nested' : 'timeline-item';
      button.dataset.phase = step.phase;
      button.innerHTML = `
        <span class="timeline-dot"></span>
        <span class="timeline-label">${t(step.title)}</span>
      `;
      button.addEventListener('click', () => handlers.onSelect(index));

      this.items.push(button);
      item.appendChild(button);
      list.appendChild(item);
    });

    this.element.appendChild(list);
  }

  setActive(index: number): void {
    this.items.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
      item.classList.toggle('is-done', i < index);
    });

    // With this many steps the active one is usually off-screen otherwise.
    this.items[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

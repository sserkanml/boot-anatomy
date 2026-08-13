import type { BootStep } from '../types';

/**
 * The step list in the top-right corner. Shows which steps are done, active or
 * still pending; clicking a step jumps straight to it.
 */
export class Timeline {
  readonly element: HTMLElement;
  private readonly items: HTMLButtonElement[] = [];

  constructor(steps: readonly BootStep[], onSelect: (index: number) => void) {
    this.element = document.createElement('nav');
    this.element.className = 'panel timeline';
    this.element.setAttribute('aria-label', 'Boot steps');

    const list = document.createElement('ol');
    list.className = 'timeline-list';

    steps.forEach((step, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'timeline-item';
      button.dataset.phase = step.phase;
      button.innerHTML = `
        <span class="timeline-dot"></span>
        <span class="timeline-label">${step.title}</span>
      `;
      button.addEventListener('click', () => onSelect(index));
      item.appendChild(button);
      list.appendChild(item);
      this.items.push(button);
    });

    this.element.appendChild(list);
  }

  setActive(index: number): void {
    this.items.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
      item.classList.toggle('is-done', i < index);
    });
  }
}

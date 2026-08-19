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
  /** The button that opens the list on small screens, and its backdrop. */
  readonly toggle: HTMLButtonElement;
  readonly backdrop: HTMLElement;

  private readonly items: HTMLButtonElement[] = [];
  private open = false;

  constructor(steps: readonly BootStep[], handlers: TimelineHandlers) {
    this.element = document.createElement('nav');
    this.element.className = 'panel timeline';
    this.element.setAttribute('aria-label', t(UI.bootSteps));

    // On a phone the list cannot sit permanently beside the scene, so it
    // becomes a sheet. Both of these are invisible above the breakpoint; the
    // desktop layout never sees them.
    this.toggle = document.createElement('button');
    this.toggle.type = 'button';
    this.toggle.className = 'timeline-toggle';
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.innerHTML = `<span class="timeline-toggle-grip"></span><span>${t(UI.bootSteps)}</span>`;
    this.toggle.addEventListener('click', () => this.setOpen(!this.open));

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'timeline-backdrop';
    this.backdrop.hidden = true;
    this.backdrop.addEventListener('click', () => this.setOpen(false));

    // Once the sheet is up it covers the handle that opened it, so it carries
    // its own way back down. Above the breakpoint this is display: none.
    const grabber = document.createElement('button');
    grabber.type = 'button';
    grabber.className = 'timeline-grabber';
    grabber.setAttribute('aria-label', t(UI.close));
    grabber.addEventListener('click', () => this.setOpen(false));
    this.element.appendChild(grabber);

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
      button.addEventListener('click', () => {
        handlers.onSelect(index);
        // Picking a step is the reason the sheet was opened, so it closes
        // itself rather than covering the scene it just changed.
        this.setOpen(false);
      });

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

  get isOpen(): boolean {
    return this.open;
  }

  /** Opens or closes the sheet. Does nothing visible on a wide screen. */
  setOpen(open: boolean): void {
    this.open = open;
    this.element.classList.toggle('is-open', open);
    this.toggle.setAttribute('aria-expanded', String(open));
    this.backdrop.hidden = !open;
  }
}

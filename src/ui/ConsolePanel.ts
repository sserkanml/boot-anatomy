import { t } from '../i18n';
import { UI } from '../i18n/strings';

/**
 * The fake console in the bottom-right corner. Prints the step's console[]
 * lines one by one, in sync with the step's progress.
 */
export class ConsolePanel {
  readonly element: HTMLElement;
  private readonly output: HTMLElement;
  private lines: string[] = [];
  private rendered = 0;

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'panel console-panel';
    this.element.innerHTML = `
      <div class="panel-head">
        <span class="console-title">${t(UI.console)}</span>
        <span class="console-dot"></span>
      </div>
      <pre class="console-output"></pre>
    `;

    const output = this.element.querySelector<HTMLElement>('.console-output');
    if (!output) throw new Error('ConsolePanel: output area not found');
    this.output = output;
    this.element.hidden = true;
  }

  setLines(lines: readonly string[] | undefined): void {
    this.lines = [...(lines ?? [])];
    this.rendered = 0;
    this.output.textContent = '';
    this.element.hidden = this.lines.length === 0;
  }

  /** Updates how many lines are visible based on the step's progress. */
  setProgress(progress: number): void {
    if (this.lines.length === 0) return;

    // Lines are spread over the first 85% of the step, leaving room to read.
    const target = Math.min(
      this.lines.length,
      Math.ceil((progress / 0.85) * this.lines.length),
    );
    if (target <= this.rendered) return;

    for (let i = this.rendered; i < target; i += 1) {
      const line = document.createElement('span');
      line.className = 'console-line';
      if (this.lines[i]!.includes('[  OK  ]')) line.classList.add('is-ok');
      line.textContent = this.lines[i]!;
      this.output.appendChild(line);
    }
    this.rendered = target;
    this.output.scrollTop = this.output.scrollHeight;
  }

  clear(): void {
    this.setLines([]);
  }
}

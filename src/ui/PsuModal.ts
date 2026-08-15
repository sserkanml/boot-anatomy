import { PSU_STAGES } from '../config/psuStages';
import { createPsuDiagram } from './psuDiagram';
import { createFaqView, createPinoutView } from './psuReferenceViews';

export type PsuModalTab = 'diagram' | 'pinout' | 'faq';

const TABS: Array<{ id: PsuModalTab; label: string }> = [
  { id: 'diagram', label: 'Block diagram' },
  { id: 'pinout', label: 'Pinout' },
  { id: 'faq', label: 'FAQ' },
];

export interface PsuModalHandlers {
  /** Fired after the dialog becomes visible. */
  onOpen?: () => void;
  /** Fired after the dialog is hidden. */
  onClose?: () => void;
}

/**
 * The dialog that opens when the PSU is picked in the scene: a block diagram of
 * the supply plus a walkthrough of its stages, from the wall socket to the rails.
 *
 * The stage list, the diagram highlight and the detail panel are all driven from
 * a single active index, so PSU_STAGES stays the only place content lives.
 */
export class PsuModal {
  readonly element: HTMLElement;

  private readonly panel: HTMLElement;
  private readonly stageButtons: HTMLButtonElement[] = [];
  private readonly detailIndex: HTMLElement;
  private readonly detailTitle: HTMLElement;
  private readonly detailBadge: HTMLElement;
  private readonly detailBody: HTMLElement;
  private readonly detailNote: HTMLElement;
  private readonly closeButton: HTMLButtonElement;
  private readonly svg: SVGElement;

  private readonly footer: HTMLElement;
  private activeIndex = 0;
  private activeTab: PsuModalTab = 'diagram';
  private open = false;
  /** Element that had focus before opening, restored on close. */
  private previousFocus: HTMLElement | null = null;

  constructor(private readonly handlers: PsuModalHandlers = {}) {
    this.element = document.createElement('div');
    this.element.className = 'psu-modal';
    this.element.hidden = true;
    this.element.innerHTML = `
      <div class="psu-modal-backdrop" data-action="close"></div>
      <div class="psu-modal-panel" role="dialog" aria-modal="true" aria-labelledby="psu-modal-title">
        <header class="psu-modal-head">
          <div>
            <p class="psu-modal-eyebrow">Power Supply Unit</p>
            <h2 class="psu-modal-title" id="psu-modal-title">From the wall socket to the DC rails</h2>
          </div>
          <button type="button" class="psu-modal-close" data-action="close" aria-label="Close">&times;</button>
        </header>

        <div class="psu-tabs" role="tablist">
          ${TABS.map(
            (tab, i) => `
              <button type="button" class="psu-tab" role="tab" data-tab="${tab.id}"
                      aria-selected="${i === 0}">${tab.label}</button>`,
          ).join('')}
        </div>

        <div class="psu-tabpanel" data-panel="diagram">
          <div class="psu-diagram-wrap">${createPsuDiagram()}</div>

          <div class="psu-modal-body">
            <ol class="psu-stage-list"></ol>
            <article class="psu-stage-detail">
              <div class="panel-head">
                <span class="psu-stage-badge"></span>
                <span class="psu-stage-index"></span>
              </div>
              <h3 class="psu-stage-title"></h3>
              <p class="psu-stage-desc"></p>
              <p class="psu-stage-note"></p>
            </article>
          </div>
        </div>

        <div class="psu-tabpanel" data-panel="pinout" hidden>${createPinoutView()}</div>
        <div class="psu-tabpanel" data-panel="faq" hidden>${createFaqView()}</div>

        <footer class="psu-modal-foot">
          <button type="button" class="psu-nav" data-action="prev">&#8249; Previous</button>
          <span class="psu-modal-hint">Esc to close</span>
          <button type="button" class="psu-nav" data-action="next">Next &#8250;</button>
        </footer>
      </div>
    `;

    this.panel = this.query('.psu-modal-panel');
    this.detailIndex = this.query('.psu-stage-index');
    this.detailTitle = this.query('.psu-stage-title');
    this.detailBadge = this.query('.psu-stage-badge');
    this.detailBody = this.query('.psu-stage-desc');
    this.detailNote = this.query('.psu-stage-note');
    this.closeButton = this.query('.psu-modal-close');
    this.footer = this.query('.psu-modal-foot');
    this.svg = this.query<HTMLElement>('.psu-diagram') as unknown as SVGElement;

    this.buildStageList();
    this.bindEvents();
    this.setStage(0);
    this.setTab('diagram');
  }

  /** Switches the visible tab; the stage navigation only applies to the diagram. */
  setTab(tab: PsuModalTab): void {
    this.activeTab = tab;

    for (const button of this.element.querySelectorAll<HTMLButtonElement>('.psu-tab')) {
      const isActive = button.dataset.tab === tab;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    }
    for (const panel of this.element.querySelectorAll<HTMLElement>('.psu-tabpanel')) {
      panel.hidden = panel.dataset.panel !== tab;
    }

    this.footer.hidden = tab !== 'diagram';
  }

  get isOpen(): boolean {
    return this.open;
  }

  openAt(index = 0, tab: PsuModalTab = 'diagram'): void {
    if (this.open) return;
    this.previousFocus = document.activeElement as HTMLElement | null;
    this.open = true;
    this.element.hidden = false;
    this.setStage(index);
    this.setTab(tab);
    // Focus the dialog itself so Esc and tabbing land inside it.
    this.closeButton.focus();
    this.handlers.onOpen?.();
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.element.hidden = true;
    this.previousFocus?.focus?.();
    this.previousFocus = null;
    this.handlers.onClose?.();
  }

  private buildStageList(): void {
    const list = this.query<HTMLElement>('.psu-stage-list');

    PSU_STAGES.forEach((stage, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'psu-stage-item';
      button.innerHTML = `
        <span class="psu-stage-num">${String(index + 1).padStart(2, '0')}</span>
        <span class="psu-stage-name">${stage.title}</span>
      `;
      button.addEventListener('click', () => this.setStage(index));
      item.appendChild(button);
      list.appendChild(item);
      this.stageButtons.push(button);
    });
  }

  private bindEvents(): void {
    this.element.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      const tab = target.closest<HTMLElement>('.psu-tab')?.dataset.tab;
      if (tab) this.setTab(tab as PsuModalTab);

      const action = target.closest('[data-action]')?.getAttribute('data-action');
      if (action === 'close') this.close();
      if (action === 'prev') this.setStage(this.activeIndex - 1);
      if (action === 'next') this.setStage(this.activeIndex + 1);
    });

    // Scoped to the dialog, so the scene shortcuts stay untouched while it is open.
    this.element.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        this.close();
      }
      // Stage stepping belongs to the diagram; elsewhere the arrows should
      // still scroll the panel normally.
      if (this.activeTab !== 'diagram') return;
      if (event.key === 'ArrowRight') this.setStage(this.activeIndex + 1);
      if (event.key === 'ArrowLeft') this.setStage(this.activeIndex - 1);
    });

    // Clicking a block in the diagram jumps to the stage that owns it.
    this.svg.addEventListener('click', (event) => {
      const group = (event.target as Element).closest('[data-node]');
      const nodeId = group?.getAttribute('data-node');
      if (!nodeId) return;
      const index = PSU_STAGES.findIndex((stage) => stage.nodes.includes(nodeId));
      if (index >= 0) this.setStage(index);
    });
  }

  private setStage(index: number): void {
    const clamped = Math.min(PSU_STAGES.length - 1, Math.max(0, index));
    const stage = PSU_STAGES[clamped]!;
    this.activeIndex = clamped;

    this.detailIndex.textContent = `${clamped + 1} / ${PSU_STAGES.length}`;
    this.detailTitle.textContent = stage.title;
    this.detailBadge.textContent = stage.badge;
    this.detailBody.textContent = stage.description;

    if (stage.bootNote) {
      this.detailNote.textContent = stage.bootNote;
      this.detailNote.hidden = false;
    } else {
      this.detailNote.hidden = true;
    }

    this.stageButtons.forEach((button, i) => {
      button.classList.toggle('is-active', i === clamped);
      button.classList.toggle('is-done', i < clamped);
    });

    this.highlightDiagram(stage.nodes, stage.edges ?? []);

    // Replay the entry animation on the detail card.
    this.panel.classList.remove('is-stepping');
    void this.panel.offsetWidth; // force reflow
    this.panel.classList.add('is-stepping');
  }

  private highlightDiagram(nodes: string[], edges: string[]): void {
    for (const group of this.svg.querySelectorAll('[data-node]')) {
      const id = group.getAttribute('data-node');
      group.classList.toggle('is-active', id !== null && nodes.includes(id));
    }
    for (const group of this.svg.querySelectorAll('[data-edge]')) {
      const id = group.getAttribute('data-edge');
      group.classList.toggle('is-active', id !== null && edges.includes(id));
    }
  }

  private query<T extends HTMLElement>(selector: string): T {
    const found = this.element.querySelector<T>(selector);
    if (!found) throw new Error(`PsuModal: ${selector} not found`);
    return found;
  }
}

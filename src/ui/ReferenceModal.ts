import { t, type Localized } from '../i18n';
import { UI } from '../i18n/strings';
import type { ModalStage } from '../types';

export type { ModalStage };

export interface ModalTabDef {
  id: string;
  /** Key into the UI strings table. */
  labelKey: string;
  /** Pre-rendered panel markup. */
  content: string;
}

export interface ReferenceModalConfig {
  /** Distinguishes instances for aria wiring and debugging. */
  id: string;
  eyebrow: Localized | string;
  title: Localized;
  /** SVG markup for the diagram tab. */
  diagram: string;
  stages: ModalStage[];
  /** Tabs shown after the diagram tab. */
  tabs?: ModalTabDef[];
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * The tabbed dialog used for both the PSU and the EC.
 *
 * Everything specific to a subject lives in the config: the diagram, the stages
 * and the extra tabs. The class only knows how to step through a list, keep the
 * diagram in sync with it, and switch tabs.
 *
 * The `psu-*` class names are shared chrome rather than PSU-specific styling —
 * reusing them is also what makes the EC diagram inherit the highlight and flow
 * animations for free.
 */
export class ReferenceModal {
  readonly element: HTMLElement;

  private readonly panel: HTMLElement;
  private readonly stageButtons: HTMLButtonElement[] = [];
  private readonly detailIndex: HTMLElement;
  private readonly detailTitle: HTMLElement;
  private readonly detailBadge: HTMLElement;
  private readonly detailBody: HTMLElement;
  private readonly detailNote: HTMLElement;
  private readonly closeButton: HTMLButtonElement;
  private readonly footer: HTMLElement;
  private readonly svg: SVGElement;

  private activeIndex = 0;
  private activeTab = 'diagram';
  private open = false;
  private previousFocus: HTMLElement | null = null;

  constructor(private readonly config: ReferenceModalConfig) {
    const titleId = `${config.id}-modal-title`;
    const tabs: ModalTabDef[] = [
      { id: 'diagram', labelKey: 'tabDiagram', content: '' },
      ...(config.tabs ?? []),
    ];

    this.element = document.createElement('div');
    this.element.className = 'psu-modal';
    this.element.dataset.modal = config.id;
    this.element.hidden = true;
    this.element.innerHTML = `
      <div class="psu-modal-backdrop" data-action="close"></div>
      <div class="psu-modal-panel" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
        <header class="psu-modal-head">
          <div>
            <p class="psu-modal-eyebrow">${t(config.eyebrow)}</p>
            <h2 class="psu-modal-title" id="${titleId}">${t(config.title)}</h2>
          </div>
          <button type="button" class="psu-modal-close" data-action="close" aria-label="${t(UI.close)}">&times;</button>
        </header>

        <div class="psu-tabs" role="tablist">
          ${tabs
            .map(
              (tab, i) => `
                <button type="button" class="psu-tab" role="tab" data-tab="${tab.id}"
                        aria-selected="${i === 0}">${t(UI[tab.labelKey]!)}</button>`,
            )
            .join('')}
        </div>

        <div class="psu-tabpanel" data-panel="diagram">
          <div class="psu-diagram-wrap">${config.diagram}</div>
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

        ${(config.tabs ?? [])
          .map(
            (tab) =>
              `<div class="psu-tabpanel" data-panel="${tab.id}" hidden>${tab.content}</div>`,
          )
          .join('')}

        <footer class="psu-modal-foot">
          <button type="button" class="psu-nav" data-action="prev">${t(UI.previous)}</button>
          <span class="psu-modal-hint">${t(UI.escToClose)}</span>
          <button type="button" class="psu-nav" data-action="next">${t(UI.next)}</button>
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
    this.svg = this.query<HTMLElement>('svg') as unknown as SVGElement;

    this.buildStageList();
    this.bindEvents();
    this.setStage(0);
    this.setTab('diagram');
  }

  /** Switches the visible tab; stage navigation only applies to the diagram. */
  setTab(tab: string): void {
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

  openAt(index = 0, tab = 'diagram'): void {
    if (this.open) return;
    this.previousFocus = document.activeElement as HTMLElement | null;
    this.open = true;
    this.element.hidden = false;
    this.setStage(index);
    this.setTab(tab);
    // Focus the dialog itself so Esc and tabbing land inside it.
    this.closeButton.focus();
    this.config.onOpen?.();
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.element.hidden = true;
    this.previousFocus?.focus?.();
    this.previousFocus = null;
    this.config.onClose?.();
  }

  private buildStageList(): void {
    const list = this.query<HTMLElement>('.psu-stage-list');

    this.config.stages.forEach((stage, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'psu-stage-item';
      button.innerHTML = `
        <span class="psu-stage-num">${String(index + 1).padStart(2, '0')}</span>
        <span class="psu-stage-name">${t(stage.title)}</span>
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
      if (tab) this.setTab(tab);

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
      const nodeId = (event.target as Element).closest('[data-node]')?.getAttribute('data-node');
      if (!nodeId) return;
      const index = this.config.stages.findIndex((stage) => stage.nodes.includes(nodeId));
      if (index >= 0) this.setStage(index);
    });
  }

  private setStage(index: number): void {
    const { stages } = this.config;
    const clamped = Math.min(stages.length - 1, Math.max(0, index));
    const stage = stages[clamped]!;
    this.activeIndex = clamped;

    this.detailIndex.textContent = `${clamped + 1} / ${stages.length}`;
    this.detailTitle.textContent = t(stage.title);
    this.detailBadge.textContent = t(stage.badge);
    this.detailBody.textContent = t(stage.description);

    if (stage.note) {
      this.detailNote.textContent = t(stage.note);
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
    if (!found) throw new Error(`ReferenceModal(${this.config.id}): ${selector} not found`);
    return found;
  }
}

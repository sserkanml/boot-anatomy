import { EC_COMPONENTS, EC_STAGES } from '../config/ecStages';
import { EC_FAQ } from '../config/ecReference';
import { t } from '../i18n';
import { UI } from '../i18n/strings';
import { createEcDiagram } from './ecDiagram';
import { renderFaqList } from './psuReferenceViews';
import { ReferenceModal } from './ReferenceModal';

export interface EcModalHandlers {
  onOpen?: () => void;
  onClose?: () => void;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The components tab: the hardware blocks an EC is built from. */
function createComponentsView(): string {
  const cards = EC_COMPONENTS.map(
    (component) => `
      <article class="ec-component">
        <header class="ec-component-head">
          <h4>${escapeHtml(component.name)}</h4>
          <span>${escapeHtml(t(component.spec))}</span>
        </header>
        <p>${escapeHtml(t(component.description))}</p>
      </article>`,
  ).join('');

  return `
    <p class="tab-intro">${escapeHtml(t(UI.ecComponentsIntro))}</p>
    <div class="ec-components">${cards}</div>`;
}

/**
 * The EC dialog, built on the same widget as the PSU one: a block diagram with
 * an eight-step walkthrough of how a button press becomes PS_ON#, plus the
 * hardware inventory and a glossary.
 */
export function createEcModal(handlers: EcModalHandlers = {}): ReferenceModal {
  return new ReferenceModal({
    id: 'ec',
    eyebrow: UI.ecEyebrow,
    title: UI.ecTitle,
    diagram: createEcDiagram(),
    stages: EC_STAGES,
    tabs: [
      { id: 'components', labelKey: 'tabComponents', content: createComponentsView() },
      { id: 'faq', labelKey: 'tabFaq', content: renderFaqList(EC_FAQ, t(UI.ecFaqIntro)) },
    ],
    ...handlers,
  });
}

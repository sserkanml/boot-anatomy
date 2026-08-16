import {
  CONNECTORS,
  PSU_FAQ,
  RAIL_STYLES,
  type Connector,
  type FaqEntry,
  type RailKey,
} from '../config/psuReference';
import { t } from '../i18n';
import { UI } from '../i18n/strings';

/** Escapes text that goes into innerHTML, since some answers contain angle brackets. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Rails shown in the pinout legend, in the order they appear on the connector. */
const LEGEND_ORDER: RailKey[] = [
  '+12V',
  '+5V',
  '+3.3V',
  'COM',
  '+5VSB',
  'PWR_OK',
  'PS_ON#',
  '-12V',
  'SENSE',
  'NC',
];

function renderConnector(connector: Connector): string {
  const rows: string[] = [];
  for (let i = 0; i < connector.pins.length; i += connector.columns) {
    const cells = connector.pins
      .slice(i, i + connector.columns)
      .map((pin) => {
        const style = RAIL_STYLES[pin.rail];
        const noted = pin.note ? ' is-noted' : '';
        const title = pin.note
          ? ` title="${escapeHtml(t(pin.note))}"`
          : ` title="${escapeHtml(`${style.label} — ${t(style.wire)}`)}"`;
        return `
          <li class="pin${noted}"${title} style="--pin-color: ${style.swatch}">
            <span class="pin-number">${pin.number}</span>
            <span class="pin-rail">${escapeHtml(pin.label ?? style.label)}</span>
          </li>`;
      })
      .join('');
    rows.push(`<ul class="pin-row" style="--columns: ${connector.columns}">${cells}</ul>`);
  }

  // The pins the boot chain depends on get spelled out under the connector.
  const notes = connector.pins
    .filter((pin) => pin.note)
    .map(
      (pin) =>
        `<li><b>Pin ${pin.number} · ${escapeHtml(pin.label ?? RAIL_STYLES[pin.rail].label)}</b> — ${escapeHtml(pin.note ? t(pin.note) : '')}</li>`,
    )
    .join('');

  return `
    <section class="connector">
      <header class="connector-head">
        <h4>${escapeHtml(connector.name)}</h4>
        <span>${escapeHtml(t(connector.subtitle))}</span>
      </header>
      <div class="connector-body">${rows.join('')}</div>
      ${notes ? `<ul class="connector-notes">${notes}</ul>` : ''}
    </section>`;
}

/** The pinout tab: every connector the supply hands to the rest of the machine. */
export function createPinoutView(): string {
  const legend = LEGEND_ORDER.map((key) => {
    const style = RAIL_STYLES[key];
    return `
      <li class="legend-item">
        <span class="legend-swatch" style="background: ${style.swatch}"></span>
        <span class="legend-label">${escapeHtml(style.label)}</span>
        <span class="legend-wire">${escapeHtml(t(style.wire))}</span>
      </li>`;
  }).join('');

  return `
    <p class="tab-intro">${escapeHtml(t(UI.pinoutIntro))}</p>
    <ul class="pin-legend">${legend}</ul>
    ${CONNECTORS.map(renderConnector).join('')}`;
}

/** Renders an accordion of glossary entries. Shared by the PSU and EC dialogs. */
export function renderFaqList(entries: FaqEntry[], intro: string): string {
  const items = entries
    .map(
      (entry) => `
      <details class="faq-item">
        <summary>
          <span class="faq-term">${escapeHtml(entry.term)}</span>
          <span class="faq-question">${escapeHtml(t(entry.question))}</span>
        </summary>
        <div class="faq-answer">
          <p>${escapeHtml(t(entry.answer))}</p>
          <a class="faq-link" href="${entry.href}" target="_blank" rel="noopener noreferrer">
            Wikipedia: ${escapeHtml(entry.term)} \u2197
          </a>
        </div>
      </details>`,
    )
    .join('');

  return `
    <p class="tab-intro">${escapeHtml(intro)}</p>
    <div class="faq-list">${items}</div>`;
}

/** The PSU glossary tab. */
export function createFaqView(): string {
  return renderFaqList(PSU_FAQ, t(UI.faqIntro));
}

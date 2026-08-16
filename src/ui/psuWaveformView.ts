import { PSU_WAVEFORMS, type WavePanel, type WaveStage } from '../config/psuWaveforms';
import { t } from '../i18n';
import { UI } from '../i18n/strings';
import { renderWave } from './waveforms';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPanel(panel: WavePanel): string {
  return `
    <figure class="wave-card wave-card--${panel.variant}">
      <figcaption class="wave-card-head">
        <span class="wave-card-label">${escapeHtml(t(panel.label))}</span>
        <span class="wave-card-caption">${escapeHtml(t(panel.caption))}</span>
      </figcaption>
      ${renderWave(panel.traces)}
    </figure>`;
}

function renderStage(stage: WaveStage): string {
  // Two panels sit side by side so a before/after reads as one comparison.
  const paired = stage.panels.length === 2 ? ' wave-panels--paired' : '';
  return `
    <section class="wave-stage" data-stage="${stage.id}">
      <h4 class="wave-stage-title">${escapeHtml(t(stage.title))}</h4>
      <p class="wave-stage-body">${escapeHtml(t(stage.body))}</p>
      <div class="wave-panels${paired}">${stage.panels.map(renderPanel).join('')}</div>
    </section>`;
}

/** The waveform tab: the same ten stages, told through the shape of the signal. */
export function createWaveformView(): string {
  return `
    <p class="tab-intro">${escapeHtml(t(UI.waveformIntro))}</p>
    ${PSU_WAVEFORMS.map(renderStage).join('')}`;
}

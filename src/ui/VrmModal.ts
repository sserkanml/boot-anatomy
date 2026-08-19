import { VRM_FAQ } from '../config/vrmReference';
import { VRM_STAGES } from '../config/vrmStages';
import { VRM_WAVEFORMS } from '../config/vrmWaveforms';
import { t } from '../i18n';
import { UI } from '../i18n/strings';
import { renderFaqList } from './psuReferenceViews';
import { renderWaveformStages } from './psuWaveformView';
import { ReferenceModal } from './ReferenceModal';
import { createVrmDiagram } from './vrmDiagram';

export interface VrmModalHandlers {
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * The VRM dialog, built on the same widget as the PSU and the EC: a block
 * diagram with the eight-step walkthrough, the waveforms that explain why the
 * thing is built out of four of everything, and the glossary.
 *
 * The stages come straight from the boot chain, so the card on the timeline and
 * the card in the dialog can never say different things.
 */
export function createVrmModal(handlers: VrmModalHandlers = {}): ReferenceModal {
  return new ReferenceModal({
    id: 'vrm',
    eyebrow: UI.vrmEyebrow,
    title: UI.vrmTitle,
    diagram: createVrmDiagram(),
    stages: VRM_STAGES,
    tabs: [
      {
        id: 'waveforms',
        labelKey: 'tabWaveforms',
        content: renderWaveformStages(VRM_WAVEFORMS, t(UI.vrmWaveformIntro)),
      },
      { id: 'faq', labelKey: 'tabFaq', content: renderFaqList(VRM_FAQ, t(UI.vrmFaqIntro)) },
    ],
    ...handlers,
  });
}

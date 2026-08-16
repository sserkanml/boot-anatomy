import { PSU_STAGES } from '../config/psuStages';
import { UI } from '../i18n/strings';
import { createPsuDiagram } from './psuDiagram';
import { ReferenceModal, type ModalStage } from './ReferenceModal';
import { createFaqView, createPinoutView } from './psuReferenceViews';
import { createWaveformView } from './psuWaveformView';

export interface PsuModalHandlers {
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * The PSU dialog: a block diagram of the supply, the waveform walkthrough, the
 * connector pinouts and the glossary.
 *
 * PSU_STAGES carries its own field names, so it is adapted to the shared
 * ModalStage shape here rather than the config file bending to the widget.
 */
export function createPsuModal(handlers: PsuModalHandlers = {}): ReferenceModal {
  const stages: ModalStage[] = PSU_STAGES.map((stage) => ({
    id: stage.id,
    title: stage.title,
    badge: stage.badge,
    description: stage.description,
    ...(stage.bootNote ? { note: stage.bootNote } : {}),
    nodes: stage.nodes,
    ...(stage.edges ? { edges: stage.edges } : {}),
  }));

  return new ReferenceModal({
    id: 'psu',
    eyebrow: UI.modalEyebrow,
    title: UI.psuTitle,
    diagram: createPsuDiagram(),
    stages,
    tabs: [
      { id: 'waveforms', labelKey: 'tabWaveforms', content: createWaveformView() },
      { id: 'pinout', labelKey: 'tabPinout', content: createPinoutView() },
      { id: 'faq', labelKey: 'tabFaq', content: createFaqView() },
    ],
    ...handlers,
  });
}

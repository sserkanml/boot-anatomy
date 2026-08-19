import { KERNEL_FAQ } from '../config/kernelReference';
import { t } from '../i18n';
import { UI } from '../i18n/strings';
import { renderFaqList } from './psuReferenceViews';
import { ReferenceModal } from './ReferenceModal';

export interface KernelModalHandlers {
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * The Kernel dialog: the glossary, and only the glossary.
 *
 * Unlike the PSU and the EC there is no block diagram here, because there is no
 * hardware to draw — the kernel chain happens inside a CPU that is already on
 * stage. So this is the one caller that leaves `diagram` and `stages` unset,
 * and the widget drops the diagram tab accordingly.
 */
export function createKernelModal(handlers: KernelModalHandlers = {}): ReferenceModal {
  return new ReferenceModal({
    id: 'kernel',
    eyebrow: UI.kernelEyebrow,
    title: UI.kernelTitle,
    tabs: [
      { id: 'glossary', labelKey: 'tabGlossary', content: renderFaqList(KERNEL_FAQ, t(UI.kernelFaqIntro)) },
    ],
    ...handlers,
  });
}

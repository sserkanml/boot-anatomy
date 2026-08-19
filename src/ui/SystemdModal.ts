import { SYSTEMD_FAQ } from '../config/systemdReference';
import { t } from '../i18n';
import { UI } from '../i18n/strings';
import { renderFaqList } from './psuReferenceViews';
import { ReferenceModal } from './ReferenceModal';

export interface SystemdModalHandlers {
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * The systemd dialog: the glossary for the userspace half of the boot.
 *
 * Same shape as the kernel one — no diagram, because the work happens across
 * three processes and a dependency graph rather than in any drawable place.
 * Opened from both the systemd and the login sections, since the login chain
 * leans on the same vocabulary.
 */
export function createSystemdModal(handlers: SystemdModalHandlers = {}): ReferenceModal {
  return new ReferenceModal({
    id: 'systemd',
    eyebrow: UI.systemdEyebrow,
    title: UI.systemdTitle,
    tabs: [
      {
        id: 'glossary',
        labelKey: 'tabGlossary',
        content: renderFaqList(SYSTEMD_FAQ, t(UI.systemdFaqIntro)),
      },
    ],
    ...handlers,
  });
}

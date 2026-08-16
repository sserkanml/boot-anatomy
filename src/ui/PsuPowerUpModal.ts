import { PSU_POWERUP_STAGES } from '../config/psuPowerUp';
import { UI } from '../i18n/strings';
import { createPsuDiagram } from './psuDiagram';
import { ReferenceModal } from './ReferenceModal';

export interface PsuPowerUpHandlers {
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * The power-up sequence: what the supply does between PS_ON# going low and
 * PWR_OK going high.
 *
 * It deliberately reuses the PSU block diagram rather than getting one of its
 * own. The blocks are the same blocks — what changes is the question being
 * asked of them, from "what is this for" to "when does it start".
 */
export function createPsuPowerUpModal(handlers: PsuPowerUpHandlers = {}): ReferenceModal {
  return new ReferenceModal({
    id: 'psu-powerup',
    eyebrow: UI.psuPowerUpEyebrow,
    title: UI.psuPowerUpTitle,
    diagram: createPsuDiagram(),
    stages: PSU_POWERUP_STAGES,
    ...handlers,
  });
}

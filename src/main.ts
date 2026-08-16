import './ui/styles.css';

import { Vector3 } from 'three';

import { initLanguage, onLanguageChange } from './i18n';
import { UI } from './i18n/strings';
import { t } from './i18n';

import { PSU_SEQUENCE_STEPS } from './config/bootSteps';
import { EC_SEQUENCE_STEPS } from './config/ecSequence';
import { VRM_SEQUENCE_STEPS } from './config/vrmSequence';
import { VIEW_CAMERAS, VIEW_FLIGHT_DURATION } from './config/constants';
import { Picker } from './core/Picker';
import { SceneManager } from './core/SceneManager';
import { createLighting } from './core/lighting';
import { BoardScene } from './scene/BoardScene';
import { createEnvironment } from './scene/environment';
import { loadMotherboard } from './scene/loadMotherboard';
import { BootSequence } from './state/BootSequence';
import type { SceneView } from './types';
import { UILayer } from './ui/UILayer';

function requireElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Expected element not found: ${selector}`);
  return element;
}

function showFatalError(message: string): void {
  const overlay = document.createElement('div');
  overlay.className = 'panel info-panel';
  overlay.style.cssText = 'left:50%;top:50%;transform:translate(-50%,-50%);padding:24px;';
  overlay.innerHTML = `<h2 class="info-title">${t(UI.sceneFailed)}</h2><p class="info-desc">${message}</p>`;
  requireElement('#ui-layer').appendChild(overlay);
}

function bootstrap(): void {
  const canvas = requireElement<HTMLCanvasElement>('#scene-canvas');
  const labelContainer = requireElement('#labels-layer');
  const uiContainer = requireElement('#ui-layer');

  const manager = new SceneManager({ canvas, labelContainer });
  createLighting(manager.scene);
  createEnvironment(manager.scene);

  const board = new BoardScene(manager.scene);

  // Two chains: the board story, and the PSU internals played inside the unit.
  // The PSU chain has no passive step, so it starts at index 0.
  const sequence = new BootSequence();
  const psuSequence = new BootSequence(PSU_SEQUENCE_STEPS, 0);
  const ecSequence = new BootSequence(EC_SEQUENCE_STEPS, 0);
  const vrmSequence = new BootSequence(VRM_SEQUENCE_STEPS, 0);

  // State machines -> scene. Only one chain runs at a time, so both can drive
  // the same scene without stepping on each other.
  for (const chain of [sequence, psuSequence, ecSequence, vrmSequence]) {
    chain.on('step:enter', ({ step, index }) => board.applyStep(step, index));
    chain.on('progress', ({ stepProgress }) => board.setStepProgress(stepProgress));
  }
  sequence.on('state', ({ state }) => {
    if (state === 'idle') board.reset();
  });

  const applyView = (view: SceneView): void => {
    board.setView(view);
    const framing = VIEW_CAMERAS[view];
    manager.flyTo(
      new Vector3(...framing.position),
      new Vector3(...framing.target),
      VIEW_FLIGHT_DURATION,
    );
  };

  const createUI = (): UILayer =>
    new UILayer(uiContainer, sequence, psuSequence, ecSequence, vrmSequence, {
      onViewChange: applyView,
    });

  let ui = createUI();

  // Every panel renders its text once, at construction. Rather than teach each
  // component to re-translate itself, the whole DOM layer is rebuilt and the
  // sequences re-announce where they are — language changes are rare enough.
  onLanguageChange(() => {
    const restore = board.currentView === 'board' ? null : board.currentView;
    const stage =
      restore === 'ec'
        ? ecSequence.currentIndex
        : restore === 'vrm'
          ? vrmSequence.currentIndex
          : psuSequence.currentIndex;

    ui.dispose();
    ui = createUI();

    sequence.emitCurrent();
    if (restore) ui.enterWalkthrough(restore, stage);
  });

  // Clicking the PSU (or activating its label) goes inside it, where the stages
  // between the wall socket and the DC rails play out in the scene itself.
  const picker = new Picker(manager.camera, manager.renderer.domElement);
  picker.register(board.psuObject, {
    onSelect: () => ui.enterPsuView(0),
    onHoverChange: (hovered) => board.setPsuHighlighted(hovered),
  });
  board.onPsuActivate = () => ui.enterPsuView(0);
  board.onEcActivate = () => ui.openEcView();
  initLanguage();

  manager.onRender((dt, elapsed) => {
    sequence.update(dt);
    psuSequence.update(dt);
    ecSequence.update(dt);
    vrmSequence.update(dt);
    board.update(dt, elapsed);
    // Picking the PSU again while already inside it would be a no-op at best.
    picker.setEnabled(!ui.isModalOpen && !ui.isPsuViewOpen);
    picker.update();
  });

  // Show the passive standby step and start the render loop.
  sequence.init();
  manager.start();

  // Take over with the real model if it exists; otherwise keep the placeholder.
  void loadMotherboard()
    .then((model) => {
      if (model) board.setModel(model);
    })
    .catch((error: unknown) => {
      console.error('[boot-anatomy] Failed to load the model:', error);
    });

  if (import.meta.env.DEV) {
    Object.assign(window, { __boot: { manager, board, sequence } });
  }
}

try {
  bootstrap();
} catch (error) {
  console.error(error);
  showFatalError(t(UI.sceneFailedBody));
}

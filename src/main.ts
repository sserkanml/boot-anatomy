import './ui/styles.css';

import { Vector3 } from 'three';

import { initLanguage, onLanguageChange } from './i18n';
import { UI } from './i18n/strings';
import { t } from './i18n';

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

  const applyView = (view: SceneView): void => {
    board.setView(view);
    const framing = VIEW_CAMERAS[view];
    manager.flyTo(
      new Vector3(...framing.position),
      new Vector3(...framing.target),
      VIEW_FLIGHT_DURATION,
    );
  };

  board.setChain(sequence.steps);

  // The chain is flat, so the step itself says where the camera belongs. That
  // is what makes the run dive into the PSU, the EC and the CPU on its own.
  sequence.on('step:enter', ({ step, index }) => {
    // View first: switching views drops every path, because they were routed
    // against the anchor set of the view being left. Building the step before
    // that would hand its signals straight to the clear.
    applyView(step.view ?? 'board');
    board.applyStep(step, index);
  });
  sequence.on('progress', ({ stepProgress }) => board.setStepProgress(stepProgress));
  sequence.on('state', ({ state }) => {
    if (state === 'idle') board.reset();
  });

  const createUI = (): UILayer => new UILayer(uiContainer, sequence);

  let ui = createUI();

  // Every panel renders its text once, at construction. Rather than teach each
  // component to re-translate itself, the whole DOM layer is rebuilt and the
  // sequences re-announce where they are — language changes are rare enough.
  onLanguageChange(() => {
    ui.dispose();
    ui = createUI();
    sequence.emitCurrent();
  });

  // Clicking the PSU (or activating its label) goes inside it, where the stages
  // between the wall socket and the DC rails play out in the scene itself.
  const picker = new Picker(manager.camera, manager.renderer.domElement);
  picker.register(board.psuObject, {
    onSelect: () => sequence.seekToStep('psu-ac-emi'),
    onHoverChange: (hovered) => board.setPsuHighlighted(hovered),
  });
  board.onPsuActivate = () => sequence.seekToStep('psu-ac-emi');
  board.onEcActivate = () => sequence.seekToStep('ec-standby');
  initLanguage();

  manager.onRender((dt, elapsed) => {
    sequence.update(dt);
    board.update(dt, elapsed);
    // Picking the PSU again while already inside it would be a no-op at best.
    picker.setEnabled(!ui.isModalOpen);
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

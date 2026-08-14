import './ui/styles.css';

import { Picker } from './core/Picker';
import { SceneManager } from './core/SceneManager';
import { createLighting } from './core/lighting';
import { BoardScene } from './scene/BoardScene';
import { createEnvironment } from './scene/environment';
import { loadMotherboard } from './scene/loadMotherboard';
import { BootSequence } from './state/BootSequence';
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
  overlay.innerHTML = `<h2 class="info-title">The scene could not start</h2><p class="info-desc">${message}</p>`;
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
  const sequence = new BootSequence();

  // State machine -> scene. The UI subscribes to the same events on its own.
  sequence.on('step:enter', ({ step, index }) => board.applyStep(step, index));
  sequence.on('progress', ({ stepProgress }) => board.setStepProgress(stepProgress));
  sequence.on('state', ({ state }) => {
    if (state === 'idle') board.reset();
  });

  const ui = new UILayer(uiContainer, sequence);

  // Clicking the PSU (or activating its label) opens the walkthrough of what
  // happens inside it, between the wall socket and the DC rails.
  const picker = new Picker(manager.camera, manager.renderer.domElement);
  picker.register(board.psuObject, {
    onSelect: () => ui.openPsuModal(),
    onHoverChange: (hovered) => board.setPsuHighlighted(hovered),
  });
  board.onPsuActivate = () => ui.openPsuModal();

  manager.onRender((dt, elapsed) => {
    sequence.update(dt);
    board.update(dt, elapsed);
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
  showFatalError(
    'Your browser may not have WebGL enabled. Check that hardware acceleration is on and reload the page.',
  );
}

import { Object3D } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ANCHOR_LABELS } from '../config/anchors';
import type { AnchorId } from '../types';
import type { AnchorRegistry } from './AnchorRegistry';

/** Anchors that get no label (to keep the scene from getting too busy). */
const HIDDEN: ReadonlySet<AnchorId> = new Set<AnchorId>(['display']);

export interface AnchorLabelOptions {
  /**
   * Anchors whose label becomes a real button. This is what makes a part
   * reachable by keyboard, not just by clicking it in the 3D scene.
   */
  actions?: Partial<Record<AnchorId, () => void>>;
}

/**
 * Hangs a CSS2D label above every anchor. Because the labels are real DOM
 * elements, they share the typography of the rest of the UI and stay crisp.
 */
export class AnchorLabels {
  private readonly objects = new Map<AnchorId, CSS2DObject>();
  private readonly root = new Object3D();

  constructor(
    private readonly anchors: AnchorRegistry,
    parent: Object3D,
    options: AnchorLabelOptions = {},
  ) {
    this.root.name = 'anchor-labels';
    parent.add(this.root);

    for (const [id, position] of anchors.entries()) {
      if (HIDDEN.has(id)) continue;

      const action = options.actions?.[id];
      const element = action
        ? document.createElement('button')
        : document.createElement('div');
      element.className = action ? 'anchor-label is-interactive' : 'anchor-label';
      element.textContent = ANCHOR_LABELS[id];

      if (action && element instanceof HTMLButtonElement) {
        element.type = 'button';
        element.title = `${ANCHOR_LABELS[id]} — open details`;
        element.addEventListener('click', action);
      }

      const object = new CSS2DObject(element);
      object.position.copy(position);
      // Offset the label so it floats above the anchor point
      object.center.set(0.5, 1.4);
      this.root.add(object);
      this.objects.set(id, object);
    }
  }

  /** Repositions labels when anchor coordinates change (i.e. model loaded). */
  refresh(): void {
    for (const [id, object] of this.objects) {
      object.position.copy(this.anchors.get(id));
    }
  }

  /** Highlights the given anchors' labels and dims the rest. */
  setActive(ids: readonly AnchorId[]): void {
    const active = new Set(ids);
    for (const [id, object] of this.objects) {
      object.element.classList.toggle('is-active', active.has(id));
    }
  }

  setVisible(visible: boolean): void {
    this.root.visible = visible;
  }

  /** Shows only the given anchors' labels; pass null to show every label. */
  setVisibleSet(ids: readonly AnchorId[] | null): void {
    const allowed = ids ? new Set(ids) : null;
    for (const [id, object] of this.objects) {
      object.visible = allowed === null || allowed.has(id);
      // CSS2DRenderer leaves hidden elements in the DOM, so clear them too.
      object.element.style.display = object.visible ? '' : 'none';
    }
  }

  dispose(): void {
    for (const object of this.objects.values()) {
      object.element.remove();
      object.removeFromParent();
    }
    this.objects.clear();
    this.root.removeFromParent();
  }
}

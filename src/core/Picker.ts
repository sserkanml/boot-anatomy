import { Raycaster, Vector2, type Camera, type Object3D } from 'three';

export interface PickHandlers {
  /** The object was clicked (as opposed to dragged through). */
  onSelect: () => void;
  /** The pointer entered or left the object. */
  onHoverChange?: (hovered: boolean) => void;
}

/**
 * A press may move this far, in pixels, and still count as a click not a drag.
 *
 * A mouse click barely moves, but a finger tap routinely slides ten pixels or
 * more — at the mouse threshold almost every tap would be read as an orbit and
 * nothing on the board would ever be selectable by touch.
 */
const CLICK_SLOP = 6;
const TOUCH_SLOP = 16;

/**
 * Turns pointer events on the canvas into clicks and hovers on registered
 * objects. Registration is by root object: a hit on any descendant reports the
 * root, so a whole assembly such as the PSU can be treated as one target.
 *
 * OrbitControls listens on the same element, so presses that turn into an orbit
 * drag are filtered out by distance rather than being swallowed here.
 */
export class Picker {
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly targets = new Map<Object3D, PickHandlers>();

  private hovered: Object3D | null = null;
  private pointerInside = false;
  private pressedAt: { x: number; y: number } | null = null;
  private needsPick = false;
  private enabled = true;

  constructor(
    private readonly camera: Camera,
    private readonly domElement: HTMLElement,
  ) {
    domElement.addEventListener('pointermove', this.onPointerMove);
    domElement.addEventListener('pointerdown', this.onPointerDown);
    domElement.addEventListener('pointerup', this.onPointerUp);
    domElement.addEventListener('pointerleave', this.onPointerLeave);
  }

  register(object: Object3D, handlers: PickHandlers): void {
    this.targets.set(object, handlers);
  }

  /** Suspends hover and click handling, e.g. while a dialog is open. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.clearHover();
  }

  /** Called from the render loop; only raycasts when the pointer has moved. */
  update(): void {
    if (!this.needsPick || !this.enabled) return;
    this.needsPick = false;

    const hit = this.pick();
    if (hit === this.hovered) return;

    if (this.hovered) this.targets.get(this.hovered)?.onHoverChange?.(false);
    this.hovered = hit;
    if (hit) this.targets.get(hit)?.onHoverChange?.(true);
    this.domElement.style.cursor = hit ? 'pointer' : '';
  }

  dispose(): void {
    this.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.domElement.removeEventListener('pointerleave', this.onPointerLeave);
    this.targets.clear();
  }

  private pick(): Object3D | null {
    if (!this.pointerInside || this.targets.size === 0) return null;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.targets.keys()], true);
    if (hits.length === 0) return null;

    // Walk up from the hit mesh to whichever registered root owns it.
    for (let node: Object3D | null = hits[0]!.object; node; node = node.parent) {
      if (this.targets.has(node)) return node;
    }
    return null;
  }

  private clearHover(): void {
    if (!this.hovered) return;
    this.targets.get(this.hovered)?.onHoverChange?.(false);
    this.hovered = null;
    this.domElement.style.cursor = '';
  }

  private updatePointer(event: PointerEvent): void {
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerMove = (event: PointerEvent): void => {
    this.pointerInside = true;
    this.updatePointer(event);
    this.needsPick = true;
  };

  private onPointerDown = (event: PointerEvent): void => {
    this.pressedAt = { x: event.clientX, y: event.clientY };
  };

  private onPointerUp = (event: PointerEvent): void => {
    const pressed = this.pressedAt;
    this.pressedAt = null;
    if (!pressed || !this.enabled) return;

    // An orbit drag ends far from where it began; a click barely moves.
    const moved = Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y);
    if (moved > (event.pointerType === 'touch' ? TOUCH_SLOP : CLICK_SLOP)) return;

    this.updatePointer(event);
    this.pointerInside = true;
    const hit = this.pick();
    if (hit) this.targets.get(hit)?.onSelect();

    // There is no pointer resting on a touchscreen, so a highlight left behind
    // after a tap would never be cleared by anything.
    if (event.pointerType === 'touch') {
      this.pointerInside = false;
      this.clearHover();
    }
  };

  private onPointerLeave = (): void => {
    this.pointerInside = false;
    this.pressedAt = null;
    this.clearHover();
  };
}

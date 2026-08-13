import { Box3, Vector3, type Object3D } from 'three';
import { DEFAULT_ANCHORS, MODEL_ANCHOR_HINTS } from '../config/anchors';
import type { AnchorId } from '../types';

/** Normalizes an object name so hints can be written in lower snake case. */
function normalize(name: string): string {
  return name.toLowerCase().replace(/[\s\-.]/g, '_');
}

/**
 * An anchor is a named 3D point in the scene. Because signal routes reference
 * anchor names instead of coordinates, only this class has to be updated when
 * the real GLB model arrives; the boot step data file stays untouched.
 */
export class AnchorRegistry {
  private readonly points = new Map<AnchorId, Vector3>();

  constructor(defaults: Record<AnchorId, Vector3> = DEFAULT_ANCHORS) {
    for (const [id, position] of Object.entries(defaults)) {
      this.points.set(id as AnchorId, position.clone());
    }
  }

  get(id: AnchorId): Vector3 {
    const point = this.points.get(id);
    if (!point) throw new Error(`Undefined anchor: ${id}`);
    return point;
  }

  set(id: AnchorId, position: Vector3): void {
    this.points.set(id, position.clone());
  }

  entries(): Array<[AnchorId, Vector3]> {
    return [...this.points.entries()];
  }

  /**
   * Derives anchor coordinates from the object names of the loaded model.
   *
   * For every anchor listed in MODEL_ANCHOR_HINTS, all matching objects are
   * collected and their bounding boxes unioned; the anchor is placed at the
   * horizontal center of that union, `clearance` above its top face so signal
   * paths travel over the component instead of through it.
   *
   * @returns The anchors that could be bound (the rest keep their defaults).
   */
  bindFromModel(root: Object3D, clearance = 0.6): AnchorId[] {
    // The model must have up-to-date world matrices for Box3 to be meaningful.
    root.updateMatrixWorld(true);

    const named: Array<{ key: string; object: Object3D }> = [];
    root.traverse((object) => {
      if (object.name) named.push({ key: normalize(object.name), object });
    });

    const bound: AnchorId[] = [];

    for (const [id, hints] of Object.entries(MODEL_ANCHOR_HINTS)) {
      const matches = this.findMatches(named, hints ?? []);
      if (matches.length === 0) continue;

      const union = new Box3();
      for (const object of matches) union.union(new Box3().setFromObject(object));
      if (union.isEmpty()) continue;

      const center = union.getCenter(new Vector3());
      this.set(id as AnchorId, new Vector3(center.x, union.max.y + clearance, center.z));
      bound.push(id as AnchorId);
    }

    return bound;
  }

  /**
   * Exact name matches win outright; substring matches are only consulted when
   * nothing matched exactly. Without that precedence a hint like `cpu` would
   * latch onto `nurbsToPoly1_CPULatch_0` instead of the `CPU` group itself.
   */
  private findMatches(
    named: Array<{ key: string; object: Object3D }>,
    hints: string[],
  ): Object3D[] {
    const exact = named.filter((entry) => hints.includes(entry.key));
    if (exact.length > 0) return exact.map((entry) => entry.object);

    return named
      .filter((entry) => hints.some((hint) => entry.key.includes(hint)))
      .map((entry) => entry.object);
  }
}

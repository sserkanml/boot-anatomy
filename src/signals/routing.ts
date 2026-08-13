import { Vector3 } from 'three';
import type { AnchorId } from '../types';
import type { AnchorRegistry } from '../scene/AnchorRegistry';

/** Points closer than this are treated as identical (Catmull-Rom NaN guard). */
const EPSILON = 0.02;

/** Height below which a point counts as sitting on the board surface. */
const BOARD_LEVEL = 2.2;

/**
 * Builds curve control points from a list of anchors.
 *
 * When both components sit on the board, a right-angled (Manhattan) elbow is
 * inserted like a real PCB trace, which Catmull-Rom then rounds off. If one end
 * is off-board or elevated (a PSU cable, for instance), an arcing midpoint is
 * used instead.
 */
export function buildRoutePoints(
  anchors: AnchorRegistry,
  route: readonly AnchorId[],
): Vector3[] {
  if (route.length < 2) {
    throw new Error(`A signal route needs at least two anchors: ${route.join(' -> ')}`);
  }

  const points: Vector3[] = [];
  const push = (point: Vector3) => {
    const last = points[points.length - 1];
    if (last && last.distanceTo(point) < EPSILON) return;
    points.push(point);
  };

  push(anchors.get(route[0]!).clone());

  for (let i = 0; i < route.length - 1; i += 1) {
    const from = anchors.get(route[i]!);
    const to = anchors.get(route[i + 1]!);

    const onBoard = from.y < BOARD_LEVEL && to.y < BOARD_LEVEL;

    if (onBoard) {
      // Travel along the longer axis first so traces look right-angled.
      const elbow =
        Math.abs(to.x - from.x) > Math.abs(to.z - from.z)
          ? new Vector3(to.x, (from.y + to.y) / 2, from.z)
          : new Vector3(from.x, (from.y + to.y) / 2, to.z);
      push(elbow);
    } else {
      // Paths leaving the board (PSU cable, display cable) arc over it.
      const mid = from.clone().lerp(to, 0.5);
      mid.y = Math.max(from.y, to.y) + 1.6;
      push(mid);
    }

    push(to.clone());
  }

  return points;
}

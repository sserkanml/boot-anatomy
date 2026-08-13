import {
  CircleGeometry,
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  type Scene,
} from 'three';
import { COLORS, FLOOR_Y } from '../config/constants';

/** Floor and grid. Makes the scale of the scene readable and catches shadows. */
export function createEnvironment(scene: Scene): void {
  const floor = new Mesh(
    new CircleGeometry(90, 64),
    new MeshStandardMaterial({
      color: COLORS.floor,
      roughness: 0.92,
      metalness: 0.15,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  floor.receiveShadow = true;
  floor.name = 'floor';
  scene.add(floor);

  const grid = new GridHelper(180, 90, COLORS.grid, COLORS.grid);
  grid.position.y = FLOOR_Y + 0.01;
  const gridMaterial = Array.isArray(grid.material) ? grid.material[0]! : grid.material;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.14;
  grid.name = 'grid';
  scene.add(grid);
}

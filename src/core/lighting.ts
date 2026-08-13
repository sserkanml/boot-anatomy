import { DirectionalLight, HemisphereLight, PointLight, type Scene } from 'three';

/**
 * Scene lighting. The signal paths emit their own light via additive blending,
 * so the ambient level is deliberately kept dark — and the key light is kept in
 * check as well, so the glowing traces don't wash out.
 */
export function createLighting(scene: Scene): void {
  // Sky/ground split — makes the green of the PCB read correctly under cool light.
  const hemi = new HemisphereLight(0x9fc4ff, 0x0a0d12, 0.55);
  scene.add(hemi);

  const key = new DirectionalLight(0xffffff, 2.1);
  key.position.set(24, 34, 20);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;

  const cam = key.shadow.camera;
  cam.near = 5;
  cam.far = 120;
  cam.left = -45;
  cam.right = 45;
  cam.top = 45;
  cam.bottom = -45;
  cam.updateProjectionMatrix();
  scene.add(key);

  // Cool fill from the opposite side — keeps detail alive in the dark areas.
  const fill = new DirectionalLight(0x5b8cff, 0.7);
  fill.position.set(-26, 14, -22);
  scene.add(fill);

  // A soft highlight above the board.
  const accent = new PointLight(0x7be0ff, 26, 60, 2);
  accent.position.set(0, 14, 6);
  scene.add(accent);
}

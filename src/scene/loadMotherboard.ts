import { Box3, Group, Vector3, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { BOARD } from '../config/constants';
import { MODEL } from '../config/model';

/** Builds a full URL for an asset under public/, honoring BASE_URL. */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

function createLoader(): GLTFLoader {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  if (MODEL.useDraco) {
    const draco = new DRACOLoader();
    draco.setDecoderPath(assetUrl(MODEL.dracoPath));
    loader.setDRACOLoader(draco);
  }

  return loader;
}

/**
 * Derives the rotation that lays a board flat, by assuming its smallest
 * bounding-box dimension is the PCB thickness and turning that axis into Y.
 *
 * Motherboard models are commonly authored in the XY plane (thickness on Z),
 * which would otherwise leave the board standing on its edge in the scene.
 */
function autoOrient(object: Object3D): void {
  const size = new Box3().setFromObject(object).getSize(new Vector3());
  const thinnest = Math.min(size.x, size.y, size.z);

  if (thinnest === size.z) object.rotation.x = -Math.PI / 2;
  else if (thinnest === size.x) object.rotation.z = Math.PI / 2;
  // thinnest === size.y: already lying flat, nothing to do.
}

/**
 * Fits the model to the scene scale: scales its longest horizontal edge to
 * BOARD.width, centers it on XZ and rests its bottom face on y=0.
 *
 * Must run *after* the model has been oriented — measuring a board that is
 * still standing upright yields a bounding box with a useless aspect ratio.
 */
function fitToBoard(pivot: Object3D): void {
  const box = new Box3().setFromObject(pivot);
  const size = box.getSize(new Vector3());
  if (size.x === 0 || size.z === 0) return;

  // The longest horizontal edge is taken to be the width of the board.
  const longest = Math.max(size.x, size.z);
  const scale = (BOARD.width / longest) * MODEL.scaleMultiplier;
  pivot.scale.setScalar(scale);

  // Recompute the box after scaling and center the model.
  const scaled = new Box3().setFromObject(pivot);
  const center = scaled.getCenter(new Vector3());
  pivot.position.x -= center.x;
  pivot.position.z -= center.z;
  pivot.position.y -= scaled.min.y;
}

/**
 * Loads the motherboard model from public/models/.
 *
 * If the file does not exist yet it quietly returns null and the scene keeps
 * using the placeholder board — which is why the project runs fine before the
 * model shows up.
 *
 * The returned object is a pivot Group: the glTF scene carries the orientation
 * rotation, while the pivot carries scale and position. Keeping the two on
 * separate objects means fitting never has to undo a rotation.
 */
export async function loadMotherboard(
  path: string = MODEL.path,
): Promise<Object3D | null> {
  const url = assetUrl(path);

  // Probe first so GLTFLoader doesn't spew a noisy error on a 404.
  try {
    const probe = await fetch(url, { method: 'HEAD' });
    if (!probe.ok) {
      console.info(
        `[boot-anatomy] Model not found (${url}). Falling back to the placeholder board.`,
      );
      return null;
    }
  } catch {
    console.info(
      '[boot-anatomy] Could not probe the model, falling back to the placeholder board.',
    );
    return null;
  }

  const loader = createLoader();
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;

  model.traverse((object) => {
    object.castShadow = true;
    object.receiveShadow = true;
  });

  // The flattening rotation goes on the inner object and the configured
  // rotation on the pivot around it. Stacking both on one Euler would not work:
  // three's default 'XYZ' order applies Y before X, so a yaw meant for the
  // flattened board would be applied while it is still standing on edge.
  if (MODEL.autoOrient) autoOrient(model);

  const pivot = new Group();
  pivot.name = 'motherboard-model';
  pivot.add(model);
  pivot.rotation.set(...MODEL.rotation);

  if (MODEL.autoFit) fitToBoard(pivot);
  pivot.position.add(new Vector3(...MODEL.offset));
  pivot.updateMatrixWorld(true);

  if (import.meta.env.DEV) {
    const box = new Box3().setFromObject(pivot);
    const size = box.getSize(new Vector3());
    console.info(
      `[boot-anatomy] Model fitted: ${size.x.toFixed(1)} x ${size.y.toFixed(1)} x ${size.z.toFixed(1)} units (w/h/d).`,
    );

    const names: string[] = [];
    model.traverse((object) => {
      if (object.name) names.push(object.name);
    });
    // You will want this list when wiring up the anchor mapping
    // (MODEL_ANCHOR_HINTS in config/anchors.ts).
    console.groupCollapsed(`[boot-anatomy] Model object names (${names.length})`);
    console.log(names.join('\n'));
    console.groupEnd();
  }

  return pivot;
}

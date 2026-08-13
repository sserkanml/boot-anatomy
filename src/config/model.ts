/**
 * Loading settings for the real motherboard model.
 *
 * Drop the model in as public/models/motherboard.glb and it is loaded
 * automatically, hiding the placeholder board.
 */
export const MODEL = {
  /** Relative to BASE_URL — also works under a GitHub Pages subdirectory. */
  path: 'models/motherboard.glb',

  /**
   * Lay the board flat by treating its thinnest bounding-box axis as the PCB
   * thickness. Handles the common case of a model authored in the XY plane.
   */
  autoOrient: true,

  /** Scale the longest horizontal edge to BOARD.width and center the model. */
  autoFit: true,

  /**
   * Extra rotation applied on top of autoOrient, before fitting. Use it to spin
   * the board around Y so the rear I/O panel ends up where the scene expects it.
   *
   * The bundled model (Sketchfab ROG STRIX Z370-E, authored in the XY plane)
   * needs a -90 degree yaw: autoOrient lays it flat with the I/O panel on the
   * -X edge, and this turns it to the -Z edge so the I/O faces away from the
   * camera.
   */
  rotation: [0, -Math.PI / 2, 0] as [number, number, number],

  /** Offset applied after fitting. */
  offset: [0, 0, 0] as [number, number, number],
  scaleMultiplier: 1,

  /**
   * If your GLB is Draco-compressed, copy the decoder files from
   * node_modules/three/examples/jsm/libs/draco/gltf/ into public/draco/
   * and set this to true.
   */
  useDraco: false,
  dracoPath: 'draco/',
} as const;

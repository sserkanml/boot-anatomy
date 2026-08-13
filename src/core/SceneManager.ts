import {
  ACESFilmicToneMapping,
  Clock,
  Color,
  Fog,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CAMERA, COLORS } from '../config/constants';

export type UpdateCallback = (dt: number, elapsed: number) => void;

export interface SceneManagerOptions {
  canvas: HTMLCanvasElement;
  /** Element the CSS2D label layer is mounted into. */
  labelContainer: HTMLElement;
}

/**
 * Renderer / camera / controls / render loop. Knows nothing about the contents
 * of the scene; content modules hook into the loop through onRender().
 */
export class SceneManager {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGLRenderer;
  readonly labelRenderer: CSS2DRenderer;
  readonly controls: OrbitControls;

  private readonly clock = new Clock();
  private readonly updates = new Set<UpdateCallback>();
  private readonly resizeObserver: ResizeObserver;
  private elapsed = 0;
  private running = false;

  constructor({ canvas, labelContainer }: SceneManagerOptions) {
    this.scene = new Scene();
    this.scene.background = new Color(COLORS.background);
    this.scene.fog = new Fog(COLORS.fog, 70, 190);

    this.camera = new PerspectiveCamera(
      CAMERA.fov,
      window.innerWidth / window.innerHeight,
      CAMERA.near,
      CAMERA.far,
    );
    this.camera.position.set(...CAMERA.position);

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;

    // A procedural studio environment so PBR materials (the PSU shell, socket
    // metals) get proper reflections. No external HDR file required.
    const pmrem = new PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.scene.environment = pmrem.fromScene(room, 0.04).texture;
    this.scene.environmentIntensity = 0.35;
    room.dispose();
    pmrem.dispose();

    // Label layer: pins DOM elements to 3D points.
    this.labelRenderer = new CSS2DRenderer({ element: labelContainer });
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = CAMERA.minDistance;
    this.controls.maxDistance = CAMERA.maxDistance;
    // Keep the camera from dropping below the board
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.target.set(...CAMERA.target);
    this.controls.update();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(document.body);
    window.addEventListener('resize', this.resize);
  }

  /** Adds an update function to the render loop; returns a remover. */
  onRender(callback: UpdateCallback): () => void {
    this.updates.add(callback);
    return () => this.updates.delete(callback);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.renderer.setAnimationLoop(this.tick);
  }

  stop(): void {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  /** Moves the orbit target so the camera smoothly focuses a given point. */
  lookAt(target: Vector3): void {
    this.controls.target.copy(target);
  }

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.resize);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    this.updates.clear();
  }

  private tick = (): void => {
    // Clamp the huge dt that piles up while the tab is in the background.
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.elapsed += dt;

    this.controls.update();
    for (const update of this.updates) update(dt, this.elapsed);

    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  };

  private resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height, false);
    this.labelRenderer.setSize(width, height);
  };
}

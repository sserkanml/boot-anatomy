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
/**
 * Render resolution multiplier.
 *
 * Phones ship 3x screens attached to a fraction of the GPU, and this scene is
 * not cheap — additive particles, a PBR environment, shadows. Rendering a 3x
 * panel at 2x is nine times the pixels of a laptop for a device that has to
 * stay in someone's hand. Capping lower there is the difference between a
 * smooth orbit and a slideshow, and at phone viewing distance the loss is
 * hard to see.
 */
/** Read live rather than cached: the preference can change mid-session. */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function targetPixelRatio(): number {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return Math.min(window.devicePixelRatio, coarse ? 1.75 : 2);
}

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
  private flight: {
    fromPosition: Vector3;
    toPosition: Vector3;
    fromTarget: Vector3;
    toTarget: Vector3;
    elapsed: number;
    duration: number;
  } | null = null;

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
    this.renderer.setPixelRatio(targetPixelRatio());
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

  /**
   * Eases the camera to a new position and orbit target. Orbit input is
   * suspended for the duration so a stray drag cannot fight the movement.
   */
  flyTo(position: Vector3, target: Vector3, duration = 1.4): void {
    // A camera sweeping across the board is exactly the kind of large motion
    // that triggers vestibular symptoms, and it carries no information the
    // arrival does not — so honour the preference by cutting rather than
    // flying. The duration is floored, not zeroed, so the flight still runs
    // through the same code path and lands in the same place.
    const wanted = prefersReducedMotion() ? 0.001 : duration;
    this.flight = {
      fromPosition: this.camera.position.clone(),
      toPosition: position.clone(),
      fromTarget: this.controls.target.clone(),
      toTarget: target.clone(),
      elapsed: 0,
      duration: Math.max(0.001, wanted),
    };
    this.controls.enabled = false;
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

    this.advanceFlight(dt);
    this.controls.update();
    for (const update of this.updates) update(dt, this.elapsed);

    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  };

  private advanceFlight(dt: number): void {
    const flight = this.flight;
    if (!flight) return;

    flight.elapsed += dt;
    const t = Math.min(1, flight.elapsed / flight.duration);
    // easeInOutCubic: settles without overshooting the framing.
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    this.camera.position.lerpVectors(flight.fromPosition, flight.toPosition, eased);
    this.controls.target.lerpVectors(flight.fromTarget, flight.toTarget, eased);

    if (t >= 1) {
      this.flight = null;
      this.controls.enabled = true;
    }
  }

  private resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(targetPixelRatio());
    this.renderer.setSize(width, height, false);
    this.labelRenderer.setSize(width, height);
  };
}

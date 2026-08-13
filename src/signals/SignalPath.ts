import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Group,
  Mesh,
  Points,
  PointsMaterial,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
  type Texture,
} from 'three';

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * uProgress: how much of the path has been drawn (0..1).
 * The drawn region keeps a dim base glow, the advancing head lights up, and a
 * sine pulse travelling along the path sells the sense of flow.
 */
const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uProgress;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    float t = vUv.x;
    float drawn = step(t, uProgress);

    // Head glow while the path is still being drawn; fades once it completes.
    float head = smoothstep(0.05, 0.0, abs(t - uProgress)) * (1.0 - step(0.999, uProgress));

    float pulse = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(t * 26.0 - uTime * 5.0), 2.0);
    float rim = 0.55 + 0.45 * sin(vUv.y * 3.14159265);

    float alpha = (drawn * 0.55 * pulse + head * 0.9) * uOpacity * rim;
    if (alpha < 0.005) discard;

    gl_FragColor = vec4(uColor * (1.0 + head * 1.6), alpha);
  }
`;

export interface SignalPathOptions {
  points: Vector3[];
  color: number;
  /** Number of flowing particles (0 = draw the path only). */
  particles?: number;
  /** Path thickness multiplier. */
  thickness?: number;
  /** How fast the particles cycle along the path. */
  flowSpeed?: number;
  glowTexture: Texture;
}

/**
 * A single signal path: a glowing tube with particles flowing along it.
 * Time and progress are driven from the outside (by SignalOrchestrator).
 */
export class SignalPath {
  readonly group = new Group();

  private readonly curve: CatmullRomCurve3;
  private readonly tube: Mesh;
  private readonly material: ShaderMaterial;
  private readonly points?: Points;
  private readonly pointsMaterial?: PointsMaterial;
  private readonly particleCount: number;
  private readonly flowSpeed: number;
  private readonly scratch = new Vector3();

  private progress = 0;
  private opacity = 1;

  constructor(options: SignalPathOptions) {
    const {
      points,
      color,
      particles = 0,
      thickness = 1,
      flowSpeed = 0.35,
      glowTexture,
    } = options;

    this.particleCount = particles;
    this.flowSpeed = flowSpeed;
    this.curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.35);

    // Segment count scales with length — don't waste triangles on short paths.
    const length = this.curve.getLength();
    const segments = Math.max(24, Math.min(180, Math.round(length * 5)));

    this.material = new ShaderMaterial({
      uniforms: {
        uColor: { value: new Color(color) },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    this.tube = new Mesh(
      new TubeGeometry(this.curve, segments, 0.13 * thickness, 8, false),
      this.material,
    );
    this.tube.frustumCulled = false;
    this.group.add(this.tube);

    if (particles > 0) {
      const geometry = new BufferGeometry();
      geometry.setAttribute(
        'position',
        new BufferAttribute(new Float32Array(particles * 3), 3),
      );

      this.pointsMaterial = new PointsMaterial({
        color: new Color(color),
        map: glowTexture,
        size: 0.85 * thickness,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      });

      this.points = new Points(geometry, this.pointsMaterial);
      this.points.frustumCulled = false;
      this.group.add(this.points);
    }
  }

  /** How much of the path is drawn (0..1). */
  setProgress(value: number): void {
    this.progress = Math.min(1, Math.max(0, value));
    this.material.uniforms.uProgress!.value = this.progress;
  }

  setOpacity(value: number): void {
    this.opacity = Math.min(1, Math.max(0, value));
    this.material.uniforms.uOpacity!.value = this.opacity;
    if (this.pointsMaterial) this.pointsMaterial.opacity = this.opacity;
  }

  getOpacity(): number {
    return this.opacity;
  }

  /** @param elapsed Total time since the scene started (seconds). */
  update(elapsed: number): void {
    this.material.uniforms.uTime!.value = elapsed;
    if (!this.points || this.particleCount === 0) return;

    const attribute = this.points.geometry.getAttribute('position') as BufferAttribute;
    const array = attribute.array as Float32Array;

    // Particles flow from start to end within the drawn portion of the path.
    const span = Math.max(this.progress, 0.0001);
    for (let i = 0; i < this.particleCount; i += 1) {
      const phase = (elapsed * this.flowSpeed + i / this.particleCount) % 1;
      this.curve.getPointAt(phase * span, this.scratch);
      array[i * 3] = this.scratch.x;
      array[i * 3 + 1] = this.scratch.y;
      array[i * 3 + 2] = this.scratch.z;
    }
    attribute.needsUpdate = true;
  }

  dispose(): void {
    this.group.removeFromParent();
    this.tube.geometry.dispose();
    this.material.dispose();
    this.points?.geometry.dispose();
    this.pointsMaterial?.dispose();
  }
}

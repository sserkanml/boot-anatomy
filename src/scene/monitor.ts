import {
  BoxGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  SRGBColorSpace,
} from 'three';
import { MONITOR } from '../config/constants';
import { t } from '../i18n';
import { UI } from '../i18n/strings';
import type { BootStep } from '../types';

type ScreenMode = NonNullable<BootStep['screen']>;

const CANVAS_W = 1024;
const CANVAS_H = 608;

export interface MonitorObject {
  group: Group;
  /** Updates the screen contents for the given step. */
  setScreen(mode: ScreenMode, lines: string[]): void;
  update(dt: number): void;
  dispose(): void;
}

/**
 * Representative monitor. The screen surface is drawn as a canvas texture and
 * shows the off / POST / kernel log / login screens depending on the boot step.
 */
export function createMonitor(): MonitorObject {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not acquire a 2D context');

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;

  const group = new Group();
  group.name = 'monitor';

  const bezelMaterial = new MeshStandardMaterial({
    color: 0x14181f,
    roughness: 0.5,
    metalness: 0.6,
  });
  const screenMaterial = new MeshBasicMaterial({ map: texture, toneMapped: false });

  const bezel = new Mesh(
    new BoxGeometry(MONITOR.width + 0.9, MONITOR.height + 0.9, 0.6),
    bezelMaterial,
  );
  bezel.castShadow = true;
  group.add(bezel);

  const screen = new Mesh(new PlaneGeometry(MONITOR.width, MONITOR.height), screenMaterial);
  screen.position.z = 0.32;
  group.add(screen);

  const neck = new Mesh(new BoxGeometry(1.6, 5, 1.2), bezelMaterial);
  neck.position.y = -MONITOR.height / 2 - 2.6;
  group.add(neck);

  const base = new Mesh(new BoxGeometry(9, 0.6, 5), bezelMaterial);
  base.position.y = -MONITOR.height / 2 - 5.2;
  base.receiveShadow = true;
  group.add(base);

  // Light cast in front of the screen while it is on
  const glow = new PointLight(0x8fd0ff, 0, 45, 2);
  glow.position.z = 6;
  group.add(glow);

  group.position.set(...MONITOR.position);

  let targetGlow = 0;
  let mode: ScreenMode = 'off';
  let visibleLines = 0;
  let lineTimer = 0;
  let currentLines: string[] = [];

  function draw(): void {
    ctx!.fillStyle = mode === 'off' ? '#05070a' : '#080c12';
    ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (mode === 'off') {
      ctx!.fillStyle = 'rgba(120, 140, 170, 0.25)';
      ctx!.font = '500 22px ui-monospace, monospace';
      ctx!.textAlign = 'center';
      ctx!.fillText('NO SIGNAL', CANVAS_W / 2, CANVAS_H / 2);
      texture.needsUpdate = true;
      return;
    }

    if (mode === 'login') {
      drawLogin();
      texture.needsUpdate = true;
      return;
    }

    // POST / boot: terminal output
    ctx!.textAlign = 'left';
    ctx!.font = '400 20px ui-monospace, SFMono-Regular, Menlo, monospace';

    const shown = currentLines.slice(0, visibleLines);
    shown.forEach((line, i) => {
      const isOk = line.includes('[  OK  ]');
      ctx!.fillStyle = isOk ? '#7bd88f' : mode === 'post' ? '#c9d6e6' : '#9fb3c8';
      ctx!.fillText(line, 48, 70 + i * 30);
    });

    // Blinking cursor
    if (shown.length > 0) {
      ctx!.fillStyle = '#7bd88f';
      ctx!.fillRect(48, 56 + shown.length * 30, 11, 20);
    }

    texture.needsUpdate = true;
  }

  function drawLogin(): void {
    const gradient = ctx!.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    gradient.addColorStop(0, '#101a2c');
    gradient.addColorStop(1, '#1c2436');
    ctx!.fillStyle = gradient;
    ctx!.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Card
    const cardW = 380;
    const cardH = 250;
    const x = (CANVAS_W - cardW) / 2;
    const y = (CANVAS_H - cardH) / 2;
    ctx!.fillStyle = 'rgba(12, 18, 28, 0.82)';
    ctx!.fillRect(x, y, cardW, cardH);
    ctx!.strokeStyle = 'rgba(140, 180, 230, 0.28)';
    ctx!.lineWidth = 2;
    ctx!.strokeRect(x, y, cardW, cardH);

    // Avatar
    ctx!.beginPath();
    ctx!.arc(CANVAS_W / 2, y + 62, 34, 0, Math.PI * 2);
    ctx!.fillStyle = 'rgba(120, 170, 230, 0.35)';
    ctx!.fill();

    ctx!.textAlign = 'center';
    ctx!.fillStyle = '#e6edf3';
    ctx!.font = '600 24px system-ui, sans-serif';
    ctx!.fillText('serkan', CANVAS_W / 2, y + 132);

    // Password field
    ctx!.fillStyle = 'rgba(255,255,255,0.08)';
    ctx!.fillRect(x + 50, y + 158, cardW - 100, 42);
    ctx!.fillStyle = 'rgba(230, 237, 243, 0.55)';
    ctx!.font = '400 18px ui-monospace, monospace';
    ctx!.fillText('••••••••', CANVAS_W / 2, y + 186);

    ctx!.fillStyle = 'rgba(180, 200, 225, 0.5)';
    ctx!.font = '400 15px system-ui, sans-serif';
    ctx!.fillText(t(UI.logIn), CANVAS_W / 2, y + 228);
  }

  draw();

  return {
    group,
    setScreen(nextMode, lines) {
      mode = nextMode;
      currentLines = lines;
      visibleLines = mode === 'off' || mode === 'login' ? lines.length : 0;
      lineTimer = 0;
      targetGlow = mode === 'off' ? 0 : mode === 'login' ? 12 : 7;
      draw();
    },
    update(dt) {
      glow.intensity += (targetGlow - glow.intensity) * Math.min(1, dt * 2.4);

      // Print the log lines one by one — typewriter effect
      if (visibleLines < currentLines.length) {
        lineTimer += dt;
        if (lineTimer >= 0.42) {
          lineTimer = 0;
          visibleLines += 1;
          draw();
        }
      }
    },
    dispose() {
      group.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
      bezelMaterial.dispose();
      screenMaterial.dispose();
      texture.dispose();
    },
  };
}

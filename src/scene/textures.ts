import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

/**
 * Procedural PCB texture generator. Draws a convincing copper trace pattern on
 * top of the placeholder board until the real motherboard model arrives — no
 * external files needed.
 */
export function createPcbTexture(size = 1024): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not acquire a 2D context');

  // Solder mask base
  ctx.fillStyle = '#0d3a2b';
  ctx.fillRect(0, 0, size, size);

  // Subtle surface noise
  for (let i = 0; i < 9000; i += 1) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)';
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }

  // Copper traces with Manhattan routing
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < 220; i += 1) {
    ctx.strokeStyle = `rgba(58, 156, 118, ${0.25 + Math.random() * 0.4})`;
    ctx.lineWidth = Math.random() > 0.75 ? 3 : 1.5;

    let x = Math.round((Math.random() * size) / 8) * 8;
    let y = Math.round((Math.random() * size) / 8) * 8;
    ctx.beginPath();
    ctx.moveTo(x, y);

    const segments = 2 + Math.floor(Math.random() * 4);
    for (let s = 0; s < segments; s += 1) {
      const length = 24 + Math.random() * 150;
      if (Math.random() > 0.5) x += Math.random() > 0.5 ? length : -length;
      else y += Math.random() > 0.5 ? length : -length;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Vias and gold-plated pads
  for (let i = 0; i < 420; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + Math.random() * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.35 ? 'rgba(196, 160, 74, 0.55)' : 'rgba(10, 40, 30, 0.9)';
    ctx.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Soft-edged light dot for the signal particles.
 * Fades out from the center since it is used with additive blending.
 */
export function createGlowTexture(size = 128): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not acquire a 2D context');

  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.85)');
  gradient.addColorStop(0.55, 'rgba(255,255,255,0.22)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

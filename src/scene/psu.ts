import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { DEFAULT_ANCHORS } from '../config/anchors';
import { COLORS, PSU_BOX } from '../config/constants';

export interface PsuObject {
  group: Group;
  /** Called every frame to spin the fan. */
  update(dt: number): void;
  /** Starts the fan once the main converter switches on. */
  setRunning(running: boolean): void;
  dispose(): void;
}

/**
 * Representative PSU: not a real model, just a box with PBR materials plus a
 * fan and a 24-pin cable bundle. It sits next to the motherboard and feeds the
 * 'psu' anchor used by the signal paths.
 */
export function createPsu(): PsuObject {
  const group = new Group();
  group.name = 'psu';

  const shell = new MeshStandardMaterial({
    color: COLORS.psuShell,
    roughness: 0.38,
    metalness: 0.85,
  });
  const dark = new MeshStandardMaterial({ color: 0x0d1015, roughness: 0.7, metalness: 0.4 });
  const fanMaterial = new MeshStandardMaterial({
    color: 0x1a1e25,
    roughness: 0.55,
    metalness: 0.2,
  });
  const cableMaterial = new MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.85,
    metalness: 0.05,
  });

  const body = new Mesh(
    new BoxGeometry(PSU_BOX.width, PSU_BOX.height, PSU_BOX.depth),
    shell,
  );
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 120mm fan cutout on the top face
  const fanRing = new Mesh(new TorusGeometry(4.6, 0.35, 12, 48), dark);
  fanRing.rotation.x = Math.PI / 2;
  fanRing.position.y = PSU_BOX.height / 2 + 0.02;
  group.add(fanRing);

  const fan = new Group();
  fan.position.y = PSU_BOX.height / 2 - 0.15;
  for (let i = 0; i < 7; i += 1) {
    const blade = new Mesh(new BoxGeometry(4.2, 0.12, 1.5), fanMaterial);
    blade.position.set(Math.cos((i / 7) * Math.PI * 2) * 2.1, 0, Math.sin((i / 7) * Math.PI * 2) * 2.1);
    blade.rotation.y = (i / 7) * Math.PI * 2;
    blade.rotation.z = 0.32;
    fan.add(blade);
  }
  const hub = new Mesh(new CylinderGeometry(1.1, 1.1, 0.5, 24), dark);
  fan.add(hub);
  group.add(fan);

  // Ventilation slots on the case (left face)
  for (let i = 0; i < 8; i += 1) {
    const vent = new Mesh(new BoxGeometry(0.08, 5.2, 0.35), dark);
    vent.position.set(-PSU_BOX.width / 2 - 0.01, 0, -4 + i * 1.15);
    group.add(vent);
  }

  group.position.set(...PSU_BOX.position);

  // --- 24-pin cable bundle: from the PSU outlet to the board connector ---
  // Its route matches the anchors (psu -> atx24) so the signal paths read as if
  // they were flowing through this cable.
  const psuAnchor = DEFAULT_ANCHORS.psu;
  const atxAnchor = DEFAULT_ANCHORS.atx24;
  const cableCurve = new CatmullRomCurve3([
    psuAnchor.clone(),
    new Vector3(psuAnchor.x - 1.6, psuAnchor.y + 1.2, psuAnchor.z - 1),
    new Vector3(atxAnchor.x + 1.4, atxAnchor.y + 1.6, atxAnchor.z + 0.6),
    new Vector3(atxAnchor.x, atxAnchor.y - 0.2, atxAnchor.z),
  ]);
  const cable = new Mesh(new TubeGeometry(cableCurve, 48, 0.55, 10, false), cableMaterial);
  cable.castShadow = true;
  cable.name = 'atx24-cable';
  // The cable is defined in world space, so it lives outside the PSU group.
  const cableGroup = new Group();
  cableGroup.add(cable);

  const root = new Group();
  root.name = 'psu-assembly';
  root.add(group, cableGroup);

  let running = false;
  let speed = 0;

  return {
    group: root,
    update(dt: number) {
      // The fan spins up when switched on and coasts down when switched off.
      const target = running ? 9 : 0;
      speed += (target - speed) * Math.min(1, dt * 1.5);
      fan.rotation.y += speed * dt;
    },
    setRunning(value: boolean) {
      running = value;
    },
    dispose() {
      root.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
      shell.dispose();
      dark.dispose();
      fanMaterial.dispose();
      cableMaterial.dispose();
    },
  };
}

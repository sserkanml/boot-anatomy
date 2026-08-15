import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type Material,
} from 'three';
import { DEFAULT_ANCHORS } from '../config/anchors';
import { PSU_BOX } from '../config/constants';

/**
 * The inside of the power supply, built from primitives: the components energy
 * actually passes through on its way from the wall socket to the DC rails.
 *
 * The layout is a U. The primary side runs down the +X half from the rear mains
 * inlet, the two transformers straddle the x=0 plane, and the secondary side
 * runs back up the -X half to the output block. That x=0 plane is drawn as a
 * translucent barrier: in a real unit it is the only thing energy crosses, and
 * only magnetically, which is what keeps the case safe to touch.
 */

const [PSU_X, PSU_Y, PSU_Z] = PSU_BOX.position;

/** Converts a PSU-local point into world space. */
function local(x: number, y: number, z: number): Vector3 {
  return new Vector3(PSU_X + x, PSU_Y + y, PSU_Z + z);
}

/** Floor of the PSU interior, in local coordinates. */
const FLOOR_Y = -PSU_BOX.height / 2 + 0.25;

interface Materials {
  pcb: MeshStandardMaterial;
  can: MeshStandardMaterial;
  copper: MeshStandardMaterial;
  ferrite: MeshStandardMaterial;
  heatsink: MeshStandardMaterial;
  chip: MeshStandardMaterial;
  plastic: MeshStandardMaterial;
  metal: MeshStandardMaterial;
  cable: MeshStandardMaterial;
}

function createMaterials(): Materials {
  return {
    pcb: new MeshStandardMaterial({ color: 0x17402f, roughness: 0.8, metalness: 0.1 }),
    can: new MeshStandardMaterial({ color: 0x2b3648, roughness: 0.45, metalness: 0.6 }),
    copper: new MeshStandardMaterial({ color: 0xb87333, roughness: 0.35, metalness: 0.9 }),
    ferrite: new MeshStandardMaterial({ color: 0x1b1f26, roughness: 0.7, metalness: 0.25 }),
    heatsink: new MeshStandardMaterial({ color: 0x8d97a6, roughness: 0.36, metalness: 0.9 }),
    chip: new MeshStandardMaterial({ color: 0x14181f, roughness: 0.55, metalness: 0.3 }),
    plastic: new MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.75, metalness: 0.05 }),
    metal: new MeshStandardMaterial({ color: 0xc2cad6, roughness: 0.3, metalness: 0.95 }),
    cable: new MeshStandardMaterial({ color: 0x0f1116, roughness: 0.85, metalness: 0.05 }),
  };
}

function addMesh(parent: Group, mesh: Mesh): Mesh {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/** An electrolytic capacitor: the cans that dominate the inside of a supply. */
function capacitor(m: Materials, radius: number, height: number): Group {
  const group = new Group();
  const body = new Mesh(new CylinderGeometry(radius, radius, height, 20), m.can);
  body.position.y = height / 2;
  addMesh(group, body);

  const cap = new Mesh(new CylinderGeometry(radius * 0.97, radius * 0.97, 0.08, 20), m.metal);
  cap.position.y = height;
  addMesh(group, cap);
  return group;
}

/** A wound toroidal choke — the EMI chokes, the PFC choke, output inductors. */
function toroid(m: Materials, radius: number, tube: number): Group {
  const group = new Group();
  const core = new Mesh(new TorusGeometry(radius, tube, 10, 24), m.ferrite);
  core.rotation.x = Math.PI / 2;
  core.position.y = tube;
  addMesh(group, core);

  // A handful of visible copper turns around the core.
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2;
    const turn = new Mesh(new TorusGeometry(tube * 1.25, tube * 0.3, 6, 12), m.copper);
    turn.position.set(Math.cos(angle) * radius, tube, Math.sin(angle) * radius);
    turn.rotation.y = -angle;
    addMesh(group, turn);
  }
  return group;
}

/** A transformer: ferrite core wrapped in copper, on a small bobbin. */
function transformer(m: Materials, w: number, h: number, d: number): Group {
  const group = new Group();
  const core = new Mesh(new BoxGeometry(w, h, d), m.ferrite);
  core.position.y = h / 2;
  addMesh(group, core);

  for (let i = 0; i < 3; i += 1) {
    const winding = new Mesh(new TorusGeometry(h * 0.36, 0.12, 8, 20), m.copper);
    winding.rotation.y = Math.PI / 2;
    winding.position.set(0, h * 0.5, -d * 0.25 + i * d * 0.25);
    winding.scale.set(1, 1, w / (h * 0.72));
    addMesh(group, winding);
  }
  return group;
}

/** A finned heatsink with the switching devices bolted to it. */
function heatsink(m: Materials, w: number, h: number, fins: number): Group {
  const group = new Group();
  const base = new Mesh(new BoxGeometry(w, h * 0.25, 0.35), m.heatsink);
  base.position.y = h * 0.125;
  addMesh(group, base);

  for (let i = 0; i < fins; i += 1) {
    const fin = new Mesh(new BoxGeometry(w / fins - 0.12, h, 0.18), m.heatsink);
    fin.position.set(-w / 2 + (i + 0.5) * (w / fins), h / 2, 0.12);
    addMesh(group, fin);
  }

  // The TO-247 packages doing the actual switching.
  for (let i = 0; i < 2; i += 1) {
    const device = new Mesh(new BoxGeometry(0.55, 0.8, 0.16), m.chip);
    device.position.set(-w * 0.22 + i * w * 0.44, h * 0.42, -0.24);
    addMesh(group, device);
  }
  return group;
}

function chip(m: Materials, w: number, d: number): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, 0.16, d), m.chip);
  mesh.position.y = 0.08;
  return mesh;
}

/** The mains outlet on the wall, plus the cable running to the PSU inlet. */
function createWallSocket(m: Materials): Group {
  const group = new Group();
  group.name = 'wall-socket';

  const socket = DEFAULT_ANCHORS.wallSocket;

  const plate = new Mesh(new BoxGeometry(3.4, 3.4, 0.5), m.plastic);
  plate.position.copy(socket);
  addMesh(group, plate);

  // Two recessed contacts, the giveaway that this is a Schuko outlet.
  for (let i = 0; i < 2; i += 1) {
    const hole = new Mesh(new CylinderGeometry(0.34, 0.34, 0.3, 14), m.chip);
    hole.rotation.x = Math.PI / 2;
    hole.position.set(socket.x - 0.7 + i * 1.4, socket.y, socket.z - 0.3);
    addMesh(group, hole);
  }

  // Power cable from the outlet down and forward into the rear of the PSU.
  const inlet = DEFAULT_ANCHORS.psuInlet;
  const curve = new CatmullRomCurve3([
    new Vector3(socket.x, socket.y - 0.6, socket.z - 0.4),
    new Vector3(socket.x + 0.6, socket.y - 3.2, socket.z - 4),
    new Vector3(inlet.x + 1.2, inlet.y - 0.4, inlet.z + 5),
    new Vector3(inlet.x, inlet.y, inlet.z + 1.4),
  ]);
  const cable = new Mesh(new TubeGeometry(curve, 48, 0.28, 10, false), m.cable);
  cable.name = 'mains-cable';
  addMesh(group, cable);

  return group;
}

export interface PsuInternals {
  group: Group;
  /** Shown only while the camera is inside the PSU. */
  setVisible(visible: boolean): void;
  /** Lights the isolation barrier while the transformer stage is active. */
  setBarrierActive(active: boolean): void;
  update(dt: number): void;
  dispose(): void;
}

export function createPsuInternals(): PsuInternals {
  const m = createMaterials();
  const root = new Group();
  root.name = 'psu-internals';
  root.visible = false;

  /** Places a component group at a PSU-local position, resting on the floor. */
  const place = (child: Group | Mesh, x: number, z: number, y = FLOOR_Y): void => {
    child.position.copy(local(x, y, z));
    root.add(child);
  };

  // --- Main board the components stand on ---
  const board = new Mesh(
    new BoxGeometry(PSU_BOX.width - 1.4, 0.22, PSU_BOX.depth - 1.4),
    m.pcb,
  );
  board.position.copy(local(0, FLOOR_Y - 0.11, 0));
  board.receiveShadow = true;
  root.add(board);

  // --- Isolation barrier: the plane energy may only cross magnetically ---
  const barrierMaterial = new MeshBasicMaterial({
    color: 0xff9f45,
    transparent: true,
    opacity: 0.07,
    side: DoubleSide,
    depthWrite: false,
  });
  const barrier = new Mesh(
    new PlaneGeometry(PSU_BOX.depth - 1.4, PSU_BOX.height - 1),
    barrierMaterial,
  );
  barrier.rotation.y = Math.PI / 2;
  barrier.position.copy(local(0, 0, 0));
  barrier.name = 'isolation-barrier';
  root.add(barrier);

  // --- Primary side: rear inlet forward to the switching stage ---
  const inlet = new Group();
  addMesh(inlet, new Mesh(new BoxGeometry(1.5, 1.2, 0.8), m.plastic));
  for (let i = 0; i < 3; i += 1) {
    const pin = new Mesh(new BoxGeometry(0.12, 0.5, 0.12), m.metal);
    pin.position.set(-0.4 + i * 0.4, 0, 0.1);
    addMesh(inlet, pin);
  }
  place(inlet, 3.6, 6.4, FLOOR_Y + 0.6);

  const emi = new Group();
  const emiChoke = toroid(m, 0.6, 0.22);
  emi.add(emiChoke);
  const emiCap = capacitor(m, 0.3, 0.9);
  emiCap.position.set(1.1, 0, 0.2);
  emi.add(emiCap);
  place(emi, 3.6, 3.4);

  const rectifier = new Group();
  // The bridge itself is small; the bulk capacitors beside it are not.
  const bridge = new Mesh(new BoxGeometry(0.8, 0.5, 0.8), m.chip);
  bridge.position.set(-1.1, 0.25, 0);
  addMesh(rectifier, bridge);
  for (let i = 0; i < 2; i += 1) {
    const bulk = capacitor(m, 0.62, 2.8);
    bulk.position.set(0.3 + i * 1.5, 0, 0);
    rectifier.add(bulk);
  }
  place(rectifier, 3.0, 0.6);

  const pfc = new Group();
  pfc.add(toroid(m, 0.75, 0.3));
  const pfcSink = heatsink(m, 2.2, 1.6, 6);
  pfcSink.position.set(0, 0, -1.2);
  pfc.add(pfcSink);
  place(pfc, 3.6, -2.2);

  const switching = new Group();
  switching.add(heatsink(m, 2.6, 1.9, 7));
  place(switching, 3.6, -4.9);

  // --- Transformers, straddling the barrier ---
  const mainTransformer = transformer(m, 2.2, 2.2, 2.0);
  place(mainTransformer, 0, -4.9);

  const standby = transformer(m, 1.1, 1.1, 1.0);
  place(standby, 0, 1.6);

  // --- Secondary side: back up toward the output block ---
  const secondary = new Group();
  secondary.add(heatsink(m, 2.2, 1.5, 6));
  place(secondary, -3.6, -4.9);

  const filter = new Group();
  filter.add(toroid(m, 0.62, 0.26));
  for (let i = 0; i < 3; i += 1) {
    const cap = capacitor(m, 0.26, 1.1);
    cap.position.set(-0.9 + i * 0.9, 0, 1.1);
    filter.add(cap);
  }
  place(filter, -3.6, -1.6);

  const supervisor = new Group();
  supervisor.add(chip(m, 1.0, 0.7));
  place(supervisor, -3.6, 1.4);

  const output = new Group();
  addMesh(output, new Mesh(new BoxGeometry(2.4, 1.0, 1.2), m.plastic));
  place(output, -3.6, 4.6, FLOOR_Y + 0.5);

  // Output harness leaving the unit toward the motherboard.
  const outAnchor = DEFAULT_ANCHORS.psuOutput;
  const harnessCurve = new CatmullRomCurve3([
    new Vector3(outAnchor.x - 1, outAnchor.y, outAnchor.z),
    new Vector3(outAnchor.x - 3.5, outAnchor.y + 0.8, outAnchor.z - 1),
    new Vector3(DEFAULT_ANCHORS.atx24.x + 2.5, DEFAULT_ANCHORS.atx24.y + 1.4, DEFAULT_ANCHORS.atx24.z + 1),
    DEFAULT_ANCHORS.atx24.clone(),
  ]);
  const harness = new Mesh(new TubeGeometry(harnessCurve, 40, 0.4, 10, false), m.cable);
  harness.name = 'psu-harness';
  addMesh(root, harness);

  root.add(createWallSocket(m));

  let barrierTarget = 0.07;

  return {
    group: root,
    setVisible(visible: boolean) {
      root.visible = visible;
    },
    setBarrierActive(active: boolean) {
      barrierTarget = active ? 0.3 : 0.07;
    },
    update(dt: number) {
      const delta = barrierTarget - barrierMaterial.opacity;
      if (Math.abs(delta) > 0.002) {
        barrierMaterial.opacity += delta * Math.min(1, dt * 5);
      }
    },
    dispose() {
      root.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
      for (const material of Object.values(m) as Material[]) material.dispose();
      barrierMaterial.dispose();
      root.removeFromParent();
    },
  };
}

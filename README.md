# boot-anatomy

An interactive 3D explanation of everything that happens between pressing a
desktop's power button and reaching its login screen — 190 steps, animated as
signal flow across a motherboard, from mains AC arriving at the power supply to
`gdm` asking a person for a password.

**[Open the live version →](https://sserkanml.github.io/boot-anatomy/)**

[`docs/media/boot-anatomy.mp4`](docs/media/boot-anatomy.mp4) — a 15-second tour
of the chain.

---

## What it covers

The chain is flat: a section is a step in its own right, and the steps under it
play in sequence like any other. Twelve sections, 190 steps.

| Section | What it explains |
|---|---|
| PSU — Plugged In, Standby Up | Mains through the EMI filter, PFC, transformer and rectification to +5VSB |
| The Button Is Pressed | The one signal that is alive while the machine looks off |
| The EC Tells the PSU to Wake Up | Debounce, press duration, ACPI state, and finally PS_ON# |
| The Main Rails Come Up | Soft-start through to PWR_OK, and the deliberate delay before it |
| PWR_OK — The Voltages Are Stable | Multi-phase VRM, rail sequencing, latch-up, CPU RESET# |
| Firmware Takes Over | The reset vector, microcode, Boot Guard, the first fetch |
| coreboot — The Firmware Itself | Cache-as-RAM, CBFS, romstage, RAM training, the payload |
| Bootloader — Handover From Disk | GRUB from `_start` to the far jump that ends it |
| Kernel Init | `startup_32` through decompression, `start_kernel()`, SMP, to PID 1 |
| initramfs — Reaching the Real Disk | udev, LUKS, LVM, `switch_root`, and why any of it exists |
| systemd — PID 1 | Units, targets, socket activation, and why the order is a graph |
| Display Manager — The Login Screen | gdm, privilege separation, the four phases of PAM, the session |

### Reference dialogs

Six sections open a dialog with material the cards cannot carry:

- **PSU** — block diagram, waveforms, ATX pinouts, 31-term glossary
- **VRM** — block diagram, waveforms, 17-term glossary
- **EC** — block diagram, component inventory, 10-term glossary
- **PSU power-up** — block diagram of PS_ON# → PWR_OK
- **Kernel + initramfs** — 50-term glossary
- **systemd + login** — 22-term glossary

Every waveform is generated from the equation that governs it rather than drawn
by hand, so the shapes are honest — the capacitor ripple really is an exponential
decay chasing a rectified sine, and the four VRM phases really do fail to cancel
perfectly, because a real inductor current is asymmetric.

---

## The content is checked against real source

94 of the 190 steps name the function they describe, as a path and line number
in a real tree:

```
mm_core_init() — Memory On Demand
mm/mm_init.c:2706
```

Those paths were verified against actual checkouts, not recalled:

| Tree | Version |
|---|---|
| GRUB | `master` |
| coreboot | `main` |
| Linux | 7.2.0-rc6 |
| systemd | v262~devel |
| gdm | 51.beta |

Steps that describe a *region inside* a function deliberately carry no path — a
line number there would claim more precision than the explanation holds.

The whole chain is also written out as prose in
[`docs/boot-chain.md`](docs/boot-chain.md), generated from the same data, so it
stays in step with the app.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit + vite build -> dist/
npm run preview    # serve dist/ locally
npm run typecheck
```

The motherboard model is stored with Git LFS, so clone with it available:

```bash
git lfs install
git clone https://github.com/sserkanml/boot-anatomy.git
```

Without LFS the app still runs — it falls back to a placeholder board and says so
in the console.

---

## Layout

```
src/
  main.ts                    Composition root
  config/                    All content and tuning lives here
    bootSteps.ts             The chain assembly + the 12 section steps
    *Sequence.ts             One file per phase: coreboot, grub, kernel,
                             initramfs, systemd, login, vrm, ec, psu…
    *Reference.ts            Glossaries (FaqEntry[])
    *Waveforms.ts            Waveform stages
    anchors.ts               Named 3D points + model name hints
    constants.ts             Dimensions, palette, camera framing
  core/
    SceneManager.ts          Renderer, camera, controls, render loop
    Picker.ts                Click vs orbit-drag on the canvas
  state/
    BootSequence.ts          The state machine — no Three.js in here
    Emitter.ts               Typed event emitter
  scene/
    BoardScene.ts            Scene contents; applies a step to the 3D world
    AnchorRegistry.ts        Named points, re-derived from the GLB by mesh name
    monitor.ts, psu.ts, …    The props
  signals/
    SignalOrchestrator.ts    Turns steps into animated paths
  ui/                        Panels, timeline, dialogs, diagrams (no framework)
  i18n/                      EN/TR strings
```

Two rules hold the content together:

**Signal routes reference names, not coordinates.** A step says
`route: ['superio', 'atx24', 'psu']`. `AnchorRegistry` resolves those, and
re-derives them from the real model's meshes when it loads, so replacing the
model never touches the content files.

**Technical terms are never translated.** The bilingual type is
`{ en, tr }`, but a plain string passes through untouched — which is how
`PS_ON#`, `start_kernel()` and every source path stay identical in both
languages.

---

## Notes

**The model.** The source export is ~16 MB, three quarters of it 2K PNG
textures, and takes about eleven seconds to download. `scripts/compress-model.sh`
brings it to ~1 MB with no visible difference. Read the comment at the top before
running it — `gltf-transform optimize` would merge and rename meshes, and the
anchors are bound by mesh name.

**WebGL is required.** If the browser cannot get a context the app says so and
distinguishes the two causes, because they call for completely different fixes:
no WebGL at all, versus a GPU the browser has given up on. Chrome no longer falls
back to software rendering for WebGL, so a blocked driver, a VM or a remote
desktop session all end the same way.

**Accessibility.** The scene is labelled as a single image and the step card is a
live region, so the whole chain can be followed as text. Reduced-motion cuts the
camera flights rather than easing them.

---

## Credits

The motherboard model is a third-party asset and carries its own terms; check
its source before reusing it. No licence has been declared for this repository
yet — if you want the code reused, add one.

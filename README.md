# boot-anatomy

An interactive web experience that explains what happens inside a desktop PC
between pressing the power button and reaching the login screen, animated as
signal flow across a 3D motherboard scene.

**Stack:** Vite + TypeScript + Three.js. No framework, no state library.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit + vite build -> dist/
npm run preview    # serve the dist/ output locally
npm run typecheck
```

## Project layout

```
src/
  main.ts                     Composition root: wires everything together
  config/
    constants.ts              Dimensions, color palette, camera settings
    anchors.ts                Anchor coordinates + model name hints
    bootSteps.ts              >> CONTENT: the whole boot chain (10 steps)
    model.ts                  GLB loading settings
  core/
    SceneManager.ts           Renderer, camera, OrbitControls, render loop
    lighting.ts               Lighting rig
  state/
    Emitter.ts                Tiny type-safe event emitter
    BootSequence.ts           Boot chain state machine (no Three.js)
  scene/
    BoardScene.ts             Composition of the scene contents
    AnchorRegistry.ts         Named 3D points + binding them from the model
    AnchorLabels.ts           CSS2D labels
    placeholderBoard.ts       Stand-in motherboard used until a model arrives
    psu.ts                    Representative PSU (box + PBR + fan + cable)
    monitor.ts                Representative monitor (canvas-textured screen)
    loadMotherboard.ts        GLTFLoader integration, orientation and fitting
    environment.ts            Floor and grid
    textures.ts               Procedural PCB and glow textures
  signals/
    routing.ts                Turns anchor lists into PCB-trace-like routes
    SignalPath.ts             Glowing tube + flowing particles (custom shader)
    SignalOrchestrator.ts     Maps steps onto visual signals
  ui/
    UILayer.ts                Mounts the DOM interface and binds events
    InfoPanel.ts              Explanation card, bottom left
    Timeline.ts               Step list, top right
    ConsolePanel.ts           Fake console, bottom right
    Controls.ts               Power button + transport
    styles.css
```

### Architecture

One-way flow. `BootSequence` (the state machine) knows nothing about Three.js or
the DOM; the scene and the UI both listen to the same events:

```
BootSequence ──step:enter/progress/state──> BoardScene  -> SignalOrchestrator
             └──────────────────────────────> UILayer   -> InfoPanel / Timeline / Console
```

Signal paths reference **anchor names**, not coordinates
(`['superio', 'atx24', 'psu']`). When a real model is loaded, only
`AnchorRegistry` changes; `bootSteps.ts` stays untouched.

### Adding content

To add a step, append an object to the array in `src/config/bootSteps.ts` — the
timeline, info panel, console and signal paths all adapt on their own.

## The motherboard model

Place it at `public/models/motherboard.glb`. See
[public/models/README.md](public/models/README.md) for mesh naming, Draco, and
orientation/scale tuning.

Without a model the app runs fine on the placeholder board.

## Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start / pause |
| `→` `←` | Next / previous step |
| `R` | Start over |

Mouse: drag to orbit, scroll to zoom. The step list in the top right jumps
straight to any step.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes to Pages on every push to
`main`. On first setup, select **Settings → Pages → Source: GitHub Actions** in
the repository settings.

The site is served from `https://<user>.github.io/boot-anatomy/`. If the
repository has a different name, update `REPO_BASE` in `vite.config.ts` or set
the `BASE_PATH` environment variable in the workflow.

#!/usr/bin/env bash
# Compresses the motherboard model for the web.
#
# Run this after replacing public/models/motherboard.glb with a new export.
# A raw Sketchfab-style export is ~16 MB, almost all of it 2K PNG textures,
# and takes about eleven seconds to download. This brings it to ~1 MB.
#
# The three steps, in order:
#   resize   2048 textures are far more than this scene shows at its camera
#            distances; 1024 is indistinguishable here.
#   webp     PNG is lossless, which buys nothing for an albedo map.
#   meshopt  Geometry compression. Chosen over Draco because three ships the
#            decoder (three/examples/jsm/libs/meshopt_decoder.module.js) — no
#            extra WASM files to host on Pages. loadMotherboard.ts already
#            calls setMeshoptDecoder, so no code change is needed.
#
# Do NOT use `gltf-transform optimize`. Its preset runs `join` and `flatten`,
# which merge and rename nodes — and AnchorRegistry.bindFromModel() finds the
# CPU, RAM, M.2 and chipset by matching those names (MODEL_ANCHOR_HINTS in
# config/anchors.ts). Lose the names and every signal path falls back to its
# hand-placed default position.

set -euo pipefail

SRC="${1:-public/models/motherboard.glb}"
CLI="npx --yes @gltf-transform/cli@4.4.2"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cp "$SRC" "$WORK/in.glb"
$CLI resize   "$WORK/in.glb"      "$WORK/resized.glb" --width 1024 --height 1024
$CLI webp     "$WORK/resized.glb" "$WORK/webp.glb"    --quality 82
$CLI meshopt  "$WORK/webp.glb"    "$WORK/out.glb"     --level medium

cp "$WORK/out.glb" "$SRC"
echo "done: $(du -h "$SRC" | cut -f1)"
echo "Check the console for 'Anchors bound from the model: cpu, ram, m2, chipset'."

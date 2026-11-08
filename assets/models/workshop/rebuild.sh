#!/bin/sh
# Rebuild the dressed Workshop from source: textures, Blender scene, Cycles bake (day and night),
# denoise, pack for the web, Meshopt. Run from anywhere; outputs land in assets/models/workshop/workshop.
#
# Needs Blender 4.2 LTS, Python 3 with numpy, scipy, Pillow and shapely, glTF Transform 4, Node 22.15+ and three@0.160.0.
# Override any tool with BLENDER=..., PYTHON=..., GLTF_TRANSFORM=...
# BAKE_SIZE (1536), BAKE_SAMPLES (128) and BAKE_DEVICE (GPU or CPU) control the bake.
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
root=$(CDPATH= cd -- "$here/../../.." && pwd)
BLENDER=${BLENDER:-blender}; PY=${PYTHON:-python3}; GT=${GLTF_TRANSFORM:-gltf-transform}
work=${WORK:-"$here/.build"}
mkdir -p "$work"
node "$here/src/export-props.mjs" "$work/prop-geometry.json"
"$PY" "$root/assets/models/vending/src/strata_sections.py" "$root/assets/models/vending/src/strata_body.npz" "$work/strata_parts.json"
cp "$here/src/carzone.json" "$work/carzone.json"
"$PY" "$here/src/textures.py" "$work/tex" "$root/img" "$work/strata_parts.json"
"$BLENDER" -b --factory-startup --python-exit-code 1 --python "$here/src/scene.py" -- "$work"
cp "$work/workshop.blend" "$here/workshop.blend"
# Blender 4.2's Metal baker sometimes crashes on large atlases; if the GPU bake dies, repeat it on the CPU.
bake() { "$BLENDER" -b "$work/workshop.blend" --python-exit-code 1 --python "$here/src/bake.py" -- "$work" "${BAKE_SAMPLES:-128}" "${BAKE_SIZE:-1536}" "$1"; }
if [ "${BAKE_DEVICE:-GPU}" = CPU ]; then
  bake CPU
else
  bake GPU || { echo 'GPU bake failed; baking on the CPU instead'; bake CPU; }
fi
"$BLENDER" -b --factory-startup --python-exit-code 1 --python "$here/src/denoise.py" -- "$work"
"$PY" "$here/src/pack.py" "$work" "$here/workshop"
"$GT" optimize "$work/dress_raw.glb" "$here/workshop/dress.glb" --compress meshopt --texture-compress false \
  --simplify false --instance false --join false --flatten false --palette false --prune-attributes false
printf 'Workshop rebuilt into %s/workshop\n' "$here"

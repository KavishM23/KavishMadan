#!/bin/sh
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
temp=$(mktemp -d)
trap 'rm -rf "$temp"' EXIT
"${BLENDER:-blender}" -b -t "${BAKE_THREADS:-6}" --python-exit-code 1 --python "$here/gate.py" -- "$temp/gate.glb" "${BAKE_SIZE:-1280}"
"${GLTF_TRANSFORM:-gltf-transform}" optimize "$temp/gate.glb" "$here/../moroccan-gate.glb" \
  --compress meshopt --texture-compress webp --texture-size 1280 \
  --simplify false --instance false --join false --flatten false --palette false \
  --prune-attributes false

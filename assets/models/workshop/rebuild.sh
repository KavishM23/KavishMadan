#!/bin/sh
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
root=$(CDPATH= cd -- "$here/../../.." && pwd)
"${BLENDER:-blender}" -b -t "${BAKE_THREADS:-8}" --python-exit-code 1 --python "$here/src/build.py" -- "${BAKE_SIZE:-1024}" "${BAKE_SAMPLES:-64}"
python3 "$here/src/pack.py"
for tier in detail detail-mobile; do
  "${GLTF_TRANSFORM:-gltf-transform}" optimize "$here/workshop/$tier-raw.glb" "$here/workshop/$tier.glb" \
    --compress meshopt --texture-compress webp --texture-size 1024 \
    --simplify false --instance false --join true --flatten true --palette false
  rm "$here/workshop/$tier-raw.glb"
done
printf 'Workshop assets rebuilt in %s/workshop\n' "$here"

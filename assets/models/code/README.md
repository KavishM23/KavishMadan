# Code stairwell

A baked Blender scene for the Code page, built by the same method as the workshop.

- `world.glb`: stair, shaft, alcoves and lobby, about 88,000 triangles.
- `movers.glb`: the three physical screens.
- `drone.glb`: the representative quadcopter from `vending/src/quadcopter.py`, without its display base.
- `lm-*.webp`: six lightmaps at 1280, or 1024 for the lobby, with smaller copies for phones. Blender 4.2's GPU baker crashed above 1280 on the build Mac.
- Shared textures for brushed metal, enamel, timber, brick and boards are read from `vending/workshop/`.

## Rebuilding

1. Write `code-layout.js` out as `layout.json`.
2. `python src/textures.py tex ../../../img`
3. `blender -b --python src/world.py -- layout.json scene tex/code_prints.json`
4. `blender -b --python src/bake.py -- scene layout.json 200`
5. Denoise each `.exr` with `vending/src/workshop/denoise.py`, run `src/pack.py`, then compress `world.glb` with meshopt and quantisation. Keep `movers.glb` unquantised so its positions survive.

`src/blend/stairwell.blend` is the scene before baking. The lobby's gate is drawn live by `moroccan-gate.js`.

## Real and invented

Real: the screens, the match formula on the chalkboard, the ten realm names on the cartridges, and the 01 to 03 project order. Everything else in the alcoves is set dressing that suits the project, not a record of it.

# Code staircase sets

Three small sets and the drone for the staircase on the Code page.

- `set-lastbite.glb`, `set-tutortime.glb`, `set-kungfooled.glb`: built by `src/sets.py` with baked ambient shadow. Each has a `mover_screen` plane, and `code-journey.js` puts the real screen on it.
- `drone.glb`: the representative quadcopter from `vending/src/quadcopter.py`, without its display base.

To rebuild a set, run `src/textures.py` for the print atlas, then `blender -b --python src/sets.py -- OUT prints.json KEY TEXDIR SHAREDTEX`. Compress with `gltf-transform optimize`, and pass `--prune-attributes false`, or the screens lose their texture coordinates.

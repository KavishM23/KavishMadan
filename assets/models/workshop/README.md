# The dressed Workshop

The home page's room, built in Blender with day and night light baked into textures, the same way as the Builds vending room. The MP4/4 and everything you can click stay live on the page, so they can move.

## Rebuild

From the repository root:

```sh
assets/models/workshop/rebuild.sh
```

It needs Blender 4.2 LTS, Python 3 with numpy, scipy, Pillow and shapely, and glTF Transform 4. If they are not on your PATH, name them in the same command:

```sh
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender PYTHON=python3 GLTF_TRANSFORM=gltf-transform assets/models/workshop/rebuild.sh
```

`BAKE_SIZE` (2048), `BAKE_SAMPLES` (256) and `BAKE_DEVICE` (GPU) change the bake. Blender 4.2's Metal baker sometimes crashes; when it does, the script repeats the bake on the CPU. A quick look at 1024 and 32 samples takes about a minute. Scratch files go to `.build/`, which is not committed.

The labels and sheets in the print atlas use macOS system fonts. On another system Pillow falls back to its default font.

## What is where

| File | What it is |
|---|---|
| `src/scene.py` | Builds everything and saves the scene. Stops the build if anything taller than floor tape sits in the car's footprint or drive path (`src/carzone.json`). |
| `src/room.py` | Window recess, steel frame, putty and sealant, oak sill, skirting, conduit, sockets, extinguisher, pinboard. Also the bake-only planes that match the page's floor and walls. |
| `src/bench.py` | The left bench, pegboard, vise, lamp, stool, dustpan, rolled drawings and sheet stock. |
| `src/carkit.py` | Tool chest, setup sheet, pit board, trolley jack, floor tape, shop vacuum. |
| `src/shelf.py` | The shelving frame and the stock between the live cases and binders. |
| `src/lights.py` | Day and night light rigs. |
| `src/bake.py` | Bakes both themes, merges plain materials into three vertex-coloured ones, exports the GLB. |
| `src/textures.py`, `src/pack.py`, `src/denoise.py` | Generated textures and the print atlas; WebP encoding; Open Image Denoise. |
| `src/preview.py` | Cycles renders from the page's camera angles, for checking layout before a bake. |
| `workshop.blend` | The built scene before baking, with parts merged by material. The Python files are the real source; edit those and rebuild. |
| `workshop/` | What the page loads: `dress.glb`, `manifest.json`, lightmaps for desktop and phones, textures. |

## Real and invented

Real: the framed Strata photo, the six pinboard prints (sketch, CAD, laser bed, printed tyre, wiring, prototype), the rib outlines of the half-built chassis, the ribs stacked beside it, the rib in the vise, and the cut-out shapes in the red acrylic sheet. All come from the Strata CAD and the photos in `img/`.

Invented set dressing: every tool, label, bin, box, the setup sheet, the pit board, the tape marks, the "KESSLER TEST" cradle piece and the drawing numbered "KM / DRG 07". The setup sheet, pit board and assembly-sheet notes are props, not records.

## On the page

`workshop-dress.js` loads the GLB, the textures and the lightmaps. Baked surfaces ignore live lights; metals still pick up reflections from the room. The page's floor and walls keep their own painted textures and take the matching Blender lightmaps. `LIGHT` in `workshop-dress.js` sets the overall level without a rebake.

If the dressing fails to load, `workshop.js` builds the older procedural bench, stool, window and shelving, and every link still works.

The MP4/4 is not in the bake. It carries its own soft contact shadow, drawn from its geometry, so it leaves nothing behind when it drives off.

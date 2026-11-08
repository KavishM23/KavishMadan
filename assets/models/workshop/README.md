# The dressed Workshop

The home page is a Blender diorama with separate day and night Cycles bakes. The room and fixed hardware use lightmaps. The interactive props use irradiance baked from the same rig at the vertices of their browser geometry. Their original textures and animation pivots stay live. The MP4/4 uses theme-specific room reflections and live light.

## Rebuild

From the repository root:

```sh
assets/models/workshop/rebuild.sh
```

It needs Blender 4.2 LTS, Python 3 with NumPy, SciPy, Pillow and Shapely, glTF Transform 4, and Node 22.15 or later. Install `three@0.160.0` in a local tool directory and set `WORKSHOP_THREE` to its `node_modules/three` folder. If the executables are outside PATH, pass them as well:

```sh
WORKSHOP_THREE=/path/to/node_modules/three \
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender \
PYTHON=python3 GLTF_TRANSFORM=gltf-transform assets/models/workshop/rebuild.sh
```

`BAKE_SIZE` (1536), `BAKE_SAMPLES` (128) and `BAKE_DEVICE` (GPU) change the bake. Blender 4.2's Metal baker sometimes crashes; when it does, the script repeats the bake on the CPU. The checked-in atlases use `BAKE_SIZE=1024 BAKE_SAMPLES=32 BAKE_DEVICE=CPU` with Open Image Denoise. The larger default is available for a higher-resolution rebuild. Scratch files go to `.build/`, which is not committed.

The labels and sheets in the print atlas use macOS system fonts. On another system Pillow falls back to its default font.

## What is where

| File | What it is |
|---|---|
| `src/scene.py` | Builds everything and saves the scene. Stops the build if anything taller than floor tape sits in the car's footprint or drive path (`src/carzone.json`). |
| `src/room.py` | Window recess, steel frame, putty and sealant, oak sill, skirting, conduit, sockets, extinguisher, pinboard. Also the bake-only planes that match the page's floor and walls. |
| `src/bench.py` | The left bench, pegboard, vise, lamp, stool, dustpan, rolled drawings and sheet stock. |
| `src/carkit.py` | Tool chest, setup sheet, pit board, trolley jack, floor tape, shop vacuum. |
| `src/shelf.py` | The shelving frame and the stock between the live cases and binders. |
| `src/details.py` | The KM sign, suspended strip fixture, guitar stand, port plates and native Blender pieces that mount to the crate lid, trophy and tyre. |
| `src/export-props.mjs` and `src/prop_bake.py` | Build the page's rest geometry for Cycles, then write compact day/night vertex lighting keyed to its topology. No second copy of the prop geometry is downloaded. |
| `src/lights.py` | Day and night light rigs. |
| `src/bake.py` | Bakes both themes, merges plain materials into three vertex-coloured ones, exports the GLB. |
| `src/textures.py`, `src/pack.py`, `src/denoise.py` | Generated textures and the print atlas; WebP encoding; Open Image Denoise. |
| `src/preview.py` | Cycles renders from the page's camera angles, for checking layout before a bake. |
| `workshop.blend` | The built scene before baking, with parts merged by material. The Python files are the real source; edit those and rebuild. |
| `workshop/` | What the page loads: `dress.glb`, `manifest.json`, lightmaps for desktop and phones, tiling materials and the compressed day/night prop lighting. |

## Real and invented

Real: the framed Strata photo, the six pinboard prints (sketch, CAD, laser bed, printed tyre, wiring, prototype), the rib outlines of the half-built chassis, the ribs stacked beside it, the rib in the vise, and the cut-out shapes in the red acrylic sheet. All come from the Strata CAD and the photos in `img/`.

Invented set dressing: every tool, label, bin, box, the setup sheet, the pit board, the tape marks, the "KESSLER TEST" cradle piece the drawing numbered "KM / DRG 07", the KM sign, and the added workshop hardware. The setup sheet, pit board and assembly-sheet notes are props, not records.

## On the page

`workshop-dress.js` loads the GLB, the textures and the lightmaps. Baked surfaces ignore live lights; metals still pick up reflections from the room. The floor and walls keep their painted textures with matching Blender lightmaps. Moving prop parts do not cast their rest shadows into the room bake. They blend toward live lighting during movement. The car leaves with its own contact shadow and uses a separate environment capture for each theme. Day and night swaps wait for the matching maps.

The emissive layer contains only the real fixtures and laptop display. Desktop composites its blur from one-sixth-resolution buffers. Phones use the emissive surfaces alone. Ambient updates are throttled and stop off the homepage, in a hidden tab, and under reduced motion.

If the day dressing or its prop lighting fails to load, `workshop.js` builds the older procedural bench, stool, window and shelving, and every link still works. An unavailable night bake uses a dimmed day atlas and the live night rig.

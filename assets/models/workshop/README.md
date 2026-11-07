# Workshop homepage asset

`workshop.blend` is the packed, editable Blender 4.2 LTS source. The source script
in `src/build.py` builds the static room bake surfaces and new joinery, bakes
day and night lighting in Cycles, and exports the fixed detail. The vending
room's `src/lib.py` supplies its bevelled
mesh and material helpers.

From the repository root, run:

```sh
assets/models/workshop/rebuild.sh
```

Requires Blender 4.2, Python with Pillow, and glTF Transform 4. The defaults
are 1024 px, 64 samples, and eight CPU threads. Set `BAKE_SIZE`,
`BAKE_SAMPLES`, or `BAKE_THREADS` to change them. If the executables are not on
your PATH, set `BLENDER` and `GLTF_TRANSFORM` to their full paths in the same
command. The build produces eight
WebP lightmaps, half-resolution phone variants, and two Meshopt GLBs. The
desktop and phone GLBs share the same room coordinates; the phone file omits
tiny hook and screw meshes.

The four main room surfaces keep their existing plaster and concrete detail
maps in Three.js. The Blender maps supply Cycles daylight, dusk, bounced
light, and fixed contact shadows. The additional GLB provides real window
returns, baseboards, bench joinery, drawer runners, peg hooks, shelf supports,
vise and lamp hardware, and Strata offcuts. Their materials restore metalness
after the bake workaround. Interactive props and the MP4/4 stay separate.
They are absent from the static bake, so their shadows cannot linger when
they move.

If the detail GLB fails, the original room remains usable. If a lightmap
fails, the older lightmap or runtime night treatment remains available.

The floor and painted walls remain the site's existing Three.js finish planes,
which receive the Blender lightmaps. The MP4/4 and interactive props retain
their existing moving rigs and runtime lighting; they are not part of the
editable Blender room file.

To view the site locally, run `python3 assets/models/workshop/preview.py` from
the repository root and open `http://127.0.0.1:8765/#home`. The preview serves
only public site assets on localhost.

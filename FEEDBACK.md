# Portfolio design decisions

## 3 November 2026 — palette and hero feature

1. **Whole site — approved direction:** Atlantic & Ochre. The user accepted the rich earth and blue colour scheme.
2. **Hero — required preservation:** Keep the existing interactive 3D object cluster emerging from the torn top of the portrait, as shown in the user's screenshot. Preserve the research book, tyre, satellite, tablet, guitar pick and supporting cloud, their dimensional materials, animation, hover/tap behaviour and linked actions. Keep the torn white portrait outline and the layered relationship between the portrait and objects.
3. **Hero — concept clarification:** The simplified orbital diagram in the colour study was a palette illustration. It must not replace the existing 3D object cluster in the portfolio.
4. **Navigation — requested fix remains:** Reposition and improve the navigation so it does not cover the 3D objects. The screenshot identifies the object/portrait feature to preserve; it does not approve the overlapping menu.
5. **Implementation status:** Applied to index.html: Atlantic & Ochre colours across sections, paper transitions, diagrams and decorative 3D materials; stable top navigation with solid backgrounds and page links collapsed below 960 px. The original 3D object positions, geometry and pointer actions are preserved. Source backup: versions/pre-atlantic-ochre/index.html. Desktop, side-panel and phone layouts checked in the local browser; the 3D research book opens its paper viewer.

Later explicit user decisions take precedence over earlier recommendations in research/STYLE-DIRECTION.md.

## 3 November 2026 — interaction and About Me round

1. **Palette correction:** The blue is approved; the yellow/ochre accent is rejected. Mineral blue is the provisional accent while the user compares copper, mineral, rose and sage alternatives. This overrides the earlier approval of Atlantic & Ochre.
2. **About Me:** The user wants a richer, more dimensional composition. Added a detailed guitar, sketchbook with pencil and orbital model, selectable object details, drag/arrow-key rotation and reset. Existing biography, awards link and timeline remain.
3. **Additional 3D:** Added a quadcopter on Code and a trophy on Awards. All scenes share the existing hero renderer and one canvas. The portrait cluster and research-book action are retained.
4. **Cursor:** Added velocity-dependent shape/stretch, a trailing detail, magnetic header controls, labelled link/media/model states, rotation/pressed states, a reveal-lens reticle and blueprint crosshairs. Native cursor remains available for touch, text fields and when the custom cursor is hidden.
5. **Minh Pham reference:** Visually inspected the reference's cursor mask revealing alternate hero copy. Adapted that principle to About Me's alternate text/image layer and the Strata photo-to-sketch reveal. Buttons provide the same reveals on touch and keyboard.
6. **Validation:** Checked desktop, 820 px and 390 px layouts; selected and dragged the About models; opened the original 3D research book; exercised both reveal buttons and the pointer lens; verified direct loading of Awards. Fixed stale canvas frames between sections and renderer sizing when loading a non-home route. No browser error logs in the checked flow. Real-device touch and Safari were not separately tested.
7. **Backup:** versions/pre-interaction-round/index.html contains the prior page source.

## 3 November 2026 — Code spiral staircase

1. **Requested composition:** Each main Code project occupies a landing on a physical spiral staircase. Scrolling descends around the staircase; the drone follows its outer edge and settles near the final landing. LastBite and TutorTime are the two main projects.
2. **Implementation:** Added a real 3D helix with treads, central column, rails, landings and project screens. The camera follows a reversible scroll path with pauses at both project displays. Screens preserve screenshot proportions. Landing links jump to the same scroll positions.
3. **Content preservation:** The final “The code behind the builds” section and its links are unchanged. Moved the longer LastBite and TutorTime narratives into their existing case-study viewers; retained the screenshots and technical details.
4. **Fallbacks:** Short screens and reduced-motion preferences use readable project sections with screenshots and working case studies. A failed WebGL initialization leaves that same readable layout. Other site scenes continue to share one canvas.
5. **Validation:** Checked desktop and 390 px layouts, both project anchors, both case-study dialogs with three story paragraphs each, main navigation returning to Code, the final build links and the 844×480 fallback. Browser error logs were empty in the checked flow. Reduced-motion branching was checked in source; real-device Safari/touch testing was not performed.
6. **Backup:** versions/pre-spiral-code/ contains the prior source files.

## 3 November 2026 — image clarity and narrow-window fit

1. **Requested adjustment:** Improve image presentation and make the composition slightly smaller and farther right outside full-screen views.
2. **Framing:** At 621–1100 px, the portrait is about 10% smaller and its centre shifts right to 53%. Its 3D objects follow the same anchor. Phone portrait width is 92vw with a 52% anchor. Speech bubbles are constrained within the window, and the Latest image badge stays inside the left edge.
3. **Code:** The compact staircase viewport shifts right; camera distance now accounts for the viewport aspect ratio so screens and the drone fit in a tall, narrow pane. Phone framing is slightly smaller too.
4. **Image clarity:** Corrected static image width/height metadata from the actual files. Screenshots keep native proportions and avoid unnecessary enlargement in the case viewer. WebGL textures use the available anisotropic filtering, and phone rendering resolution is increased modestly. Original image pixels are preserved.
5. **Viewing:** Process photos, the main Strata photo and case-study screenshots can open in a native full-size image dialog. Escape closes it and returns focus; closing an image opened from a case study leaves that case study open.
6. **Validation:** Visually checked 820×900 and 390×844 layouts and exercised both photo and nested screenshot viewing. Original portrait objects remained aligned. Backup: versions/pre-image-fit/.

## 3 November 2026 — compact cursor icons

1. Replace the large labelled Open/Rotate cursor surfaces with compact icons: a pointing hand for links and model actions, and a flat circular arrow for rotation.
2. Implemented a 24×28 px pointing hand and a 28 px circular arrow. Image viewing uses a small magnifier; the reveal reticle and blueprint crosshair are smaller too. Removed the visible text labels and active-state trailing dots. The pointer tip stays aligned with the actual click position.
3. Checked hand and rotation states in the browser; the rotation state measures 28 px and the cursor contains no text-label elements. Browser error logs were empty. Backup: versions/pre-compact-cursor/.

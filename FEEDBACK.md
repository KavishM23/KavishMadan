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

## 3 November 2026 — full-screen proportions, paper-plane cursor, model detail

1. **Full screen:** The head now sizes from the window height as well as its width. The torn edge sits at half the hero height and the face fills the rest, cropped near the nose like the reference. The 3D cluster is drawn about as wide as the head opening (0.8 of the old scale above 620 px; phones keep the old scale). The 621–1100 px right shift is kept.
2. **Removed:** the "Stanford, do you copy?" bubble.
3. **Cursor:** A cut-paper plane replaces the default dot. Its nose is the click point. It steers toward the direction of travel, banks on turns, leaves a fading dashed contrail and returns to a normal arrow angle when idle. Clicking throws paper confetti. The link hand pops in with a small wave. Reduced motion keeps a still plane with no trail or confetti.
4. **Model detail:** Tyre: raised sidewall lettering, rim rivets, valve stem. Book: brass corner guards, index tabs, a paper-clipped sheet. Tablet: LinkedIn-style profile screen, top buttons, speaker holes. Satellite: thrusters, star tracker, panel hinges. Pick: celluloid swirl finish.
5. **Fallback labels** wait 3 s before showing, so they no longer flash over the name while the 3D loads.
6. Checked at 1180×775, 1470×840, 1920×1080, 2560×1300, 900×1100 and 390×844. Code and Awards still load, no console errors. Backup: versions/pre-fullscreen-fit/.

## 3 November 2026 — follow-up: whole head, simpler cursor

1. **Whole head in full screen:** The user wants the full head visible, not cropped at the nose. The torn edge now sits at 45% of the hero height and the head is sized so the chin and collar sit just inside the bottom edge. The cluster is 0.86 of the original scale above 620 px.
2. **Cursor:** The paper plane, contrail and confetti were too much. The normal cursor is a small dot inside a softly trailing circle that tightens on click. Over links and 3D objects it becomes the small hand, which pops in with a wave (blue over objects). Magnifier, rotate, reveal and crosshair states are unchanged.
3. Checked at 1180×775, 1470×840, 1920×1080 and 390×844; no console errors.

## 3 November 2026 — sharper portrait and Trevor-style intro

1. **Portrait:** The only source is 429×595 (the deck has the same file). It was upscaled 4× with Real-ESRGAN x4plus run locally: the architecture is re-implemented in the build script and the weights load weights-only. 22% of a plain Lanczos upscale is blended back so the skin keeps its texture. The paper border, tear and shadow were rebuilt at the new size: img/kavish-head4.webp is the torn head and img/kavish-full.webp is the uncut head for the intro. Constants: aspect 2247/1800, tear top 0.0978, opening centre 0.4975, chin fraction 0.62.
2. **Intro (fresh load of the home page only):** Navy screen. The uncut head rises from below with a slight overshoot and tilt. The top of the head folds down over the face like a sticker being peeled, then rips away and flies off. The 3D objects pop out of the opening, the name slides up word by word, and the nav, Latest badge and socials ease in. It runs about 2.6 s.
3. **Skipping:** Any scroll, click, key or touch finishes the intro immediately. It does not play with reduced motion, when the page opens on another section or in a background tab, or if the images fail to load within 4 s. A 7 s fail-safe clears it in any case.

## 3 November 2026 — brand pill and smoother intro

1. **Brand pill:** The small "Kavish Madan" in the header is hidden while the giant name is on screen. It fades in once the name has scrolled up under the header, and always shows on Code and Awards.
2. **Intro jitter:** The name's paper-grain texture is painted with background-clip:text. Sliding the words made the browser repaint that huge texture on every frame. Each word now carries its own texture and slides as one composited layer. The peel canvas only covers the fold area (about a third of the pixels), with a lighter shadow. The rise and fly-off are each a single continuous curve with no mid-way kink, the fade is layered separately, and the uncut head is decoded before it starts moving.

## 3 November 2026 — trophy cabinet and background music

1. **Awards → trophy cabinet (user's choice over a rocket launch or a medal orbit):** The honours grid becomes a scroll-driven 3D display cabinet. It has a walnut frame, a felt back wall with a light pool per bay, brass mullions, glass panes with light streaks, marble plinths with engraved brass plaques, and a spotlight that follows the camera.
2. **One object per honour:** a framed certificate (BMO), four UKMT gold medals, a "112/125" score board, a gold cup (Rank 1), a glass crystal (25/25), a hanging gold medal (ChallengeME), a bronze cup (ACSL), a laptop with LastBite and a "Top 7" rosette, a waving YYGS pennant and a DofE silver medal.
3. **Scroll and controls:** Scrolling glides bay to bay, holding at each one. The card on the left shows the honour and a counter, and the dots jump to any bay. The text is read from the existing grid (awards-cabinet.js), so the grid stays the single source and is the fallback for reduced motion, screens under 560 px tall or no WebGL.
4. **Music:** The user asked for berlioz (the jazz-house artist), "jazz is for ordinary people". It's copyrighted, so it isn't hosted on the site. It plays through YouTube's official embed of the artist's own upload (video CJkGGslFneE, youtube-nocookie host). The user chose this over a licensed sound-alike or a Spotify card.
5. **Switch:** The header switch turns it on and off. While it plays, YouTube's player stays visible as a 200×200 "now playing" card (YouTube's minimum size). Nothing loads from YouTube until the switch is pressed.

## 3 November 2026 — Spotify player and playlist (replaces the YouTube card)

1. **Why:** The user wanted a smaller footprint than YouTube's 200×200 minimum. The music is now Spotify's compact embed (80 px tall) inside a 320 px card. The header switch plays and pauses it through Spotify's embed API.
2. **Playlist:** The card has a collapsible list: Lacrimosa (Mozart, Jordi Savall), Smooth Operator (Sade), jazz is for ordinary people (berlioz, the default), sea of cloud (Nujabes), Hells Bells (AC/DC), Rock Your Body (instrumental, Starlite Karaoke, since Spotify has no official instrumental) and Father Figure (George Michael). It moves to the next song when one ends.
3. **Limits:** Peso (A$AP Rocky), Summer Wind (Frank Sinatra, studio) and No Me Platiques Más (Luis Miguel) complete the 10. Visitors not signed in to Spotify hear 30-second previews. Nothing loads from Spotify until the switch is pressed.

## 3 November 2026 — smooth, committed scrolling

1. **Reference check:** trevornoah.com uses Lenis smooth scrolling, which eases toward the scroll target (the slightly delayed feel), and its hero peel is tied to scroll. The user wants transitions never left half-done.
2. **Smooth scrolling:** Lenis 1.1.13 from unpkg, driven by the GSAP ticker so ScrollTrigger stays in sync (smooth-scroll.js). It pauses whenever an overlay locks the page. The menu, research book, case studies, image viewer and playlist scroll natively (data-lenis-prevent). Nav links, page switches and cabinet dots scroll through it.
3. **Commit rule:** About 0.18 s after scrolling stops, if the page is resting inside a transition it eases on to the end in the direction you were moving, or back if you were scrolling up. Transitions are each paper tear, each move between cabinet bays and each move between staircase landings. Resting points (the bays, the landings, and the space between tears) never snap.
4. Off with reduced motion. Touch keeps native scrolling, and the commit rule applies once momentum ends.

## 3 November 2026 — transitions wait for a deliberate scroll

1. **Feedback:** The page should not slide into a transition on the slightest scroll. It should hold until you scroll on deliberately, then play the whole move.
2. **Gates:** Each transition is now a gate on the wheel. Smooth scrolling glides you up to its edge and stops. Pushing past the edge gives up to 22 px of resistance and settles back if you let go. About 120 px of further scrolling (one firm mouse-wheel notch or a short trackpad swipe) commits; it was 190 px before the user asked for it to be a little easier, and the transition plays as one locked, eased move of 0.7–1.35 s.
3. **Momentum:** Trackpad momentum from the same gesture can't open the next gate; that needs a fresh scroll after a 0.22 s pause. Scrolling the other way at an edge cancels.
4. **Other input:** Touch, keys and the scrollbar stay native and finish any transition they stop inside. Overlays and pinch-zoom are untouched.

## 3 November 2026 — breathing room and 3D quality

1. **Less text:** Build stories fold behind "The full story" (nothing deleted). Strata's process notes appear on hover on desktop and stay visible on touch. More builds cards and About are cut to one or two lines, and the duplicate Awards card in About is removed. Section and row spacing are increased.
2. **3D accents (two only):** a quadcopter under the quad stats and the orbit model under the Kessler stats, hidden below 900 px.
3. **Quality:** Full pixel ratio, capped at 2, on every device. Guitar strings are thin cylinders instead of 1 px lines. The sketchbook has smoother rings and a pencil with a wooden tip, lead and eraser. The drone has twisted two-blade props, prop guards, motor caps, a battery and status LEDs. Backup: versions/pre-declutter/.

## 3 November 2026 — 3D objects never cut off

1. **Bug:** The quadcopter accent was clipped by its small stage, especially when dragged.
2. **Fix:** Every small 3D stage (the quadcopter and orbit accents, the Awards trophy, the About collection) now fits its camera each frame. It projects the object's bounds and backs the camera off until they sit inside about 84% of the frame. It never moves closer than the authored distance.
3. **Checked:** At five drag angles, with pitch, on desktop and phone, the tightest projected extent stays 0.61–0.81 of the frame. The staircase and cabinet scenes have their own cameras and were not affected.

## 3 November 2026 — continuous intro and deliberate, complete transitions

1. **Latest source:** GitHub main at b5c7955 matched the clean local checkout before this round.
2. **Portrait handoff:** Both portraits are decoded before the animation. The complete scalp is painted before revealing the torn portrait and hiding the full portrait in the same frame. The full image remains available to the canvas through the peel. Section intro styles and its ScrollTrigger now explicitly target `section.intro`, so the animation class on `<html>` cannot add padding to the document or restyle other headings.
3. **Timing:** Rise 1.2 s, a short pause, peel 1.35 s (previously 0.72 s), then a 1.05 s fly-off. The flap detaches later in the peel, with a delayed fade. The intro finishes in about 3.8 s once the portraits are ready. Click, scroll, key and touch still skip; resize also finishes safely. The load fail-safe is now 10 s to allow the longer sequence on a cold image load.
4. **Confirmed preference:** The user chose a firm, deliberate swipe. The wheel threshold is 180 px, with no partial-tear nudge. Small gestures hold at the finished edge; committing plays the full transition in 0.95–1.65 s. Momentum cannot spill into a second gate. Native input still settles any unfinished transition.
5. **Navigation and overlays:** Page swaps refresh Lenis measurements and clear old gesture state. Navigation and modal locks cancel stale completion callbacks, preventing a previous animation from blocking later scrolling. Transition endpoints clamp to the document's reachable end.
6. **Validation:** Eleven deterministic scroll-controller regression cases, inline JavaScript syntax checks, and browser checks of portrait continuity and real wheel input. Source backup: `versions/pre-smooth-tear/`. Preview: `research/opening-animation-preview.gif`.

## 3 November 2026 — subtle page grain and handwritten research pages

1. **Texture:** One static, seamless 256 px SVG tile adds fine monochrome grain and sparse paper fibres across every page. It blends at 16% in soft-light mode and ignores pointer events. The blue and earth palette is retained; printing omits the texture.
2. **Research book:** The page block, five loose leaves and inside cover use three varied procedural textures: broken handwritten ink strokes, underlines, an orbital sketch and a small graph, with no words. The leaves sit above the block and have a slight bow. Hover/focus opens the cover farther to expose the marks; clicking still opens the research viewer.
3. **3D quality:** All views retain the shared antialiased WebGL renderer. Ordinary-density displays gain budgeted supersampling up to 1.5×; existing native detail up to 2× is preserved. The book, tyre and satellite bump relief is scaled to the models rather than exaggerated. About and accent models share a subtle surface roughness map, with smoother lens, globe and trophy curves.
4. **Checks:** Inline and external script syntax, desktop previews of Builds, Code and Awards, the open book, and the narrow About composition. Backup: `versions/pre-paper-and-book/`.

## 3 November 2026 — measured rendering optimization

1. **Rendering workload:** Static details are merged by compatible material within their existing groups. Animated groups, transparent parts, instanced meshes and explicitly separate parts keep their own objects. The staircase's 90 treads and 31 posts use three instanced draws. No geometry detail is removed.
2. **Measured samples:** At 1280×720 and 2× density, the staircase fell from 143 to 31 draw calls, the About collection from 94 to 25, and the hero from 204 to about 136 on average, including its less frequent shadow pass. About's triangle count stayed at 52,176. These are rendering-work reductions, not guaranteed FPS multipliers; normal frame intervals on this preview were already near 16.7 ms for the hero and Code.
3. **Camera and DOM work:** Each model's conservative local bounds are computed once; fitting transforms those cached boxes rather than walking the whole mesh hierarchy every frame. The camera backs off immediately if a sudden resize or rotation needs room, then eases back in. Scene rectangles are read before rendering writes. Hidden hero labels are not repositioned every frame, and pointer picking runs at most once per rendered frame. Staircase text updates only when scroll progress changes.
4. **Loop lifecycle:** One cancellable loop targets 60 fps. Generation tokens invalidate stale frames on stop/start and on the timer fallback, preventing duplicate animation chains. Offscreen scenes, hidden tabs and open overlays stop 3D work; overlays retain the last rendered image. Existing cursor and scrolling behavior are preserved.
5. **Quality under load:** The previous forced supersampling is removed. Native density is retained up to 2× with a six-megapixel viewport budget, then reduced gradually only after sustained slow frames. A sustained recovery raises it again. Shadows refresh at 30 Hz while models remain at 60 Hz. Parallel shader preparation runs during idle time where supported.
6. **Validation:** Twenty controller and scrolling regression tests. An integration check with the site's actual Three.js 0.160.0 preserved merged geometry and tested 120 model/viewport/angle combinations; the tightest projected extent was 0.836 of the frame. Desktop route, book, overlay and narrow-layout checks supplement these tests. Backup: `versions/pre-performance/`; optional measurements use `?profile=1`.

## 3 November 2026 — object clearance

The research book waits for the neighbouring tyre, satellite, tablet and pick to move clear before opening; they return after it closes. The expanded group scales down on narrow screens to stay inside the viewport, and the research label avoids the navigation. The About objects have more room between them. Checked the book and About scene visually, reviewed the staircase and cabinet layouts, and ran the scrolling/rendering regressions and 120 camera-fit cases.

## 3 November 2026 — more detailed trophy cabinet

The cabinet now has recessed, softly lit backing panels, layered walnut and brass mouldings, shelf edges and light housings. Each award sits on a stepped veined-marble plinth with a framed plaque, small fasteners and a soft contact shadow. Awards still turn but stay seated on their stands. Repeated static details are batched to preserve the earlier performance work. Desktop and narrow previews, award navigation and 20 regression tests passed.

## 3 November 2026 — repair cabinet display artifacts

The newly added recessed backing intersected the laptop lid as it turned; its proportions and hinge placement now keep it in front of the panel. Moved the laptop image clear of the frame, raised the rosette centre above its petals, replaced the disconnected gold and bronze cup handles with attached curves, and removed the dark stripe crossing the maths score. Checked the photographed bays, medals, crystal and a narrow-screen laptop view; all 20 controller and scroll tests pass.

## 4 November 2026 — Kung Fooled and GitHub links

1. **Third landing:** The Code staircase now has LastBite, TutorTime and Kung Fooled, at q .2, .5 and .8, with holds at p .11–.24, .38–.51 and .65–.78. The section is taller to fit (640svh), and the scroll gates in smooth-scroll.js match. The Kung Fooled landing has a case study with six screens captured from the game (img/kf-*.webp, 2× nearest-neighbour upscale).
2. **GitHub links:** LastBite (github.com/robberttorfs/LastBite, the team repo) and Kung Fooled (github.com/KavishM23/kung-fooled) link from their landings and case studies. TutorTime was added the same day at github.com/KavishM23/TutorTime, without .env, the database or generated invoices. Its data is dummy data.
3. **Wording:** The Kung Fooled copy describes the game only, taken from its README. It makes no claim about who wrote what, because the repo's history includes AI-authored commits.

## 4 November 2026 — scrolling that always moves

1. **Feedback:** "Really hard to scroll." The gates added earlier held the page at about 20 edges, needed 180 px of push at each, ignored momentum and locked input for up to 1.65 s per transition.
2. **Rule now:** Input always moves the page straight away; nothing is held, blocked or locked. This supersedes the gate entries above. Lenis lerp is slightly quicker at 0.11.
3. **Kept:** Transitions are not left half-done. About 0.24 s after you stop inside one, it eases on in the direction you were scrolling (up to 0.9 s). Any new input cancels that at once. Direction is read from the input itself.
4. **Checked on the real page:** One long flick travels 1,724 px, and continuous scrolling crosses the whole Code page in 2.6 s with no stalled frames.

## 4 November 2026 — Spitfire intro

1. **Request:** Replace the tearing-head intro with a Spitfire, with Kavish in the cockpit.
2. **Model (spitfire.js):** A real-dimension model: lofted fuselage, elliptical wings and tailplane on an airfoil section, fin, four-blade propeller with spinner and blur disc, Merlin exhaust stubs, cannon, radiators, mast, windscreen and hood slid back. Painted in RAF green and grey with roundels, fin flash, sky band and "KM" fuselage letters.
3. **Pilot:** The paper-cutout head, cropped from img/kavish-full.webp and deliberately oversized to match the site, always turned to the viewer, with a scarf streaming behind.
4. **Timeline:** The plane comes in from far away (0 s), makes a close banked pass and waves its wings (1.7–2.6 s), then climbs out top right. At 2.7 s the head rises, the name slides in and the objects pop out at 3.3 s; everything is cleaned up by 4.4 s.
5. **Fallbacks:** Any scroll, click, key or touch skips it. It does not play with reduced motion, on another section or in a background tab. If 3D or the image fails, the page goes straight to the finished hero. The torn-scalp peel and its canvas are gone.

6. **Follow-up:** The user liked the plane but asked for the face to be removed. The pilot cutout and scarf are gone, the hood is closed over the cockpit, and img/kavish-full.webp is deleted because nothing else used it.

## 4 November 2026 — Concorde intro (replaces the Spitfire)

1. **Feedback:** Use a Concorde, with proper shadows and an actual flight path. The Spitfire's keyframes, bob and wing wave looked bouncy.
2. **Model (concorde.js):** To real dimensions: slender needle fuselage, ogival delta wing with drooped leading edge and tips, twin-engine nacelles with intake wedges and nozzles, tall swept fin. White livery with "KAVISH MADAN", G-KMAD, a navy and clay cheatline and fin. Cabin windows and flight deck are painted on.
3. **Flight:** One cubic S-curve. Nothing is keyframed: the nose follows the path's tangent and the bank comes from the turn (tan bank = lateral acceleration / g). There is no bob or wobble. It banks one way on the approach, rolls through level as it crosses side-on, then banks its top towards the viewer and exits right. Speed is fast on the long approach and eases when close, without stopping. The two contrails are computed from the same path.
4. **Shadows:** The hero's sun follows the plane with a shadow frustum sized to it, updated every frame, and its direction never changes. Hemisphere fill drops to 34% in flight so the sun models the shape. Both are handed back at 2.75 s, before the objects appear.
5. **Timeline:** The hero starts rising at 2.35 s and the intro cleans up by about 4.1 s. The portrait is decoded before take-off so it cannot hitch as it rises.

## Art direction: near-black, sand and one orange
Asked for the whole site to follow minhpham.design: deeper, darker colours, keeping every 3D object and the torn-portrait face.
- Ground is two near-blacks (#0D0D0D, #141312), type is warm sand (#B7AB98), and one orange (#EB5939) carries each emphasis.
- Type moved to League Spartan capitals and Nunito Sans body; tiny tracked labels replace pills.
- Cards went flat, straight and hairlined. Paper tilts, tape, folds and grain went.
- The portrait is warm monochrome and low-key. Photos sit graded and return to full colour on hover.
- All 3D scenes, the Concorde livery and the tears are regraded to the same palette, lit low with an orange rim. The trophy cabinet is a dark room with one spotlight per bay.
- Overrides live in `noir.css`, loaded last. The statement fill lives in `noir.js`.

## The staircase needed a start
The helix began in mid-air. It now starts at a walled landing at the top: a lit arched doorway marked START, a floor you walk out onto, handrails that run back to the wall, and newel posts where the first step drops away. The camera opens slightly higher so the whole entrance is framed.

## Moroccan gateway, and no more hard edges on the 3D
The plain doorway was too simple, and objects were being sliced along a line near the top of the page as they scrolled.
- The staircase scene now fills the whole viewport and fades into the dark under the copy, so it never ends on a box edge. The same fades soften the cabinet.
- Overlapping geometry at the landing that could flicker is gone.
- The doorway is now a Moroccan bab: horseshoe arch of alternating voussoirs, carved plaster, zellige tile, slim columns, brass rosettes, a cedar canopy with a glazed tile roof, and a tiled hall with a lantern and carved screen. Two studded cedar doors swing open when the Code page appears. All of it is modelled or drawn in code, in the site's palette.

## Real materials on the stairs and gateway
From further down the stairs the back of the doorway was a flat red box. It is now a proper small building: brick walls, a stone plinth and string course, a tiled roof, stepped merlons along the wall, and a lit window with an iron grille. The hall also sits on the landing slab instead of hanging off it.
Brick, limestone and flagstone are drawn in code with matching height maps. Treads vary slightly from step to step, and the scene has real cast shadows from one light. They are drawn once and redrawn only while the doors swing, so scrolling stays cheap.

## The door opens on scroll and the staircase comes out of it
The Code page now opens on the closed gateway alone, with nothing below the landing. Scrolling swings the doors, tied directly to scroll. Once they are open, the staircase slides out of the hall through the doorway as one ribbon, crosses the landing and corkscrews down the column, so every tread lands at the same moment. Rails, column, screens and the landing pad appear as it passes, and the drone flies out too.
The burst runs on a clock, so it never holds the page, and the camera waits for it before normal scrolling takes over. Scrolling back draws the stairs in first, and the doors stay open until the last tread is inside. Closing them with the scroll left the stairs stuck against a shut door.

## Everything connects, and About me comes first
Parts of the staircase and gateway floated: the columns held nothing up, treads stopped short of the central column, the copper rail had no posts, and the helix ended in mid-air.
- Columns now stand on pedestals and carry the arch through impost blocks.
- Treads run into a carved stone column with brass bands. Rails have posts and turned newels, and the stairs finish on a stone floor.
- Curved edges are smooth, tile and plaster have real relief, and the hall roof no longer pokes past the wall from the front.
On the home page, About me now sits straight under the hero, followed by the intro and the builds.

## The workshop hero (local test, not pushed)

Kavish's idea, after looking at Henry Heffernan's site: make the main page a workshop around an F1 car, using the picture Codex generated, but as real 3D.

- The workshop is the whole home screen, with nothing below it, like Heffernan's. It opens small in the dark, then the camera settles into the framing of the picture. About, Builds, Code, Awards and Contact are now separate pages.
- Each object has its own way into its page, then hands over to the same full-screen wipe the rest of the site uses. On the tablet the wipe plays on the screen first, and the camera pushes in until that screen fills the display. Going back is a plain wipe straight to the workshop, with no replay.
- The top bar is Workshop, About, the music switch and a hamburger menu that lists every page.
- Contact is not a page. The crate opens in the room with two choices: the letter copies the email, and the old floating LinkedIn tablet opens the profile.
- Kessler: the camera flies alongside the Concorde as it climbs, then the satellite passes it on the way up into space.
- The palette comes from the Moroccan gate: pastel plaster, blush, sage and zellige blue grounds with deep teal, terracotta and majorelle. The workshop stays a real workshop of plaster and concrete, and the footer is the one deep block.
- The portrait now lives on the About page.
- Every model has a hover reaction and a click reaction, with short sounds only on a click. The pencil, pick, plant and shelf cases are toys that open nothing.
- The name is stencilled on the wall, so the big name stays without a portrait.
- Floor and wall light is baked into `img/workshop-light-*.webp`. After moving anything in the room, run `tools/bake-workshop.html` and copy the new maps in.
- Moving frames use a lighter render, and the frame the camera stops on gets the full one.
- The Concorde intro, torn portrait and Latest badge are switched off in this version, not deleted.

## School section, back on paper
The flat cards in School & academics went back to real paper on the dark ground: a ruled notebook page with stamped grades, a till receipt and ticket stubs. The SAT retake line and the next-sitting note were removed.

## Day and night, and a lighter build
- A switch in the top bar flips the whole site between the Moroccan pastels and a deep night version, and it remembers the choice. In the workshop the sun goes down, a warm lamp comes on and the window turns to dusk.
- Scenes on other pages are built the first time they are needed, not at load. The workshop frees its render buffers while you are on a page, stops drawing when nothing moves, and the hidden hero's models are no longer built.
- The left of the room now has a workbench, pegboard, stool, sill plant and a Moroccan rug. If anything in the room moves, run tools/bake-workshop.html again.

## Room tone
Quiet ambient music now plays behind the site. It is made in the browser rather than a downloaded track, so there is nothing to licence and nothing extra to load. It fades in after the first click or key press because browsers block sound before that, fades out while Spotify plays, and the speaker button in the top bar turns off all site sound. Change `VOLUME` in ambient.js to make it louder or quieter.

## Project machine, rebuilt around the real car
- Strata is now built from the team's CAD: 22 ribs sliced from the Fusion body, with the real tyre and rim. The chassis and electronics are modelled from photographs. It is not a scan.
- The quadcopter is labelled as representative, the wing as a concept model, and the Kessler plaque says heights are not to scale. `assets/models/vending/README.md` lists what is real and what is inferred.
- The cabinet is now hollow, so a product rides twin coils, drops down a lane in front of the shelves, lands on a ramp and leaves through a drop-down tray door. If you change the cabinet, run the tests: they fail if a product would hit the glass, a shelf, the ramp or the hatch.

## The workshop, baked
- The machine and room are now one Blender scene with light baked into textures, the method Jesse Zhou describes for his ramen shop. The room itself is original: a brick workshop with a bench, shadow board, cork board, shelving, window and ceiling.
- Metal bakes black if it stays metallic in Blender, so the light rig bakes everything as non-metal and the page adds the shine back.
- Cabinet numbers live in `builds-lab-layout.js`. Blender reads the same file, so a change there means a rebuild and rebake, not just a code edit.
- The status screen, buttons and flap are real parts of the machine now and report what it is doing.

## Code: same staircase, better objects
- A full stairwell rebuild was tried and rejected as too much. The page stays as it was: the cream scene, door, pouring stairs and text.
- The flat monitors are now small 3D sets on brackets off each landing: a kitchen counter for LastBite, a desk with the real match formula for TutorTime, and an arcade cabinet for Kung Fooled. Each shows its real screen.
- Screens are recaptured from the running apps at 1600 px, and the drone is the detailed model. If a set or the drone can't load, the plain monitor or simple drone stays.

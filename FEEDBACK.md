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

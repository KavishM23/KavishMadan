# Kavish Madan

My maker portfolio: things I've built, the code behind them, and my awards.

**Live site:** https://KavishM23.github.io/KavishMadan/

## Pages

- **Builds:** Project Strata (Land Rover 4×4 in Schools, 2nd in the UAE), anti-drone quadcopters, my Kessler orbital debris model and a dragonfly-inspired UAV wing.
- **Code:** LastBite (UAE InnovAIte Hackathon finalist) and TutorTime (my A-level Computer Science NEA).
- **Awards:** olympiads, competitions and academics.

## How it's built

One static page, no build step. The hero's 3D objects are modelled in [three.js](https://threejs.org), scroll effects use [GSAP](https://gsap.com), and the torn-paper transitions are SVG drawn from scroll position. Open `index.html` in a browser, or serve the folder with any static server.

`models.js` supplies the additional About, Code and Awards objects; they share the hero's WebGL renderer. `interactions.js` and `interactions.css` provide the contextual cursor, pointer lenses, touch/keyboard reveal controls and collection layout. The blue palette is retained with a provisional mineral accent pending colour selection. Design decisions are recorded in `FEEDBACK.md`.

`code-journey.js` and `code-journey.css` turn the Code page into a scroll-driven spiral staircase with LastBite and TutorTime landings and a following drone. Short-screen, reduced-motion and WebGL fallbacks retain a normal project layout. The final code-behind-the-builds section is preserved.

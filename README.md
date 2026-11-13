# 3D Portfolio

An interactive intro page for my projects, built with Three.js. Six low-poly shapes sit in a ring, one per project. Pick a shape and the ring turns to bring it to the front, with the project details shown beside it.

I built it to learn Three.js and to have one page that links my other repos together.

## Run it

Needs Node.js 18 or newer.

```
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

Other commands:

```
npm run build   # production build into dist/
npm run preview # serve the production build locally
npm test        # unit tests for the project data and ring maths
```

## What it does

- Shows a ring of six shapes on a star background. Each shape has its own colour, matched by the dot next to its name in the project list.
- Click or tap a shape to select it. The ring turns the short way round to bring it to the front, and the panel shows the summary, what it was built with and a link to the repo.
- Drag sideways on the scene to turn the ring by hand. Vertical swipes still scroll the page on a phone.
- The project list, Previous and Next buttons do the same thing as clicking a shape, so the page works with a keyboard or a screen reader.
- A Pause motion button stops the spinning. If your system is set to reduce motion, the page starts paused and selections jump straight to the front instead of animating.
- If WebGL is not available, the scene is hidden and the list and details still work.
- Three.js is loaded as a separate chunk after the text and list, so the page is readable before the scene starts.

## Changing the projects

Edit the `projects` array in `src/projects.js`. Each entry has a name, summary, tech list, repo link, shape and colour. The ring spaces itself out for however many entries there are. Supported shapes: `box`, `octahedron`, `torus`, `icosahedron`, `cone`, `dodecahedron`.

## Structure

- `src/projects.js`: project data and the angle helpers. No Three.js imports, so it runs under plain Node.
- `src/projects.test.js`: tests for the data and helpers.
- `src/scene.js`: the Three.js scene, picking, dragging and animation loop.
- `src/main.js`: the list, detail panel and buttons, and loading the scene.
- `src/style.css`: layout and colours.

## Notes

- The pixel ratio is capped at 2 to keep it smooth on high-density screens.
- On narrow screens the camera moves back so the whole ring stays in view.

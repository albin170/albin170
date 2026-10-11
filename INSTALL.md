# CODEVERSE — install / migration

This package is a **replacement GitHub profile README**, with cinematic original superhero art, animated GIF assets, and a **real-time native-WebGL 3D companion webpage**. It uses a true perspective camera and rendered 3D meshes; the GIF is a compatible pre-rendered motion preview for GitHub.

## Install on GitHub

1. Open your public GitHub profile repository (commonly `albin170/albin170`). GitHub profile READMEs require the repo name to match the username. If yours differs, update the appropriate repository instead.
2. **Back up your old `README.md`.** Copy the replacement `README.md` and the new `assets/` directory from this package into the repository root.
3. To remove the old asset instead of just hiding it, delete `assets/orbiting-skills.svg` from the repository if it exists and is no longer used. The new README does **not** link to it.
4. Commit and push the changes. The animated hero, spinning 3D reactor preview, and signal strip will render as animated images directly in supported GitHub README viewers.
5. Check the resulting README on desktop and mobile.

Suggested local commands, from your own checked-out profile repository:

```bash
cp /path/to/codeverse-readme/README.md ./README.md
cp -R /path/to/codeverse-readme/assets/. ./assets/
git rm --ignore-unmatch assets/orbiting-skills.svg
git add README.md assets/
git commit -m "Redesign profile README: Codeverse superhero edition"
git push
```

Do not run `git rm` if the old SVG is used elsewhere in your repository.

## Optional: Deploy the interactive webpage

`experience/index.html`, `experience/styles.css`, `experience/script.js`, and `experience/world3d.js` use no build tools or external JavaScript dependencies. The 3D engine is written in native WebGL with real mesh geometry, perspective projection, fragment lighting, particle depth, and animated orbit paths. Keep `experience/` adjacent to `assets/`.

- Local preview: from the package root run `python -m http.server 8000`, then visit `http://localhost:8000/experience/`.
- **Publishing on GitHub Pages:** in the `albin170/albin170` profile repository, push the entire project so `experience/` and `assets/` are at the root. In **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save. Once Pages publishes, the expected interactive URL is `https://albin170.github.io/albin170/experience/` (assuming default GitHub Pages configuration). If your branch or Pages URL differs, edit the two 3D links in `README.md`.
- Alternatively, copy `experience/` and `assets/` together to a different static website and update the links.
- GitHub READMEs cannot run WebGL directly: the README preview is a GIF, and clicking it takes visitors to the interactive page once deployed.

## Editing

- Edit the text and verified links in `README.md`.
- `assets/codeverse-hero.gif`: animated README banner (most compatible option).
- `assets/reactor-3d.gif`: continuously moving **real 3D geometry pre-render** for GitHub's README.
- `assets/signal-live.gif`: narrow animated HUD ticker.
- `assets/hero-01.webp` ... `hero-03.webp`: character profiles.
- `assets/codeverse-art.webp`: static full-resolution background for the companion page.
- `experience/world3d.js`: self-contained WebGL reactor mesh renderer and particle system.
- Interaction: move the mouse for 3D camera tilt, select a superhero to recolor the reactor, press **R** to initiate overdrive, or use **Switch Dimension**. The Motion switch and reduced-motion system settings pause the effect.
- Set animation intensity or pause effects in the companion page using the `Motion: ON/OFF` button; reduced-motion settings are respected.

## Compatibility and performance

GitHub sanitizes Markdown HTML, blocking embedded JavaScript, iframes, and full interactive 3D canvases. Animated GIF works broadly; SVG animation may be stripped or frozen depending on the way the file is served. For that reason, this design does **not** depend on animated SVG. The big banner intentionally uses a raster animation; if bandwidth matters more than motion, substitute the static `assets/codeverse-art.webp` for `assets/codeverse-hero.gif` in `README.md` and remove the reactor GIF. The WebGL scene needs browser WebGL support, but includes a CSS 3D-inspired fallback.

## Artwork and attribution

Superheroes are original fictional characters designed for this profile (not Marvel/DC likenesses). The principal artwork was AI-assisted; animation overlays, layouts, and code were composed for this project. This project includes no licensed music or third-party hero imagery.

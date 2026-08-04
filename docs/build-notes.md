# Build notes — Blender, ffmpeg, SVG → WebP, and accessibility

This document collects commands and tips to produce the README assets (hero loop, poster, optimized WebP) and guidelines for accessibility and file-size optimization.

1) Export frames from Blender
- Set your render resolution to 800×800 (or 1200×600 for widescreen).
- Choose PNG with transparent background if needed and render an image sequence (frame_0001.png ... frame_00NN.png).

2) Convert frames to animated WebP (recommended over GIF)
- ffmpeg -i frame_%04d.png -vf "scale=800:-1:flags=lanczos,fps=15" -vcodec libwebp -lossless 0 -compression_level 6 -q:v 40 -loop 0 assets/hero-loop.webp
- Adjust fps (12–18) and q:v (lower = higher quality/larger size).

3) Create poster (first frame) PNG
- ffmpeg -i frame_0001.png -vframes 1 assets/hero-poster.png
- Or rasterize the SVG poster using Inkscape:
  inkscape -w 800 assets/hero-poster.svg --export-filename=assets/hero-poster.png

4) Quick SVG → WebP (rasterize then encode)
- inkscape -w 800 assets/orbiting-skills.svg --export-filename=temp.png && ffmpeg -loop 1 -i temp.png -t 4 -vf "fps=15,scale=800:-1" -vcodec libwebp -q:v 40 -loop 0 assets/hero-loop.webp && rm temp.png

5) Accessibility & performance
- Keep hero loop < 500 KB if possible. Use shorter loops and lower fps.
- Provide a static poster image (assets/hero-poster.png or SVG) and descriptive alt text.
- Add a text link to the interactive site: "View interactive version" for keyboard/screen-reader users.

6) Tips for Blender renders
- Use filmic color management and denoise the frames if using complex lighting.
- Use motion blur sparingly; it increases file size.

7) Contribution terrain
- Use scripts/generate_contribution_terrain.py to output a CSV of date→count.
- Import CSV into Blender or convert to a heightmap image (grayscale) where higher counts map to brighter pixels.

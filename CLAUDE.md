# Myxo Petri Wars

A slime-mould auto-battler that runs entirely in one file, `index.html`: the simulation,
the three.js renderer, the interface, synthesized sound, versus play and telemetry. There is no build step;
serve the folder with any static server (`python3 -m http.server`) or open the file directly.
It is published with GitHub Pages at <https://eyeree.art/petri/>.

- `README.md` covers how the game plays, controls, versus, development and telemetry.
- `game-play-design.md` is the design of the gene catalogue, the ten plates and their opponents.
- `tools/balance/` runs the simulation headless under Node (no dependencies). It loads the
  simulation block straight out of `index.html` (from the `MYXO SIMULATION` banner to the
  `module.exports` line), so that block must stay free of DOM dependencies.
  `node tools/balance/baseline.js` runs the standard checks; its README lists the other scripts.

## Version number

The version is shown in the header next to the logo, in `index.html`:

```html
<div class="version" id="appVersion">v 0.0.1</div>
```

It is incremented by hand. Every change that ships (every commit to `main` that changes
what a player gets) bumps it, following semantic versioning, `MAJOR.MINOR.PATCH`:

- **PATCH** (`0.0.1` → `0.0.2`): bug fixes, visual polish, wording, small balance tweaks
  and other changes that add nothing new to the game.
- **MINOR** (`0.0.2` → `0.1.0`, resetting PATCH): new features or content, such as a new
  plate, gene, opponent, mode or control, or a rebalance a player would notice.
- **MAJOR** (`0.1.0` → `1.0.0`, resetting MINOR and PATCH): changes that break what
  players already have: saved strains or progress that no longer load or play the same,
  or a versus protocol that older pages can no longer talk to (`VS_PROTO`). While the
  game is in `0.x`, such breaking changes bump MINOR instead.

Make the bump part of the same change, choose the level by the largest change in it, and
bump only once per change. Changes that touch only docs or `tools/` do not need a bump.

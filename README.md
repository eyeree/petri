# Myxo Petri Wars

Breed a slime mould and take the dish. A small auto-battler, loosely modelled on the
plasmodial slime mould *Physarum polycephalum*, that runs entirely in one HTML file.

Play it at <https://eyeree.art/petri/>, or open `index.html` from a local clone.

## How a culture plays out

You write a genome for your strain within a kilobase budget, inoculate a petri dish
that already holds a rival plasmodium, and then watch the two organisms grow, feed and
fight for the agar over a twelve-hour incubation. Every battle is recorded minute by
minute: rewind it, scrub it, step through it, zoom into the fights and click cells to
see what happened to them. Each plate you win isolates new genes for the next one.

**Genome.** Traits (Vigor, Density, Sensor range), three behaviour drives (Seek food,
Hunt rival, Explore) and a set of genes for metabolism, defence, offence and network
management all cost kilobases, so every strain is a trade-off.

**Sensing.** A strain only knows about food and rival tissue within its sensor range of
some cell it owns, and granite blocks that. Food it has sensed stays remembered. Instead
of wandering at random, a strain with Explore sends out exploratory spikes into open
agar; whatever they bring into range is then handled by the Food and Hunt drives.

**Body.** New growth is a sparse tendril. Cells thicken into lace and then sheet as they
mature, as their own strain surrounds them, and when they sit on a vein. Veins are a
routing tree: each cell passes its intake toward its fragment's feeding hub, and the
trunks that carry the most flow fatten over time. Thin rival cells can be infiltrated
and fought for from the inside.

**No centre.** A plasmodium has no head. Energy is stored in the cells and pooled by
connected fragment every minute: cut a network apart and each piece lives on its share,
pieces that touch again merge, and a fragment with no food pulls back from its edges,
recovering the energy in its body, rather than withering in place.

**Winning.** Wipe out the rival, overrun it (hold nine tenths of the living tissue for
half an hour), or hold more of the dish when the incubation ends. A lean strain parked
on regrowing food can outlast a bloomer that ate the plate bare.

## Controls

Drag to orbit, right-drag (or two fingers) to pan, scroll or pinch to zoom in close.
Click a cell to inspect it. Space plays and pauses, the arrow keys step (with Shift,
ten minutes), `[` and `]` jump between events, Home resets the view, and P shows the
exploration probes. The timeline only reveals as far as you have watched, so a first
viewing never gives away the ending.

## Development

Everything is in `index.html`: the simulation, the three.js renderer and the interface.
The simulation block at the top of the script (from `MYXO SIMULATION` to the
`module.exports` line) has no DOM dependencies and runs under Node, which is how
balance is checked: extract it with `sed`, require it, and run every plate against a
set of genomes before and after a change.

Serve the folder with any static server (for example `python3 -m http.server`) or just
open `index.html`; there is no build step. The game is published with GitHub Pages.

## Reference material

The look of the strains follows photographs of *Physarum polycephalum*: a thick central
mass, radiating veins that thin toward a lacy periphery, and dendritic growth fronts.
Good places to see the real thing:

- Wikipedia, [*Physarum polycephalum*](https://en.wikipedia.org/wiki/Physarum_polycephalum)
  and [slime mold](https://en.wikipedia.org/wiki/Slime_mold)
- Wikimedia Commons, [Category: *Physarum polycephalum*](https://commons.wikimedia.org/wiki/Category:Physarum_polycephalum)
  and [Category: *Physarum*](https://commons.wikimedia.org/wiki/Category:Physarum)
  (freely licensed photographs, each credited on its own page)
- Flickr, [search for *Physarum polycephalum*](https://www.flickr.com/search/?text=physarum%20polycephalum)
- Sage Jenson, [Physarum](https://cargocollective.com/sagejenson/physarum), an
  agent-based simulation that captures the vein networks beautifully

The vein routing and the retraction behaviour are loosely based on:

- Nakagaki, Yamada and Tóth, "Maze-solving by an amoeboid organism", *Nature* 407 (2000),
  <https://doi.org/10.1038/35035159>
- Tero et al., "Rules for Biologically Inspired Adaptive Network Design", *Science* 327 (2010),
  <https://doi.org/10.1126/science.1177894>
- Jones, "Characteristics of Pattern Formation and Evolution in Approximations of
  Physarum Transport Networks", *Artificial Life* 16 (2010),
  <https://doi.org/10.1162/artl.2010.16.2.16202>

## License

[MIT](LICENSE)

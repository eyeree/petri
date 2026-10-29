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
management all cost kilobases, so every strain is a trade-off. Save a strain under its
name and load it on any plate: plates differ only in their kilobase budget, so a strain
bred for a later plate shows as over budget on an earlier one until it is trimmed.

**Sensing.** A strain only knows about food and rival tissue within its sensor range of
some cell it owns, and granite blocks that. Food it has sensed stays remembered. Instead
of wandering at random, a strain with Explore sends out exploratory spikes into open
agar; whatever they bring into range is then handled by the Food and Hunt drives.

**Body.** New growth is a sparse tendril. Cells thicken into lace and then sheet as they
mature, as their own strain surrounds them, and when they sit on a vein. Veins are a
routing tree rooted at the fragment's feeding hubs, one for every food source it is
eating from. Each cell passes its intake toward the hub that pulls hardest on it, and
the trunks that carry the most flow fatten over time. A hub's pull grows and fades with
its share of the intake, so when one pile runs out and another is found the network
shifts cell by cell from the old hub to the new, their tendrils overlapping where the
two territories meet. Thin rival cells can be infiltrated and fought for from the inside.

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
exploration probes. A freezes the surface animation (flow pulses, throb and hub glow), a
debugging aid for judging the vein geometry on its own. The timeline only reveals as far as you have watched, so a first
viewing never gives away the ending.

## Playing a friend

The rack has a *Play a friend* card. It shows a connection code and a place to enter
one: share yours with another breeder, or type in theirs, and the two browsers connect
to each other directly over WebRTC. There is no server of ours in the way, no database
and no account: [Trystero](https://github.com/dmotz/trystero) uses public Nostr relays
only to carry the connection handshake, and the browsers talk to each other after that.

Once connected, either player can change the plate and the kilobase cap. Each of you
picks a saved strain that fits the cap (or saves the one in the lab) and presses Ready;
the culture starts when both are. Both browsers run the same deterministic simulation
from the same inputs, so nothing but the two genomes ever crosses the wire. Between
matches you edit, save and switch strains exactly as in solo play. Every saved strain
keeps a win and loss count against other players, and the *send* button beside a saved
strain hands a copy to the other player, who can rename it before keeping it, or
discard it.

Sides on a plate are not symmetric, so the lobby says which corner you start in and has
a Swap button. The code is good for the page's lifetime; reload and you get a new one.
A direct connection needs both networks to allow WebRTC; without a TURN relay a pair
of strict NATs may fail to connect.

## Development

Everything is in `index.html`: the simulation, the three.js renderer and the interface.
The simulation block at the top of the script (from `MYXO SIMULATION` to the
`module.exports` line) has no DOM dependencies and runs under Node, which is how
balance is checked: extract it with `sed`, require it, and run every plate against a
set of genomes before and after a change.

Serve the folder with any static server (for example `python3 -m http.server`) or just
open `index.html`; there is no build step. The game is published with GitHub Pages.

The versus code is the `Versus` section of the script. It loads Trystero from jsDelivr
on demand, so solo play never touches the network. Messages are small JSON objects
(`hello`, `set`, `ready`, `unready`, `name`, `share`, `verdict`, `bye`), every one
numbered so that a copy arriving through a second shared room is dropped. The match
inputs are the plate, the cap, which player takes the gold corner, and the two genomes;
after the simulation each side sends a digest of its outcome and the result card notes
if the two browsers disagreed.

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

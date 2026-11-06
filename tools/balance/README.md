# Balance harness

Node scripts that run the game's simulation headless. `sim.js` loads the simulation block straight
out of `../../index.html` (the part from the `MYXO SIMULATION` banner to the `module.exports` line,
which has no DOM dependencies), so the scripts always test the code that ships and there is nothing
to extract or keep in sync. No dependencies; `node tools/balance/<script>.js` from the repo root.

A round takes about 0.7 s. Every check runs over several seeds because a close pairing can go
either way on the seed alone; `w/n` in the output is round wins out of seeds run, `share` the gold
side's share of the living tissue when the round ended, and the tail counts how the rounds ended
(`W:dom` won by overrun, `L:time` lost on territory at 12:00, `elim` wiped out).

| Script | Question it answers |
|---|---|
| `baseline.js` | The standard checks: opponent kb against budgets; the default strain against every opponent in both corners; mirror matches for side bias; each plate's opponents carried onto the next plate. |
| `genesweep.js` | Against this opponent on this plate, what does each single edit to a genome do? Which genes are dead weight here. |
| `climb.js` | How far is a counter? A greedy hill-climb from a genome under a budget and a gene whitelist, printing the edit path. Goal 3 wants a short path on plate 1; goal 4 wants none for a carried strain. |
| `carry.js` | Goal 4 directly: earlier-plate archetypes, or the hill-climb with only earlier genes, at a plate's budget against each of its opponents. |
| `arena.js` | Round robin of builds on a neutral plate: which genes dominate at equal cost. |
| `gating.js` | How much of each plate's food a strain can reach and eat by terrain key. |
| `costs.js` | The proposed catalogue and roster of `game-play-design.md`, costed, with the budget rule. Reads nothing from the game. |
| `oppclimb.js` | Strengthen an opponent: hill-climb its genome against challengers (the default, the previous plate's opponents, or any genome) under a kb cap, keeping the genes it must keep. Used to tune single opponents by hand. |
| `chain.js` | How the roster is tuned: plate by plate, the opponent is hill-climbed to beat the player's counter to the plate before (and that plate's opponent, and any counter found with older genes only), as long as a counter using the plate's own new genes still exists within its budget; that counter is carried on. `--roster <json>` holds the starting opponents and writes the tuned ones back. |
| `repro.js` | What exactly was on screen? Rebuilds a moment from a state blob (the S key in the game: plate, genomes, round seeds, round and tick), steps that round's `Battle` to the tick, checks it against the frame the browser recorded (and the simulation fingerprint), and prints both sides, the selected cell and recent events. `--tick`, `--cell i` or `--cell x,y` and `--json`; `require('./repro.js').load(text)` returns the live `Battle` to inspect or step on. Exits 1 when the replay does not match. |
| `pool.js` | Not a script: a worker-thread pool. `series` and `climb` with the same results as `harness.js`, run on every core (set `POOL` to limit). |

Genome options take `default`, `rival:<level>[:<index>]` or JSON, for example
`--genome '{"vigor":3,"density":2,"sense":2,"genes":["amylase","protease","prune"],"taxis":{"food":4,"hunt":1,"explore":3}}'`.
Every plate has one opponent, `rival:<level>`.

The acceptance tests these scripts serve, and the numbers to hit, are in section 11 of
`game-play-design.md`.

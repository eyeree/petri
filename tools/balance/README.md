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

Genome options take `default`, `rival:<level>[:<index>]` or JSON, for example
`--genome '{"vigor":3,"density":2,"sense":2,"genes":["amylase","protease","prune"],"taxis":{"food":4,"hunt":1,"explore":3}}'`.
Scripts take the plate's single `rival` today and its `rivals` list once the roster lands.

The acceptance tests these scripts serve, and the numbers to hit, are in section 11 of
`game-play-design.md`.

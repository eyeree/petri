# Myxo Petri Wars: game-play design

Genome options, built-in plates and their opponents. Proposed design, 2026-11-01.

This document covers five goals:

1. More gene options, more kilobases to spend, more emergent behaviour, with every built-in plate
   introducing a challenge in the environment and the opponent that needs a new gene to beat.
2. Several pre-designed opponent strains per plate. One is picked at the start of a match and used
   for every round; the default pick is random, the player can choose; some are harder than others.
3. The default strain loses to every plate 1 opponent. A win needs an edit, small but a trade-off.
4. The player's strain carries forward. A strain bred for an earlier plate almost always loses to
   every opponent on a new plate, and beating a new plate without its new genes is extremely hard.
5. Budgets grow, but never enough to take every new gene. The player chooses among the new genes or
   trims old ones to make room.

Everything here was checked against the simulation as it is today, using the Node harness in
`tools/balance/` (the simulation block loaded out of `index.html` and run headless). Numbers are
round wins out of the seeds run, shown as `w/n`. Where a proposal has not been run, it says so.

## 1. Assumptions

- **Ten built-in plates.** Each follows one template: an exclusive gate in the environment, three or
  four new genes, three opponents. The Elder Plasmodium stays last.
- Plates stay pure data (positions, radii, amounts, flags, no code, no randomness), as planned. New
  plate features are new placement records, new terrain or food types and one plate flag, never
  per-plate code.
- Opponents are ordinary genomes. There are no rival-only abilities, so any opponent could be sent
  to a friend or saved to the rack unchanged. An opponent uses only genes the player can have on
  its plate.
- Versus play is untouched except that the cap menu grows with the new top budget.

## 2. Review of the current game

### 2.1 Gene catalogue today

Sixteen genes. Costs in kb, unlock given as the plate on which the gene first becomes usable.

| Category | Gene | kb | Usable from | Effect in code |
|---|---|---|---|---|
| Metabolism | Amylase | 1 | D-01 | eats oats (eat 0.5/min, yield 1.0) |
| Metabolism | Protease | 1 | D-01 | eats lawns (eat 0.5, yield 1.25; lawn regrows 0.03/min) |
| Metabolism | Ligninase | 2 | D-03 | eats bark (eat 0.22, yield 2.6) |
| Metabolism | Algal Symbiont | 3 | D-04 | +0.2 ATP/min per lit cell; immune to UV; growth seeks light |
| Metabolism | Necrotrophy | 2 | D-06 | +6 ATP per kill |
| Defense | Chitin Rind | 2 | D-01 | engulf damage ×0.5, contest push ×0.6; growth cost ×1.15 |
| Defense | Alkaline Slime | 2 | D-02 | acid ×0.35, haze ×0.6 |
| Defense | Osmotic Pumps | 1 | D-03 | immune to salt; no salt growth penalty |
| Defense | Sclerotia | 2 | D-04 | starving fragments go dormant: damage ×0.4, upkeep ×0.15 |
| Defense | Cytoplasmic Healing | 2 | D-01 | heals 1.0 HP/min extra for 0.02 ATP per HP |
| Offense | Pseudopod Crush | 2 | D-01 | engulf ×1.6 |
| Offense | Oxalic Acid | 3 | D-02 | +2.4 contact damage, dissolves granite, contest push ×1.3 |
| Offense | Antibiotic Haze | 3 | D-05 | 0.55/min to rival cells within 2 |
| Offense | Spore Cannons | 3 | D-06 | every 45 min, up to 3 sporelings toward food |
| Network | Vein Pruning | 1 | D-01 | retracts idle cells, upkeep −0.0012 |
| Network | Reserve Granules | 2 | D-05 | growth reserve ×2.5 |

Traits (Vigor, Density, Sensor range) cost 0/1/2/4/6 kb for levels 1 to 5; drives (Seek food, Hunt
rival, Explore) cost 0/0/1/2/3/5 kb for levels 0 to 5. A maximal genome is 66 kb; the last plate
allows 21.

### 2.2 Plates and opponents today

| Plate | Budget | Rival | Rival kb | Gate (food a carried strain cannot reach or eat) |
|---|---|---|---|---|
| D-01 Oat Flake Plate | 12 | Fuligo minor | 11 | none |
| D-02 Granite Maze | 14 | Lycogala corrodens | 14 | bark in the ring: 38% of the food, but Ligninase is not usable until D-03 |
| D-03 Salt Pan | 16 | Stemonitis lorica | 19 | 81% of the food lies on salt |
| D-04 Sunlit Shallows | 17 | Ceratiomyxa lumina | 17 | 43% of the food lies under the lamp; little food overall |
| D-05 Bacterial Bloom | 19 | Badhamia vorax | 21 | none: 91% is lawn and the default already has Protease |
| D-06 The Elder Plasmodium | 21 | Physarum senex | 33 | bark under the lamp, lawn in the salt |

### 2.3 What the harness measured

Default strain (Vigor 2, Density 2, Sensor 2, Seek 3, Hunt 1, Explore 2, Amylase, Protease, Chitin
Rind, Pseudopod Crush, 12 kb) against each plate's rival, 8 seeds:

| Plate | Default wins | Default's share of tissue at the end |
|---|---|---|
| D-01 | 7/8 | 0.71 |
| D-02 | 2/8 | 0.25 |
| D-03 | 0/8 | 0.07 |
| D-04 | 0/8 | 0.06 |
| D-05 | 1/8 | 0.20 |
| D-06 | 0/8 | 0.10 |

Strains built only from the six plate 1 genes, at each later plate's budget, against that plate's
rival (8 seeds): all four archetypes tried lose every round on D-03, D-04 and D-06. On D-02 a
scout build wins 2/8 within budget and 5/8 at 18 kb. On **D-05 a Density 4 Chitin tank wins 8/8**
and a Density 3 brawler 7/8. Goal 4 holds on four plates and fails on D-05.

Marginal value of a single edit to the default on D-01 against Fuligo minor (8 seeds, budget
ignored): adding Cytoplasmic Healing, Oxalic Acid, Antibiotic Haze or Necrotrophy each gives 8/8 by
overrun; adding Vein Pruning 8/8; Reserve Granules **drops** the default from 7/8 to 5/8; Vigor,
Density or Hunt +1 each gives 8/8; Seek food −1 and Explore −1 each give 8/8 too, so the default
over-invests in exploration on a plate this small.

Round robin on D-01 of a 12 kb base (Chitin, Crush, Hunt 2) plus one addition each, every pair over
4 seeds, 64 rounds possible per build:

| Build | kb | Wins |
|---|---|---|
| + Oxalic Acid | 16 | 62 |
| + Antibiotic Haze | 16 | 51 |
| + Cytoplasmic Healing | 15 | 49 |
| + Necrotrophy | 15 | 39 |
| + Spore Cannons | 16 | 22 |
| Density 3 | 14 | 22 |
| Vigor 3 | 14 | 17 |
| + Alkaline Slime | 15 | 14 |
| + Reserve Granules, Vein Pruning | 16 | 12 |

Equal-cost Alkaline Slime builds against the acid build: 2/8 and 3/8. Against the haze build: 0/8
and 1/8 (7/8 only with Healing added). The counter-gene loses to what it counters.

Cytoplasmic Healing: default + Healing (14 kb) beats the default 7/8. Swapping Healing for Crush at
12 kb still wins 4/8. No single edit of the default under 12 kb improves against default + Healing.

Mirror matches (a rival against itself on its plate) run 4/8 to 6/8 for the gold corner, so the
side bias is small but present on D-04.

Sealing the granite ring on D-02 was tried: the plate 1 strains then did **better** against
Lycogala corrodens (scout 5/8 instead of 2/8), because acid takes about an hour to burn through a
two-cell wall and the rival spends it while the player eats the oats outside. Granite is a delay
gate, not an exclusive one.

### 2.4 Problems to fix

1. The default beats plate 1 (goal 3).
2. Bacterial Bloom has no gate and is beaten by a plate 1 tank (goal 4). Granite Maze gates weakly.
3. Oxalic Acid dominates at 3 kb; Alkaline Slime fails as its counter; Reserve Granules is a net
   loss on any plate with food; Cytoplasmic Healing is an automatic include at 2 kb.
4. One rival per plate, so every retry is the same match.
5. Rival cost versus budget is unsignalled and inconsistent (11 against 12 on D-01, 33 against 21 on
   D-06).
6. Ligninase is isolated one plate after the plate whose rival eats bark in front of the player.
7. The "Severed" damage source exists in the data tables and is never dealt.

## 3. Design principles

- **Every plate has an exclusive gate.** Most of a plate's food is reachable or edible only with a
  gene the plate itself introduces, and every opponent on the plate carries that gene. Gates must be
  cheap for the key-holder (an enzyme, an immunity) rather than slow (acid through granite), or the
  gate slows the opponent more than the player.
- **Three opponents, three answers.** Each plate's opponents are distinct archetypes (a brawler, an
  economist, a specialist in the plate's gimmick). The counter to one is not the counter to another,
  so the player keeps editing after the first win.
- **Budget rises by at most half the kb of the new genes.** The player can never take all of a
  plate's new genes without dropping something.
- **Opponents may run over budget, and say so.** The lab shows each opponent's kb next to the
  player's budget. An "easy" opponent is at or under budget; "hard" may run 15 to 25% over.
- **New genes hook existing systems** (fragments, hubs and veins, contest, probes, retraction, food
  memory) so that behaviour emerges from interactions, not from new special cases.
- **Everything is data.** New terrain and food are placement records in a plate; the lamp cycle is a
  plate flag; opponents are genomes; difficulty is a number.

## 4. Gene catalogue (proposed)

39 genes: the 16 existing (four rebalanced) and 23 new. Costs are a first proposal; section 11
gives the targets they are tuned against. "Hook" names the part of `Battle.prototype.step` or the
helper the gene lives in.

### 4.1 Existing genes, with changes

| Gene | Change | Why |
|---|---|---|
| Cytoplasmic Healing | heal 1.0 → 0.8 HP/min, cost 0.02 → 0.06 ATP per HP | Measured: default + Healing 7/8 → 6/8 against the default; Healing-for-Crush swap 4/8 → 3/8; Healing-for-Chitin swap 2/8 → 0/8. Still worth 2 kb, no longer free. |
| Alkaline Slime | acid ×0.35 → ×0.25; haze ×0.6 → ×0.5; acid's contest push bonus removed when the defender has Slime | Target: equal-cost Slime build against the acid build 4/8. |
| Oxalic Acid | contact damage 2.4 → 1.8; energy per burn 0.03 → 0.06 | Target: acid build against the Density 3 build ≤ 6/8. Granite dissolving unchanged. |
| Reserve Granules | reserve ×2.5 → ×1.8; a starving fragment with Granules retracts at half rate and takes no starvation damage for its first 60 starving minutes | Measured as a net loss on fed plates; it should buy famine time, not throttle growth. |
| Ligninase | usable from D-02 (unlock 2) | The D-02 rival eats bark in front of the player. |
| Necrotrophy | unchanged | 39/64 in the arena at 2 kb is about right. |
| others | unchanged | |

### 4.2 New genes

**Metabolism** (what it eats, and how it keeps warm)

| Gene | kb | Plate | Mechanic | Hook |
|---|---|---|---|---|
| Saprotrophy | 2 | P5 | Every cell that dies (either side, any cause other than retraction or pruning) on plain agar leaves detritus worth 4 + 8 × mass ATP, decaying 2%/min. Only saprotrophs eat it (eat 1.0, yield 1.0). A battle line feeds the saprotroph whichever way it goes. | step 8 (apply damage), income loop; detritus is "known" whenever in range without a pile id |
| Chitinase | 2 | P6 | Digests the mycelial mat (new food, section 5.1). | income loop, `eat[]` |
| Thermogenesis | 2 | P7 | A cell with at least five own neighbours counts as warm on chilled agar: it eats and thickens at full rate, and pays full upkeep for it. Sheets cross the cold; tendrils still freeze. The dense strain's answer to the shelf. | income loop, `mature()`, upkeep |
| Lipase | 2 | P8 | Digests oil droplets (new food). | income loop |
| Circadian Reserve | 2 | P9 | 40% of each fragment's intake goes into a bank that pays out evenly over the next 120 minutes. The bank splits and merges with the fragment like its energy. A lamp-fed strain eats through the night; a mat grazer rides out gaps. | income loop, `label()`, `settle()` |

**Defense** (what it shrugs off)

| Gene | kb | Plate | Mechanic | Hook |
|---|---|---|---|---|
| Melanin | 1 | P4 | UV damage ×0.4 (0.55 → 0.22/min). No feeding. Growth onto lit agar penalty −0.25 → −0.05. The cheap alternative to Algal Symbiont on a plate where the food under the lamp is worth more than the light. | step 5, `grow()` |
| Efflux Pumps | 2 | P5 | Immune to antibiotic damage from the haze gene and from antibiotic discs (section 5.2). Alkaline Slime stays the partial, general answer. | haze loop, disc hazard |
| Antifreeze Proteins | 2 | P7 | Full growth and eating on chilled agar, and the halved upkeep everyone gets there. Thin tendrils cross the shelf as if it were warm. | income loop, `grow()` |
| Encystment | 2 | P7 | A fragment of 15 cells or fewer that has fed nothing for 10 minutes goes dormant (as Sclerotia: damage ×0.4, upkeep ×0.15) and wakes when it merges with a feeding fragment. Cut-off pieces survive as seeds instead of starving. Sporelings are exempt for their first 10 minutes. | step 4 dormancy |
| Photolyase | 1 | P9 | While the lamp is off, cells heal 1.5 HP/min extra for 0.03 ATP per HP. Repairs the day's burns overnight; does nothing on a plate without a lamp cycle, which its description says. | step 5 |
| Cryptic Cortex | 2 | P10 | Rivals sense this strain's cells only within half their sensor range, and remember them (Pheromone Trail) for 20 minutes instead of 60. Reaches food unhunted; the counter to trackers. | rival's `scent()` |

**Offense** (how it hurts rivals)

| Gene | kb | Plate | Mechanic | Hook |
|---|---|---|---|---|
| Brine Glands | 2 | P3 | Cells the strain withdraws (retraction or pruning) leave salt crust on plain agar. With Osmotic Pumps the strain walls itself in; without them it salts its own ground, which the description says. Area denial from the famine and pruning systems. | `retract()`, `prune()`; terrain changes per frame (section 12) |
| Lytic Enzymes | 3 | P8 | Engulf damage against a rival cell is multiplied by 1 + 1.5 × its vein strength, the extra dealt as "Severed" (the unused source). Growth and infiltration scoring favour high-vein rival cells. Kills on trunks cut the rival's network apart and the fragment system does the rest. Costs 0.03 ATP per bonus hit. | step 6, 6b, `grow()` |
| Phagocytic Surge | 2 | P10 | Engulf ×2.2 for the first 10 minutes of every hour, ×0.75 otherwise (hourly average 0.99). Bursts break lines that steady pressure cannot, because healing is per minute. Counter: Density (hit points), not Healing. | step 6, 6b via a per-side factor |

**Network** (how it manages its veins and its budget)

| Gene | kb | Plate | Mechanic | Hook |
|---|---|---|---|---|
| Anastomosis | 2 | P3 | A growth candidate adjacent to an own cell of a different fragment scores +2.5, within two cells +1.0. Split networks rejoin; fragments that touch already merge. The counter to severing and to mazes. | `grow()` |
| Apical Growth | 1 | P4 | Probes reach ×1.5 and last ×1.5; growth along a probe gets ×1.4 the bonus; front cohesion (tension) is halved. Long thin exploratory spikes. | `probe()`, `grow()` |
| Migratory Streaming | 2 | P6 | A fragment whose income falls under 60% of its upkeep while it knows of food it is not eating starts migrating: it retracts tips at 3%/min from the cells farthest from the nearest known food, not starving, and the refunded energy funds growth toward that food. The body flows across the plate from pile to pile. | step 4 flag, `retract()` ordering by food distance |
| Torpor | 1 | P7 | Upkeep ×0.7 everywhere; growth rate ×0.7 (both growth terms). The lean strain's gene: it holds what it has through a famine and gains ground slowly. | `deriveSide()` |
| Sclerotised Veins | 2 | P8 | Cells with vein strength ≥ 0.5 take half damage from every source and have a 1.4× HP cap; upkeep +0.0008. The counter to Lytic Enzymes. | damage application, `hpCap()` |

**Sensing** (what it notices), a new category

| Gene | kb | Plate | Mechanic | Hook |
|---|---|---|---|---|
| Granite Scent | 1 | P2 | Sensing passes through granite and glass (sensing distance treats them as open; growth and pathing still cannot). The strain knows what lies behind a wall. | `scent()` step cost for the sensing field only |
| Pheromone Trail | 1 | P6 | Rival tissue once sensed is remembered for 60 minutes and keeps pulling the Hunt drive after it leaves range. Hunting at low Sensor range becomes viable; broken-off rival pieces get chased. | `scent()` rival field |
| Negative Phototaxis | 2 | P9 | In the 20 minutes before the lamp comes on, cells on lit agar are withdrawn tips-first with the usual energy refund; while the lamp is off, growth onto lit agar scores +0.6 with no penalty. The night raider: it takes the lit piles every dusk and gives them up every dawn. | `retract()` trigger, `grow()` |
| Chemorepulsion | 1 | P10 | Growth candidates within three cells of rival tissue score −1.2 and the strain never infiltrates. It declines fights it did not choose and wins on territory. Pairs with armoured, healing bodies. | `grow()` |

### 4.3 Catalogue by plate

| Plate | Genes usable from here | kb of new options | Budget | Rise |
|---|---|---|---|---|
| P1 | Amylase, Protease, Chitin Rind, Pseudopod Crush, Cytoplasmic Healing, Vein Pruning | 9 | 12 | |
| P2 | Oxalic Acid, Ligninase, Alkaline Slime, Granite Scent | 8 | 15 | +3 |
| P3 | Osmotic Pumps, Brine Glands, Reserve Granules, Anastomosis | 7 | 17 | +2 |
| P4 | Algal Symbiont, Melanin, Sclerotia, Apical Growth | 7 | 19 | +2 |
| P5 | Antibiotic Haze, Efflux Pumps, Necrotrophy, Saprotrophy | 9 | 22 | +3 |
| P6 | Chitinase, Spore Cannons, Migratory Streaming, Pheromone Trail | 8 | 25 | +3 |
| P7 | Antifreeze Proteins, Thermogenesis, Torpor, Encystment | 7 | 28 | +3 |
| P8 | Lipase, Lytic Enzymes, Sclerotised Veins | 7 | 31 | +3 |
| P9 | Circadian Reserve, Negative Phototaxis, Photolyase | 5 | 33 | +2 |
| P10 | Phagocytic Surge, Chemorepulsion, Cryptic Cortex | 5 | 35 | +2 |

All genes together cost 72 kb, all traits and drives maxed 33 kb. A final-plate genome holds about a
third of what exists. Every budget rise is at most half the kb introduced, which is goal 5 in one
rule (checked by `tools/balance/costs.js`).

## 5. New plate features

### 5.1 Foods

| Food | Enzyme | Eat/min | Yield | Placement | Behaviour |
|---|---|---|---|---|---|
| Mycelial mat | Chitinase | 0.4 | 1.6 | `mat(cx, cy, rad, amt)` seeds | Every 15 minutes each mat cell holding at least 40% of its starting food seeds one neighbouring empty plain-agar cell (no owner, no food) with 60% of its own, in cell order, up to a per-plate cap of 260 mat cells. Cells under an organism do not spread. Food that appears where nobody is, so a grazer that follows the mat's edge is fed all day. |
| Oil droplet | Lipase | 0.3 | 3.0 | `pile(F_OIL, …)` radius 0.6 to 0.9 | One to four cells, 100 to 160 food each: nearly an ATP a minute for hours from a spot the size of a tendril. Placed far apart near the rim, so finding them is the game. |
| Detritus | Saprotrophy | 1.0 | 1.0 | none: left by deaths | Decays 2%/min. Never overwrites placed food. Counted as known whenever in sensor range. |

Spreading mat and detritus are deterministic functions of the battle state, so a plate's layout still
depends on no seed.

### 5.2 Terrain

| Terrain | Passable | Effect | Key |
|---|---|---|---|
| Antibiotic disc | the paper disc itself (radius 1.2) is impassable; its halo (radius 4) is agar | cells in the halo take 0.9 HP/min as "Antibiotic" (Slime ×0.5, dormant ×0.4); growth into the halo scores −0.4 | Efflux Pumps: immune, no penalty. Lawn is placed in the halo, where no other bacteria graze it. |
| Glass beads | no | indissoluble, blocks sensing | none. A maze wall acid cannot shortcut. Granite Scent sees through it. |
| Chilled agar | yes | upkeep ×0.5 for every strain. A strain that is not adapted grows onto it at ×2.0 cost, eats at ×0.3 rate and scores −0.3 to grow there. No damage: the cold slows, it does not kill. | Antifreeze Proteins (any cell), or Thermogenesis (cells with five or more own neighbours). |

Granite (acid dissolves), salt (Osmotic Pumps) and the lamp (Algal Symbiont, now also Melanin) stay.

### 5.3 Plate flags

| Flag | Effect |
|---|---|
| `cycle: 240` | The lamp runs on a cycle of that many minutes, on for the first half. A round starts at dawn. While the lamp is off, lit agar is plain agar: no UV, no Symbiont income, no growth penalty; lawn on lit cells regrows only while the lamp is off (bacteria die under UV). The clock shows a sun or moon. |

## 6. The default strain and plate 1

The default genome stays as it is: Vigor 2, Density 2, Sensor 2, Seek food 3, Hunt 1, Explore 2,
Amylase, Protease, Chitin Rind, Pseudopod Crush, 12 kb, filling the plate 1 budget exactly. It is a
sound generalist, which is the point: the plate 1 opponents are specialists that each punish one of
its habits. The field notes already name two of them (too little Hunt against a rusher, growth it
cannot feed); a note for over-exploring a small plate is to be added.

The harness shows that with plate 1 genes alone, no opponent at 11 to 13 kb beats the default (eight
candidates tried, the default won 5/8 to 8/8 against all of them). The default is close to the best
12 kb plate 1 genome. So plate 1 opponents run **13 to 14 kb**, which the lab shows ("14 kb, over
your budget"), and each has a hole a trade-off exploits.

| Opponent | Archetype | Genome | kb | Default's rounds (4 seeds, today's numbers) | Counter found by hill-climb under 12 kb |
|---|---|---|---|---|---|
| Fuligo minor | Rusher | V2 D3 S2 · Seek 3 Hunt 3 Explore 1 · Amylase, Protease, Crush, Chitin | 14 | 2/4 | Seek −1, Explore −1, + Healing: 4/4 (3 edits) |
| Didymium ferox | Healer-hunter | V2 D2 S2 · Seek 3 Hunt 3 Explore 1 · Amylase, Protease, Crush, Healing | 13 | 2/4 | Vigor −1, Seek +1: 4/4 (2 edits, a pure trade) |
| Diderma lentum | Miser | V1 D3 S3 · Seek 4 Hunt 1 Explore 1 · Amylase, Protease, Chitin, Healing, Pruning | 14 | not yet run | intended: out-eat it (Vigor 3, Explore 3, Pruning, drop Crush) and hold the dish at 12:00 |

These are starting points, measured before the Healing rebalance, which will shift them. The plate 1
trio is tuned last (section 11.3), to these targets: the default wins at most 1/8 rounds against
each; a counter at most three single steps away wins at least 6/8; the three counters differ.

Why the default cannot simply add a gene: it is at 12/12. Every counter above drops something
(Explore, Vigor, a drive level) to pay for what it adds, which is the trade-off goal 3 asks for.

## 7. Plates

For each plate: the layout change, the gate, the new genes, and three opponents with cost and
difficulty (● easy, ●● medium, ●●● hard). "Carried strain" means a strain using only genes from
earlier plates. Opponent genomes are written V D S for Vigor, Density, Sensor range, then
Seek/Hunt/Explore.

### P1 · Oat Flake Plate · 12 kb

Layout as today (plain agar, oats, two lawns). No gate: the plate teaches trade-offs. Opponents as in
section 6. Difficulty: Didymium ●, Fuligo ●●, Diderma ●●.

### P2 · Granite Maze · 15 kb

Layout: keep the ring **with its gaps** (a sealed ring slows the acid rival more than the player,
measured). Raise the bark in the ring to about 55% of the plate's food and shrink the outer oat
piles. Add two glass-bead stubs that lengthen the walk round the dividing wall.

Gate: bark (Ligninase) inside a ring every opponent can reach. New genes: Oxalic Acid 3, Ligninase 2,
Alkaline Slime 2, Granite Scent 1 (8 kb for +3).

| Opponent | Genome | kb | Diff | How it beats a carried strain | Intended answers |
|---|---|---|---|---|---|
| Lycogala corrodens | V2 D2 S3 · 3/3/1 · Amylase, Acid, Ligninase | 14 | ●● | eats the bark, burns through to you | Ligninase to contest the ring; Slime against the acid; or Acid yourself and race |
| Comatricha tenax, Wall-runner | V3 D2 S4 · 4/1/3 · Amylase, Protease, Pruning, Granite Scent | 16 | ● | knows every oat pile through the walls and takes them first; no bark | Ligninase: the bark is yours alone; or Hunt it, it does not fight |
| Diderma saxicola, Ring squatter | V2 D3 S3 · 3/2/1 · Amylase, Ligninase, Acid, Slime, Chitin | 18 | ●●● | sits on the bark behind acid and slime, dense | Ligninase + Acid to open a second way in; Density 3; or starve it out by holding every oat pile and winning at 12:00 |

### P3 · Salt Pan · 17 kb

Layout as today: 81% of the food on salt. Gate: Osmotic Pumps. New genes: Osmotic Pumps 1, Brine
Glands 2, Reserve Granules 2, Anastomosis 2 (7 kb for +2).

| Opponent | Genome | kb | Diff | How it beats a carried strain | Intended answers |
|---|---|---|---|---|---|
| Stemonitis lorica | V2 D3 S3 · 4/2/1 · Amylase, Protease, Ligninase, Chitin, Osmo, Healing, Pruning | 19 | ●● | eats everything on the salt while you starve on the rim | Osmo + Ligninase; drop Crush, it hardly fights |
| Mucilago crustacea, Crust | V2 D3 S2 · 4/1/1 · Amylase, Ligninase, Osmo, Brine Glands, Pruning, Chitin | 16 | ● | prunes and salts behind itself, walling the centre in | Osmo makes its walls yours too; Anastomosis to rejoin pieces it cuts off |
| Badhamia salina, Salt raider | V3 D2 S3 · 3/4/2 · Amylase, Protease, Osmo, Crush, Acid | 19 | ●●● | crosses the salt fast and attacks you on it | Osmo + Chitin + Density; or Osmo + Granules and sit on the bark |

### P4 · Sunlit Shallows · 19 kb

Layout as today, plus one more bark pile under the central lamp (so the choice between feeding on
light and eating under it is real). Gate: UV. New genes: Algal Symbiont 3, Melanin 1, Sclerotia 2,
Apical Growth 1 (7 kb for +2).

| Opponent | Genome | kb | Diff | How it beats a carried strain | Intended answers |
|---|---|---|---|---|---|
| Ceratiomyxa lumina | V3 D3 S3 · 3/2/2 · Symbiont, Amylase, Sclerotia, Pruning | 17 | ●● | lives on light you cannot touch; sleeps through famine | Symbiont and fight it for the lit pools; or Melanin + Ligninase and out-eat it |
| Lamproderma scintillans, Shade-runner | V3 D2 S3 · 4/1/3 · Amylase, Ligninase, Melanin, Pruning, Apical Growth | 16 | ● | spikes out to the bark under the lamps and eats it wearing melanin | Melanin + Ligninase to contest the bark; it is thin, so Hunt it |
| Physarum solare, Solar brawler | V3 D3 S3 · 2/3/1 · Symbiont, Crush, Acid, Sclerotia | 19 | ●●● | fed by the lamp, it has no piles to defend and hunts you | Symbiont + Slime + Chitin; or Melanin and avoid the light, win at 12:00 |

### P5 · Bacterial Bloom · 22 kb

Layout: today's lawns, with three antibiotic discs placed so that about 60% of the lawn lies in a
halo. The small oat pile stays in the centre. Gate: antibiotic halos (Efflux Pumps, or Slime at a
price). New genes: Antibiotic Haze 3, Efflux Pumps 2, Necrotrophy 2, Saprotrophy 2 (9 kb for +3).

| Opponent | Genome | kb | Diff | How it beats a carried strain | Intended answers |
|---|---|---|---|---|---|
| Badhamia vorax | V4 D2 S4 · 3/4/1 · Protease, Amylase, Acid, Crush, Efflux | 23 | ●●● | grazes inside the halos and runs you down | Efflux to share the halos; Chitin + Density against the rush |
| Physarum cinereum, Lawn haze | V2 D3 S3 · 4/2/1 · Protease, Haze, Slime, Efflux, Pruning | 18 | ●● | poisons the lawn edge and sits on regrowing food | Efflux (immune to its haze too); or Haze yourself and trade |
| Metatrichia vesparium, Carrion | V3 D2 S3 · 3/4/2 · Protease, Amylase, Saprotrophy, Necrotrophy, Crush | 19 | ●● | every fight feeds it; it ignores the halos | refuse the fight: Efflux into the halos and hold them; Saprotrophy back |

Today a plate 1 tank beats this plate 8/8. With 60% of the lawn under halos the tank is left with
the oats and the open lawn against three strains grazing the rest.

### P6 · Mycelial Mat · 25 kb (new)

Layout: a few oat flakes near each start; six mat seeds across the middle third of the dish; a
glass-bead bar across the centre with one gap, so the mat spreads on both sides and the two sides
meet late. Gate: the mat (Chitinase). New genes: Chitinase 2, Spore Cannons 3, Migratory Streaming 2,
Pheromone Trail 1 (8 kb for +3).

| Opponent | Genome | kb | Diff | How it beats a carried strain | Intended answers |
|---|---|---|---|---|---|
| Badhamia utricularis, Mat grazer | V3 D2 S3 · 5/1/2 · Chitinase, Amylase, Pruning, Streaming, Healing | 19 | ● | follows the mat as it spreads, leaving nothing behind | Chitinase; cut it off with Hunt where the mat is thin |
| Cribraria aurantiaca, Sporulator | V2 D2 S4 · 4/1/3 · Chitinase, Spores, Granules, Pruning, Amylase | 20 | ●● | sporelings land on every patch of mat | Chitinase + Hunt the sporelings while small; Pheromone Trail to track them |
| Stemonitis fusca, Mat warden | V3 D3 S3 · 3/3/1 · Chitinase, Haze, Efflux, Chitin, Crush | 21 | ●●● | holds the mat behind a haze | Chitinase + Efflux; Spores to seed mat it does not hold |

### P7 · Cold Shelf · 28 kb (new)

Layout: a chilled band across the middle third of the dish holds the big oat piles and two bark
piles; a glass-bead reef runs along the band's spine. The warm rims have one small lawn near each
start, enough to live on, not to win on. Gate: the cold (Antifreeze Proteins, or Thermogenesis for a
sheet). The famine plate: upkeep is halved on the shelf, so the strain that can eat there can also
afford to wait there. New genes: Antifreeze Proteins 2, Thermogenesis 2, Torpor 1, Encystment 2
(7 kb for +3).

| Opponent | Genome | kb | Diff | How it beats a carried strain | Intended answers |
|---|---|---|---|---|---|
| Lamproderma columbinum, Shelf grazer | V3 D2 S4 · 4/2/2 · Amylase, Ligninase, Antifreeze, Pruning, Torpor, Granules, Healing | 23 | ● | eats the shelf at full rate while you nibble at a third of it, and Torpor keeps it fed all night | Antifreeze + Ligninase; it fights poorly, so Hunt it where it leaves the shelf |
| Diderma niveum, Snowbank | V2 D4 S3 · 3/3/1 · Amylase, Ligninase, Thermogenesis, Chitin, Encystment, Healing, Crush | 24 | ●● | a Density 4 sheet that warms itself and encysts whatever you cut off | Antifreeze tendrils outrun its sheet to the food; Acid + Crush at its thin edge; or out-eat it, it is slow |
| Physarum alpinum, Frost raider | V4 D2 S4 · 3/4/2 · Amylase, Protease, Antifreeze, Crush, Acid, Pheromone Trail, Efflux | 27 | ●●● | fast on the shelf and hunts you across it, tracking what it has seen | Antifreeze + Chitin + Density; Encystment so cut pieces survive; Granules to wait it out |

### P8 · Glass Bead Labyrinth · 31 kb (new)

Layout: a labyrinth of glass beads fills the middle; oil droplets sit in the rim pockets, nine to
twelve of them far apart; two small oat piles near the starts. Gate: oil (Lipase) at the end of long
thin veins. New genes: Lipase 2, Lytic Enzymes 3, Sclerotised Veins 2 (7 kb for +3).

| Opponent | Genome | kb | Diff | How it beats a carried strain | Intended answers |
|---|---|---|---|---|---|
| Trichia favoginea, Prospector | V3 D2 S4 · 4/1/4 · Lipase, Amylase, Apical Growth, Pruning, Granite Scent | 19 | ● | finds every droplet first | Lipase + Explore; its veins are long and thin, so Lytic Enzymes cut it |
| Arcyria incisa, Vein-cutter | V3 D2 S4 · 3/4/2 · Lipase, Lytic, Pheromone Trail, Crush, Acid | 24 | ●●● | severs the trunks between your droplets and starves the pieces | Sclerotised Veins; Anastomosis to rejoin; Encystment or Granules to wait |
| Hemitrichia serpula, the Net | V2 D3 S3 · 4/2/2 · Lipase, Anastomosis, Sclerotised Veins, Granules, Pruning, Amylase, Healing | 22 | ●● | cannot be cut apart and holds its droplets all day | out-find it: Lipase + Apical Growth; or Lytic + Surge later |

### P9 · Day and Night · 33 kb (new)

Layout: Sunlit Shallows scaled up, with `cycle: 240`. A large central lamp and two side lamps cover
the big oat piles and the bark; lawns lie in the dark rim near each start and under the lamps, where
they regrow only at night. Gate: time. By day only a light-tolerant strain holds the lit piles; by
night a lamp-fed strain has no income unless it banked some. A strain carried from P4 with Algal
Symbiont starves every night; one without it burns every day. New genes: Circadian Reserve 2,
Negative Phototaxis 2, Photolyase 1 (5 kb for +2).

| Opponent | Genome | kb | Diff | How it beats a carried strain | Intended answers |
|---|---|---|---|---|---|
| Didymium nigripes, Night-shift | V4 D2 S4 · 4/2/3 · Amylase, Protease, Ligninase, Negative Phototaxis, Photolyase, Melanin, Pruning, Apical Growth | 25 | ● | thin and fast, it takes the lit piles every dusk and withdraws at dawn, healing overnight | Symbiont, or Melanin + Photolyase, to hold the piles by day; Hunt it at dawn as it withdraws |
| Physarum viride, Day-shift | V3 D3 S4 · 3/3/2 · Symbiont, Circadian Reserve, Amylase, Ligninase, Sclerotia, Pruning, Healing | 26 | ●● | fed by the lamp by day and by its bank by night; sleeps if the bank runs dry | raid the lit piles at night with Negative Phototaxis; or Symbiont + Circadian Reserve and fight it for the lamp |
| Fuligo septica, the Yellow Sheet | V3 D4 S3 · 3/3/1 · Symbiont, Circadian Reserve, Granules, Chitin, Crush, Acid, Slime, Amylase | 29 | ●●● | a dense day-fed tank with the reserves to fight all night | it eats only oats and light: hold the lawns and bark and the dark rim; Chemorepulsion later; Lytic Enzymes on its trunks |

### P10 · The Elder Plasmodium · 35 kb

Layout: today's ring, lamp, salt line and bark, plus one antibiotic disc on a lawn, two mat seeds in
the ring, oil droplets at the rim, a chilled band along one axis, and the lamp on a 240-minute cycle.
Every gate at once; no opponent holds every key. New genes: Phagocytic Surge 2, Chemorepulsion 1,
Cryptic Cortex 2 (5 kb for +2).

| Opponent | Genome | kb | Diff | How it beats a carried strain | Intended answers |
|---|---|---|---|---|---|
| Physarum senex | V3 D3 S5 · 3/3/2 · Amylase, Protease, Ligninase, Acid, Slime, Chitin, Healing, Osmo, Pruning, Symbiont, Efflux, Chitinase, Lipase, Antifreeze | 41 | ●●● | eats everything, everywhere, day and night | it has no Sclerotised Veins, Anastomosis or Circadian Reserve: Lytic Enzymes and cut it apart; Surge to break its lines; it is hungriest at night |
| Brefeldia maxima, the Hydra | V2 D3 S4 · 4/2/2 · Amylase, Protease, Chitinase, Lipase, Anastomosis, Sclerotised Veins, Healing, Granules, Pruning, Thermogenesis, Osmo | 30 | ●● | an unkillable network that wins on territory at 12:00 | out-eat it: it has no Symbiont, Efflux or Antifreeze, so the lamp by day, the halo and the thin cold are yours |
| Leocarpus fragilis, the Plague | V4 D2 S5 · 2/5/1 · Protease, Saprotrophy, Haze, Lytic, Surge, Acid, Efflux, Cryptic Cortex | 35 | ●●● | pure aggression, fed by what it kills, and hard to see coming | Chemorepulsion + Sclerotised Veins + Healing and let it starve on a bare lawn; Encystment so cut pieces survive; it cannot be tracked, so hold ground rather than hunt |

## 8. Opponent selection

### 8.1 Data

```js
// in LEVELS[i]
rivals: [
  { name: 'Fuligo minor', tag: 'Rusher', diff: 2, blurb: 'Fights from the first minute.',
    vigor: 2, density: 3, sense: 2, genes: [...], taxis: { food: 3, hunt: 3, explore: 1 } },
  ...
]
```

`LEVELS[i].rival` goes away; the rack and lab read `rivals`. `prog.pick[i]` holds the player's
choice for plate i: an index, or absent for random. The match record gets `rival` (the index drawn
or chosen) and `pink` is `LEVELS[level].rivals[rival]`; every round of the match uses it. Versus
matches are unchanged.

### 8.2 Lab

The "Rival specimen" row becomes a picker: a segmented control reading `Random · Fuligo · Didymium ·
Diderma`, each named button carrying its difficulty pips and kb. Under it, the selected strain's
card as today (traits, drives, gene chips) and a one-line blurb; with Random selected, the three
cards are shown small side by side. Each card shows "14 kb" and, when over the player's budget,
"over your 12". A tick marks opponents already beaten on this plate (`prog.beaten[i]`, an array of
booleans). The plate is cleared on the first win against any opponent, as today; beating all three
earns a "Rack clear" chip on the dish card and nothing else.

The rack's dish card reads "vs. 3 strains" with the beaten ticks.

### 8.3 Match flow

Inoculate draws the rival if Random is selected (uniform over the three, from `crypto` like the
seeds) and names it in the round card, the clock and the summary. The summary's field notes refer to
the opponent by name. "Revise genome" returns to the lab with the same pick selected, so a retry
against the same strain is one click; Random stays Random and redraws.

### 8.4 Preview

The rack's hover preview and the lab preview use the selected opponent or, for Random, the first.

## 9. Carry-forward and the rack

Already how the game works, kept: the lab strain carries from plate to plate; any saved strain can be
loaded; genes not yet isolated are stripped on load. Additions:

- The summary's "New genes isolated" block adds the kb line: "7 kb of new options, your budget rose
  by 2", so the pressure of goal 5 is visible at the moment it starts.
- Opening a new plate shows the budget meter with the headroom highlighted.
- `cleared` and `beaten` grow to ten entries; `migrateProg` pads old saves with `false`.

## 10. Why a carried strain loses on every new plate

| Plate | What a carried strain cannot do | Share of food it loses | Opponents all have |
|---|---|---|---|
| P2 | eat bark | ~55% | Ligninase, or only oats and a hunter's answer |
| P3 | stand on salt | 81% | Osmotic Pumps |
| P4 | stand in light | ~50% and the light itself | Symbiont or Melanin |
| P5 | stand in a halo | ~60% of the lawn | Efflux Pumps |
| P6 | eat the mat | ~80% | Chitinase |
| P7 | eat or grow on the shelf at full rate | ~75% | Antifreeze Proteins or Thermogenesis |
| P8 | eat oil | ~85% | Lipase |
| P9 | hold lit piles by day and stay fed by night | ~70% by day, all income by night for a lamp-fed strain | Circadian Reserve, or Negative Phototaxis, or Melanin with Photolyase |
| P10 | one of the above, at least | ~70% in total | a different subset each |

Comatricha tenax (P2) is the one opponent without the plate's key; it is marked easy and is beaten
by a carried hunter, which is deliberate: one accessible win per plate for a player who refuses the
new genes, and then two that cannot be had that way. If testing shows that makes P2 too soft,
Comatricha gets Ligninase and loses Protease.

## 11. Validation

### 11.1 Harness

The scripts live in `tools/balance/` and load the simulation block out of `index.html` at run time,
so there is nothing to extract or keep in sync. Each is a Node script; the folder's README has the
options.

- `sim.js`: the loader. `harness.js`: shared helpers, `series(level, gP, gE, seeds)` for round wins,
  average share and end reasons; `climb()` for the greedy hill-climb.
- `baseline.js`: costs and budgets; the default against every opponent, both corners; mirror matches;
  each plate's opponents carried onto the next plate.
- `genesweep.js`: marginal value of each single edit to a genome against an opponent.
- `climb.js`: greedy hill-climb from a genome toward a counter, under a budget and a gene whitelist,
  reporting the edit path (this is what measures "how far is the counter").
- `carry.js`: archetypes from earlier plates' genes at a plate's budget against each opponent, and
  the hill-climb form of the same test.
- `arena.js`: round robin among builds on a neutral plate.
- `gating.js`: food reachable and edible by terrain key, per plate.
- `costs.js`: kb of the proposed catalogue and roster, and the budget rule.

### 11.2 Acceptance tests

Each over 8 seeds unless noted.

| Goal | Test | Pass |
|---|---|---|
| 3 | default vs each P1 opponent | default ≤ 1/8 |
| 3 | `climb` from the default, P1 genes, 12 kb, 3 steps, vs each P1 opponent | ≥ 6/8; the three paths differ |
| 4 | `climb` from the default, genes of plates < k, budget of plate k, 4 steps, vs each opponent of plate k | ≤ 2/8 for every opponent except the one marked as the accessible win |
| 4 | each opponent of plate k vs each opponent of plate k−1 (carried) on plate k | ≥ 6/8 |
| 4 | 200 random genomes from earlier genes at plate k's budget, 2 seeds each, vs the plate's hard opponent | mean ≤ 0.1 |
| 5 | budget rise ≤ half the kb of new genes | by construction, table 4.3, `costs.js` |
| 2 | each opponent beaten by some genome within budget using the plate's genes (`climb`, 5 steps) | ≥ 6/8, and the hard one needs more steps than the easy one |
| balance | mirror match of every opponent against itself | gold 3/8 to 5/8 |
| balance | arena of every 3 kb gene build at 16 kb | no build above 50/64 |
| balance | each defensive gene's build vs the build it counters, equal cost | 3/8 to 5/8 |
| P9 | a P4 Symbiont strain at 33 kb vs each P9 opponent | ≤ 2/8 (the night starves it) |

### 11.3 Tuning order

1. Rebalance Healing, Slime, Acid, Granules; rerun the arena and counter tests until 11.2's balance
   rows pass.
2. Implement the new foods, terrain, the lamp cycle and the genes; run `gating` on every plate.
3. Tune plates P2 to P10 and their opponents against the goal 4 rows, hardest opponent first.
4. Tune the P1 trio last against the goal 3 rows, since every earlier change moves it.
5. Rerun everything; a close pairing is rerun over 16 seeds before its numbers are trusted.

## 12. Implementation notes

- **Terrain in the renderer** is packed as red = salt, green = light, blue = rock in one texture.
  Three new types (disc halo, glass, chilled agar), one terrain that changes during play (brine) and
  one that switches on and off (the cycling lamp) need a type index per cell instead, a per-frame
  terrain layer or a change list (rock dissolving already uses the matter channel), and a per-frame
  lamp state. Thumbnails, `plateIntel` chips, `dishFacts`, the inspector's ground names and
  `TERR_NAMES` all gain entries.
- **Foods**: `FOOD_NAMES`, `FOOD_COL`, `FOOD_ENZ`, `EAT_RATE`, `YIELD`, the field notes' uneaten and
  undiscovered checks, and the "food" event all index by type; three new types extend each. Detritus
  and mat growth write to `food`/`foodType` during `step`, so `food0` is no longer the only source of
  "there was food here" for the matter channel; record a per-frame food cap instead.
- **Fragments** gain a second pool for Circadian Reserve (`F.bank`), split and merged by cell count
  exactly as `F.energy` is in `label()` and `settle()`.
- **Sensing**: Cryptic Cortex and Granite Scent both change the step costs and sources in `scent()`;
  the sensing field is per side, so one side's cortex changes only the other side's field.
- **Damage sources**: "Severed" (7) is dealt by Lytic Enzymes; `SRC_COL[7]` exists already.
- **Field notes** (`analyze`) gain lines for: uneaten mat, oil, detritus; halo deaths (Efflux);
  UV deaths now offer Melanin as the cheap answer; vein losses to Severed (Sclerotised Veins,
  Anastomosis); a migrating body ("your strain moved N times"); cold eating ("you ate at a third
  of the rate on the shelf"); night starvation on a cycling plate (Circadian Reserve).
- **Gene cards**: a Sensing category with its own glyph and note ("what it notices").
- **Clock**: on a cycling plate the HUD clock shows a sun or moon and the timeline shades the nights.
- **Save format**: `prog.pick`, `prog.beaten`; `cleared` padded to ten. The versus cap menu adds 25,
  28, 31, 33 and 35. Opponent genomes are validated by `normGenome` on load like any other.
- **Performance**: the mat spread, detritus decay, migration ordering and the neighbour count for
  Thermogenesis are O(cells) per minute and fit the existing per-tick loops. Lytic scoring reads
  `vein[]`, already computed.
- **Determinism**: nothing new reads `Math.random`; mat spreading and migration order use cell
  order, the lamp cycle reads the tick, and anything with a choice uses `this.rnd`.
- **Exports**: `index.html` now also exports the terrain constants, the start cells and the food
  tables for the harness; this changes nothing in the browser.

## 13. Open questions and later ideas

- Should the hard opponent on each plate be excluded from the random draw on a player's first visit?
  The design draws uniformly; a first-visit weighting toward the easy one is a one-line change.
- Whether an opponent beaten on a plate should be loadable into the rack (it is a genome). It would
  let players study and modify it. Proposed: yes, via a copy button on the opponent card, named after
  the strain; genes not yet isolated are stripped as for any load.
- Brine Glands change terrain permanently within a round. Whether salt laid by a strain should decay
  (brine dries, then dissolves back into the agar over an hour) is a tuning question for the
  fortress strategy.
- The hourly surge phase is global (minute of the hour). A per-side phase offset from the seed would
  make surges between two Surge strains miss each other; the design keeps it global so the player
  can read the clock.
- The lamp cycle is 240 minutes, three cycles in a round. A longer cycle (360, two cycles) makes
  nights harsher and the Circadian bank more valuable; the harness should try both before the number
  is fixed.
- Chilled agar halves upkeep for everyone. If a carried strain ends up parking on the shelf to wait
  out the round, the halving can be limited to adapted strains.

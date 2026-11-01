// Goal 4: strains using only the genes of earlier plates, at a plate's budget, against each of its opponents.
// Two forms. Archetypes (built in, or --archetypes file.json holding {name: genome}) are run as they are, so a
// build over budget is reported, not rejected. With --climb the hill-climb starts from the default with the genes
// of the plates before and the plate's budget: the strongest carried strain a greedy search finds.
// node tools/balance/carry.js [--from 1] [--to N] [--seeds 8] [--archetypes file.json] [--climb] [--steps 4]
const fs = require('fs');
const H = require('./harness.js');
const { LEVELS, genomeCost, series, fmt, seeds, rivalsOf, rivalName, args, climb, genesUpTo, DEFAULT } = H;
const o = args(), from = +(o.from || 1), to = Math.min(LEVELS.length - 1, +(o.to || LEVELS.length - 1)), sd = seeds(+o.seeds || 8);
const ARCHETYPES = {
  brawler:  { vigor: 3, density: 3, sense: 2, genes: ['amylase', 'protease', 'chitin', 'crush', 'regen'], taxis: { food: 3, hunt: 3, explore: 1 } },
  sprinter: { vigor: 4, density: 1, sense: 3, genes: ['amylase', 'protease', 'prune'], taxis: { food: 4, hunt: 1, explore: 3 } },
  tank:     { vigor: 2, density: 4, sense: 2, genes: ['amylase', 'protease', 'chitin', 'regen', 'crush'], taxis: { food: 3, hunt: 2, explore: 1 } },
  scout:    { vigor: 3, density: 2, sense: 4, genes: ['amylase', 'protease', 'crush', 'prune'], taxis: { food: 4, hunt: 2, explore: 3 } },
};
const arche = o.archetypes ? JSON.parse(fs.readFileSync(o.archetypes, 'utf8')) : ARCHETYPES;
for (let i = from; i <= to; i++) {
  const L = LEVELS[i];
  console.log(`\n== ${L.code} ${L.name}, budget ${L.budget} ==`);
  for (const opp of rivalsOf(L)) {
    console.log(`vs ${rivalName(opp)} (${genomeCost(opp)} kb)`);
    if (o.climb) climb(i, opp, { budget: L.budget, allowed: genesUpTo(i - 1), start: DEFAULT, steps: +(o.steps || 4), sd: seeds(Math.min(4, sd.length)) });
    else for (const [name, g] of Object.entries(arche)) console.log(`  ${name.padEnd(10)} ${String(genomeCost(g)).padStart(2)} kb${genomeCost(g) > L.budget ? '*' : ' '} ${fmt(series(i, g, opp, sd))}`);
  }
}
if (!o.climb) console.log('\n* over this plate\'s budget');

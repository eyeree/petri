// Hill-climb from a genome toward a counter for an opponent, under a budget and a gene whitelist. The edit path
// printed is how far the answer is from the starting strain (goal 3: a few steps; goal 4: no path at all).
// node tools/balance/climb.js --level 0 [--rival i | --opp <json>] [--budget <plate budget>]
//        [--genes a,b,c | --upto <plate>] [--start default|rival:L[:i]|<json>] [--steps 3] [--seeds 4]
// --upto k allows the genes a player has on plate k; the default is the level itself. For the carry-forward test
// pass the plate before (--upto level-1). Without --rival or --opp every opponent of the plate is climbed against.
const H = require('./harness.js');
const { LEVELS, genomeCost, seeds, rivalsOf, rivalName, args, genomeArg, climb, genesUpTo, describe } = H;
const o = args(), level = +(o.level || 0), L = LEVELS[level];
const opps = o.opp ? [JSON.parse(o.opp)] : o.rival != null ? [rivalsOf(L)[+o.rival]] : rivalsOf(L);
const budget = +(o.budget || L.budget), allowed = o.genes ? o.genes.split(',') : genesUpTo(o.upto != null ? +o.upto : level);
const start = genomeArg(o.start), steps = +(o.steps || 3), sd = seeds(+o.seeds || 4);
console.log(`${L.code} ${L.name}, budget ${budget}, ${sd.length} seeds\ngenes: ${allowed.join(', ')}\nstart: ${describe(start)}`);
for (const opp of opps) {
  console.log(`\n### vs ${rivalName(opp)} (${genomeCost(opp)} kb)`);
  const r = climb(level, opp, { budget, allowed, start, steps, sd });
  console.log(`  result: ${describe(r.genome)}`);
}

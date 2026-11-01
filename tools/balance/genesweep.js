// Marginal value of every single edit to a genome against one opponent, budget ignored: which genes and trait
// steps matter on this plate, and which do nothing.
// node tools/balance/genesweep.js [--level 0] [--rival 0] [--genome default|rival:L[:i]|<json>] [--seeds 8]
const H = require('./harness.js');
const { LEVELS, GENES, genomeCost, series, fmt, seeds, rivalsOf, rivalName, args, genomeArg, moves, describe } = H;
const o = args(), level = +(o.level || 0), opp = rivalsOf(LEVELS[level])[+(o.rival || 0)], g = genomeArg(o.genome), sd = seeds(+o.seeds || 8);
console.log(`${describe(g)}\nvs ${rivalName(opp)} on ${LEVELS[level].code}, ${sd.length} seeds\n`);
console.log(`${'base'.padEnd(12)} ${String(genomeCost(g)).padStart(2)}kb ${fmt(series(level, g, opp, sd))}`);
for (const [name, h] of moves(g, GENES.map(G => G.id))) console.log(`${name.padEnd(12)} ${String(genomeCost(h)).padStart(2)}kb ${fmt(series(level, h, opp, sd))}`);

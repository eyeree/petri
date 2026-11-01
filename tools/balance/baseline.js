// The standard checks: every opponent's cost against its plate's budget; the default strain against every
// opponent in both corners; mirror matches (side bias); each plate's opponents carried onto the next plate.
// node tools/balance/baseline.js [--seeds 8] [--quick]
const H = require('./harness.js');
const { LEVELS, genomeCost, series, fmt, DEFAULT, seeds, rivalsOf, rivalName, args, describe } = H;
const o = args(), sd = seeds(+o.seeds || (o.quick ? 4 : 8));
const W = 28;
console.log(`default: ${describe(DEFAULT)}\n`);
LEVELS.forEach(L => { console.log(`${L.code} ${L.name}, budget ${L.budget}`); for (const r of rivalsOf(L)) console.log(`  ${String(genomeCost(r)).padStart(2)} kb  ${rivalName(r)}`); });
console.log('\n== default (gold) vs each opponent on its plate ==');
LEVELS.forEach((L, i) => rivalsOf(L).forEach(r => console.log(`${L.code} ${rivalName(r).padEnd(W)} ${fmt(series(i, DEFAULT, r, sd))}`)));
console.log('\n== each opponent (gold) vs the default (pink): the other corner ==');
LEVELS.forEach((L, i) => rivalsOf(L).forEach(r => console.log(`${L.code} ${rivalName(r).padEnd(W)} ${fmt(series(i, r, DEFAULT, sd))}`)));
console.log('\n== mirror: each opponent against itself; gold wins, so 4/8 is no side bias ==');
LEVELS.forEach((L, i) => rivalsOf(L).forEach(r => console.log(`${L.code} ${rivalName(r).padEnd(W)} ${fmt(series(i, r, r, sd))}`)));
console.log('\n== carried: each opponent of the plate before (gold) vs each opponent of this plate, on this plate ==');
for (let i = 1; i < LEVELS.length; i++) for (const a of rivalsOf(LEVELS[i - 1])) for (const b of rivalsOf(LEVELS[i]))
  console.log(`${LEVELS[i].code} ${rivalName(a).padEnd(W)} vs ${rivalName(b).padEnd(W)} ${fmt(series(i, a, b, sd))}`);

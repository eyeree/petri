// Round robin among builds on one plate (D-01 by default, which has no terrain): which genes dominate at about
// equal cost. Builds come from --builds file.json ({name: genome}) or the built-in set: a 12 kb base plus one
// addition each. Every ordered pair is played, so each build sits in both corners.
// node tools/balance/arena.js [--level 0] [--seeds 4] [--builds file.json]
const fs = require('fs');
const H = require('./harness.js');
const { genomeCost, series, seeds, args } = H;
const o = args(), level = +(o.level || 0), sd = seeds(+o.seeds || 4);
const base = { vigor: 2, density: 2, sense: 2, genes: ['amylase', 'protease', 'chitin', 'crush'], taxis: { food: 3, hunt: 2, explore: 2 } };
const mk = (genes, patch) => Object.assign(JSON.parse(JSON.stringify(base)), patch || {}, { genes: [...base.genes, ...genes] });
const BUILDS = { acid: mk(['acid']), toxin: mk(['toxin']), regen: mk(['regen']), necro: mk(['necro']), spores: mk(['spores']), mucus: mk(['mucus']), granules: mk(['granules', 'prune']), dense: mk([], { density: 3 }), vigor: mk([], { vigor: 3 }) };
const builds = o.builds ? JSON.parse(fs.readFileSync(o.builds, 'utf8')) : BUILDS;
const names = Object.keys(builds), W = {};
console.log(names.map(n => `${n}:${genomeCost(builds[n])}kb`).join('  '));
for (const n of names) W[n] = 0;
for (let i = 0; i < names.length; i++) for (let j = 0; j < names.length; j++) {
  if (i === j) continue;
  const s = series(level, builds[names[i]], builds[names[j]], sd);
  W[names[i]] += s.w; W[names[j]] += sd.length - s.w;
  if (i < j) console.log(`${names[i].padEnd(10)} vs ${names[j].padEnd(10)} ${s.w}/${sd.length} share ${s.avgShare.toFixed(2)}`);
}
console.log(`\nwins of ${2 * (names.length - 1) * sd.length} possible:`);
for (const n of names.sort((a, b) => W[b] - W[a])) console.log(`  ${n.padEnd(10)} ${W[n]}`);

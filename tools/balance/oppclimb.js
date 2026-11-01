// Strengthen an opponent: a greedy hill-climb of an opponent's genome (it plays pink) against a set of challengers on
// its plate, under a kb cap and the plate's genes, never dropping the genes it must keep (the plate's key). The score
// is the challengers' losses plus their lost share. Used to tune the roster: a carried strain should lose to every
// opponent on a new plate (goal 4), and the default to every plate 1 opponent (goal 3).
// node tools/balance/oppclimb.js --level 1 --rival 2 [--cap 19] [--keep ligninase] [--vs default,prev,<json>] [--steps 4] [--seeds 4]
const H = require('./harness.js'), P = require('./pool.js');
const { LEVELS, genomeCost, rivalsOf, rivalName, args, genesUpTo, describe, moves, clone, seeds } = H;
const o = args(), level = +(o.level || 0), L = LEVELS[level], k = +(o.rival || 0), opp0 = rivalsOf(L)[k];
const cap = +(o.cap || genomeCost(opp0)), keep = (o.keep || '').split(',').filter(Boolean), sd = seeds(+o.seeds || 4), steps = +(o.steps || 4);
const allowed = genesUpTo(level);
const vs = [];
for (const v of String(o.vs || 'default,prev').split(',')) {
  if (v === 'default') vs.push(H.DEFAULT);
  else if (v === 'prev') { if (level > 0) vs.push(...rivalsOf(LEVELS[level - 1])); }
  else vs.push(H.genomeArg(v));
}
async function score(g) {
  const ss = await Promise.all(vs.map(c => P.series(level, c, g, sd)));
  const losses = ss.reduce((a, s) => a + (s.n - s.w), 0), share = ss.reduce((a, s) => a + (1 - s.avgShare), 0) / ss.length;
  return { v: losses + share, losses, n: ss.length * sd.length, per: ss.map(s => s.n - s.w) };
}
(async () => {
  console.log(`${L.code} ${rivalName(opp0)}: ${describe(opp0)}, cap ${cap}, keep ${keep.join(',') || '-'}, vs ${vs.length} challengers × ${sd.length} seeds`);
  let cur = clone(opp0), cs = await score(cur);
  console.log(`  start ${cs.losses}/${cs.n} challenger losses [${cs.per}]`);
  for (let st = 0; st < steps && cs.losses < cs.n; st++) {
    const ms = moves(cur, allowed).filter(([nm, h]) => genomeCost(h) <= cap && keep.every(id => h.genes.includes(id)));
    const rs = await Promise.all(ms.map(([, h]) => score(h)));
    let bi = -1; rs.forEach((r, i) => { if (bi < 0 || r.v > rs[bi].v) bi = i; });
    if (bi < 0 || rs[bi].v <= cs.v) { console.log('  no improving move'); break; }
    cur = ms[bi][1]; cs = rs[bi];
    console.log(`  ${ms[bi][0].padEnd(12)} ${cs.losses}/${cs.n} [${cs.per}] ${describe(cur)}`);
  }
  console.log(JSON.stringify(H.normGenome(cur)));
  P.close(); process.exit(0);
})();

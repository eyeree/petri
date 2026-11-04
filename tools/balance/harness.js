// Shared helpers for the balance scripts: run rounds, summarise a series over seeds, hill-climb toward a counter,
// parse options. Every script here is `node tools/balance/<script>.js [options]`.
const M = require('./sim.js');
const { Battle, LEVELS, GENES, genomeCost, normGenome } = M;
// The strain a new game starts with (DEFAULT_GENOME in index.html).
const DEFAULT = { vigor: 2, density: 2, sense: 2, genes: ['amylase', 'protease', 'chitin', 'crush'], taxis: { food: 3, hunt: 1, explore: 2 } };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const seeds = n => Array.from({ length: n }, (_, i) => SEEDS[i] != null ? SEEDS[i] : 101 + i * 37);
const clone = g => JSON.parse(JSON.stringify(g));
// Each plate has one opponent (L.rival); the scripts loop over a list so an older roster of several still runs.
const rivalsOf = L => L.rivals || [L.rival];
const rivalName = r => r.tag ? `${r.name} (${r.tag})` : r.name;
// Gene ids a player can use on plate `level` (the unlock rule of isolated() in index.html).
const genesUpTo = level => GENES.filter(G => G.unlock <= level + 1).map(G => G.id);
const describe = g => { const n = normGenome(g); return `V${n.vigor} D${n.density} S${n.sense} · ${n.taxis.food}/${n.taxis.hunt}/${n.taxis.explore} · ${n.genes.join(', ') || 'no genes'} (${genomeCost(n)} kb)`; };

// One round. Whether gold (gP) won, why, when, and gold's share of the living tissue at the end.
function run(level, gP, gE, seed) {
  const b = new Battle(level, gP, gE, seed);
  while (!b.done) b.step();
  const p = b.sides[1].cells, e = b.sides[2].cells;
  return { win: b.result.winner === 1, reason: b.result.reason, tick: b.result.tick, p, e, share: p / Math.max(1, p + e) };
}
// A series of rounds over seeds: wins, end reasons, average share and length.
function series(level, gP, gE, sd = SEEDS) {
  const rs = sd.map(s => run(level, gP, gE, s));
  const reasons = {};
  for (const r of rs) { const k = (r.win ? 'W:' : 'L:') + r.reason; reasons[k] = (reasons[k] || 0) + 1; }
  return { w: rs.filter(r => r.win).length, n: rs.length, reasons, avgShare: rs.reduce((a, r) => a + r.share, 0) / rs.length, avgTick: rs.reduce((a, r) => a + r.tick, 0) / rs.length, rs };
}
const fmt = s => `${s.w}/${s.n} share ${s.avgShare.toFixed(2)} t=${String(Math.round(s.avgTick)).padStart(3)} ${Object.entries(s.reasons).map(([k, v]) => `${k}:${v}`).join(' ')}`;

// Every single-step edit of a genome: ±1 on each trait and drive, toggle each allowed gene.
function moves(g, allowed) {
  const out = [];
  for (const t of ['vigor', 'density', 'sense']) for (const d of [-1, 1]) { const h = clone(g); h[t] += d; if (h[t] >= 1 && h[t] <= 5) out.push([`${t}${d > 0 ? '+' : '-'}`, h]); }
  for (const t of ['food', 'hunt', 'explore']) for (const d of [-1, 1]) { const h = clone(g); h.taxis[t] += d; if (h.taxis[t] >= 0 && h.taxis[t] <= 5) out.push([`${t}${d > 0 ? '+' : '-'}`, h]); }
  for (const id of allowed) { const h = clone(g); const k = h.genes.indexOf(id); if (k >= 0) h.genes.splice(k, 1); else h.genes.push(id); out.push([(k >= 0 ? '-' : '+') + id, h]); }
  return out;
}
// Greedy hill-climb from `start` toward a counter to `opp` on `level`: each step takes the single edit under
// `budget` (genes limited to `allowed`) that most improves wins, then share. The number of steps a counter needs
// is the measure of "how far away is the answer".
function climb(level, opp, { budget, allowed, start = DEFAULT, steps = 3, sd = seeds(4), log = console.log } = {}) {
  const score = s => s.w + s.avgShare;
  let cur = clone(start), curS = series(level, cur, opp, sd); const path = [];
  log(`  start: ${curS.w}/${sd.length} share ${curS.avgShare.toFixed(2)} cost ${genomeCost(cur)}`);
  for (let st = 0; st < steps && curS.w < sd.length; st++) {
    let best = null;
    for (const [name, h] of moves(cur, allowed)) {
      if (genomeCost(h) > budget) continue;
      const s = series(level, h, opp, sd);
      if (!best || score(s) > score(best[2])) best = [name, h, s];
    }
    if (!best || score(best[2]) <= score(curS)) { log('  no improving move'); break; }
    cur = best[1]; curS = best[2]; path.push(best[0]);
    log(`  step ${st + 1}: ${path.join(' ')} -> ${fmt(curS)} cost ${genomeCost(cur)}`);
  }
  return { genome: cur, series: curS, path };
}

// `--key value` and `--flag` options; positional arguments in `_`.
function args(argv = process.argv.slice(2)) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const k = a.slice(2), v = argv[i + 1];
    if (v == null || v.startsWith('--')) o[k] = true; else { o[k] = v; i++; }
  }
  return o;
}
// A genome option: `default`, `rival:<level>[:<index>]` for a plate's opponent, or JSON text.
function genomeArg(v) {
  if (v == null || v === 'default') return clone(DEFAULT);
  if (String(v).startsWith('rival:')) { const [, l, i] = String(v).split(':'); return rivalsOf(LEVELS[+l])[+(i || 0)]; }
  return JSON.parse(v);
}
module.exports = { ...M, DEFAULT, SEEDS, seeds, clone, rivalsOf, rivalName, genesUpTo, describe, run, series, fmt, moves, climb, args, genomeArg };

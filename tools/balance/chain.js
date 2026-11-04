// Tune the one-opponent roster as a chain. The player's counter to plate k-1's opponent is what arrives on plate k,
// so plate k's opponent is hill-climbed to beat that counter (and plate k-1's opponent, and any counter the climb
// finds using only older genes), while a counter that uses plate k's own genes must still exist within its budget.
// That counter is then carried to plate k+1. Plate 1 is tuned against the default strain instead: the default must
// lose, and some genome within two edits of it must win.
//
// Every comparison plays both corners. The climbs compare candidates on a few tuning seeds; every decision (is the
// opponent beaten, does a counter work, does an old-gene counter exist) is taken on fresh seeds the climbs never saw,
// since the best of fifty candidates on six seeds is mostly the luckiest.
//
// node tools/balance/chain.js --roster <json> --out <json> [--from 0] [--to 9] [--tune 6] [--check 24] [--p1 32]
//                               [--cache <file>] [--restart]
// The roster JSON is { opps: [per plate], alts: [per plate: other genomes to try as counters' starting points],
// counters: [per plate] }. It is only read; the tuned opponents, the counter path and each plate's numbers go to
// --out after every plate. Every round played is kept in --cache (default <out>.cache). An interrupted run resumes
// by running the same command again: plates already in --out are skipped, and within the plate it stopped in, the
// rounds already played come back from the cache, so the climbs replay at once and carry on. --restart ignores --out.
// When the last plate is done, a report checks every plate on more fresh seeds, and corner bias with mirror matches.
const fs = require('fs');
const H = require('./harness.js'), P = require('./pool.js');
const { LEVELS, genomeCost, genesUpTo, describe, moves, clone, args } = H;
const o = args(), from = +(o.from || 0), to = +(o.to == null ? LEVELS.length - 1 : o.to);
const TUNE = H.seeds(+o.tune || 6), FRESH = Array.from({ length: +o.check || 24 }, (_, i) => 900001 + i * 7919);
if (!o.out || o.out === o.roster) throw new Error('--out must name a file other than --roster');
const out = o.out, resume = !o.restart && fs.existsSync(out);
const roster = JSON.parse(fs.readFileSync(resume ? out : o.roster, 'utf8'));
const opps = roster.opps; roster.counters = roster.counters || []; roster.done = roster.done || []; roster.report = roster.report || [];
roster.settings = roster.settings || { roster: o.roster, tune: TUNE.length, check: FRESH.length, p1: +o.p1 || 32 };
const t0 = Date.now(), el = () => `[${((Date.now() - t0) / 60000).toFixed(1)} min]`;
// targets, as a strain's share of wins over both corners on fresh seeds
const P_DEF = 0.25, P_CARRIED = 0.15, P_OLD = 0.35, P_NEW = 0.65;
const log = (...a) => console.log(...a);
const save = () => { const tmp = out + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(roster, null, 1)); fs.renameSync(tmp, out); };
const pc = s => `${Math.round(100 * s.w / s.n)}%`;

// the opponent's score against a set of challengers: their losses, then their lost share
async function oscore(L, g, vs) {
  const ss = await Promise.all(vs.map(c => P.duel(L, c, g, TUNE)));
  return { v: ss.reduce((a, s) => a + (s.n - s.w) + (1 - s.avgShare), 0), per: ss.map(s => s.n - s.w), n: ss[0].n };
}
// From the second round on, a plate's opponent is climbed on two sides at once: beat the challengers (the carried
// strain, the plate before's opponent, every old-gene counter found so far) and lose to the best counter that uses
// the plate's new genes, so closing the old answers never closes the new one.
async function shape(L, g0, beat, loseTo, cap, keep, steps) {
  const score = async g => {
    const a = await Promise.all(beat.map(c => P.duel(L, c, g, TUNE))), b = await Promise.all(loseTo.map(c => P.duel(L, c, g, TUNE)));
    return { v: a.reduce((x, s) => x + (s.n - s.w) + (1 - s.avgShare), 0) + b.reduce((x, s) => x + 2 * (s.w + s.avgShare), 0), a: a.map(s => s.n - s.w), b: b.map(s => s.w), n: a[0].n };
  };
  let cur = clone(g0), cs = await score(cur);
  log(`    shape start: challengers lose [${cs.a}]/${cs.n}, new counter wins [${cs.b}]`);
  for (let st = 0; st < steps; st++) {
    const ms = moves(cur, genesUpTo(L)).filter(([, h]) => genomeCost(h) <= cap && keep.every(id => h.genes.includes(id)));
    const rs = await Promise.all(ms.map(([, h]) => score(h)));
    let bi = -1; rs.forEach((r, i) => { if (bi < 0 || r.v > rs[bi].v) bi = i; });
    if (bi < 0 || rs[bi].v <= cs.v) { log('    shape: no improving move'); break; }
    cur = ms[bi][1]; cs = rs[bi];
    log(`    shape ${ms[bi][0].padEnd(12)} challengers lose [${cs.a}], new counter wins [${cs.b}] ${describe(cur)}`);
  }
  return cur;
}
async function oppClimb(L, g0, vs, cap, keep, steps) {
  let cur = clone(g0), cs = await oscore(L, cur, vs);
  log(`    opp start [${cs.per}]/${cs.n} ${describe(cur)}`);
  for (let st = 0; st < steps && cs.per.some(x => x < cs.n - 1); st++) {
    const ms = moves(cur, genesUpTo(L)).filter(([, h]) => genomeCost(h) <= cap && keep.every(id => h.genes.includes(id)));
    const rs = await Promise.all(ms.map(([, h]) => oscore(L, h, vs)));
    let bi = -1; rs.forEach((r, i) => { if (bi < 0 || r.v > rs[bi].v) bi = i; });
    if (bi < 0 || rs[bi].v <= cs.v) { log('    opp: no improving move'); break; }
    cur = ms[bi][1]; cs = rs[bi];
    log(`    opp ${ms[bi][0].padEnd(12)} [${cs.per}]/${cs.n} ${describe(cur)}`);
  }
  return cur;
}
// a counter climbed on the tuning seeds, then judged on fresh ones
async function counterFrom(L, opp, start, upto, steps) {
  const r = await P.climb(L, opp, { budget: LEVELS[L].budget, allowed: genesUpTo(upto), start, steps, sd: TUNE, both: true, log: () => {} });
  r.fresh = await P.duel(L, r.genome, opp, FRESH);
  return r;
}
const fmtC = r => `${pc(r.fresh)} fresh (${r.series.w}/${r.series.n} tuning) via ${r.path.join(' ') || '(none)'} → ${describe(r.genome)}`;
// plate 1: every genome within two edits of the default under the budget, ranked on the tuning seeds, the best six
// judged on fresh ones
async function twoEdit(opp) {
  const B = LEVELS[0].budget, allowed = genesUpTo(0), seen = new Map();
  for (const [n1, g1] of moves(H.DEFAULT, allowed)) {
    if (genomeCost(g1) <= B) seen.set(JSON.stringify(g1), [n1, g1]);
    for (const [n2, g2] of moves(g1, allowed)) if (genomeCost(g2) <= B) { const k = JSON.stringify(g2); if (!seen.has(k)) seen.set(k, [`${n1} ${n2}`, g2]); }
  }
  const cands = [...seen.values()];
  const rs = await Promise.all(cands.map(([, g]) => P.duel(0, g, opp, TUNE)));
  const top = rs.map((s, i) => [s.w + s.avgShare, i]).sort((a, b) => b[0] - a[0]).slice(0, 6).map(([, i]) => i);
  const fr = await Promise.all(top.map(i => P.duel(0, cands[i][1], opp, FRESH)));
  let bi = 0; fr.forEach((s, q) => { if (s.w > fr[bi].w) bi = q; });
  return { genome: cands[top[bi]][1], path: [cands[top[bi]][0]], fresh: fr[bi], series: rs[top[bi]] };
}

// Plate 1: the opponent is climbed on balance itself: the lower of the default's loss rate and the best win rate of a
// few cost-neutral two-edit trade-offs of the default (more weight on the default losing). Rounds on plate 1 are
// cheap, so it is judged on more seeds (--p1 per corner); the best climb is checked on fresh seeds, and the best
// counter within two edits of the default is what the player carries on.
const TRADES = [['density', 'explore'], ['vigor', 'explore'], ['density', 'food'], ['-crush', '+regen'], ['vigor', 'food']];
function edited(pair) {
  const g = clone(H.DEFAULT);
  if (pair[0][0] === '-') { g.genes = g.genes.filter(x => x !== pair[0].slice(1)); g.genes.push(pair[1].slice(1)); return g; }
  const bump = (k, d) => { if (k in g.taxis) g.taxis[k] += d; else g[k] += d; };
  bump(pair[0], 1); bump(pair[1], -1); return g;
}
async function plate1() {
  const L = 0, cap = Math.max(genomeCost(opps[0]), LEVELS[0].budget + 2), SD = Array.from({ length: +o.p1 || 32 }, (_, i) => 3100003 + i * 7919);
  const trades = TRADES.map(edited).filter(g => genomeCost(g) <= LEVELS[0].budget);
  const score = async (g, sd) => {
    const [d, ...cs] = await Promise.all([P.duel(L, H.DEFAULT, g, sd), ...trades.map(c => P.duel(L, c, g, sd))]);
    const dl = 1 - d.w / d.n, cw = Math.max(...cs.map(s => s.w / s.n));
    return { v: Math.min(dl, cw - 0.1) + 0.05 * (dl + cw), dl, cw };
  };
  log(`\n== ${LEVELS[0].code} budget ${LEVELS[0].budget}, cap ${cap}: the default must lose, a two-edit trade-off must win`);
  let best = null;
  for (const start of [opps[0], ...(roster.alts && roster.alts[0] || [])]) {
    let cur = clone(start), cs = await score(cur, SD);
    for (let st = 0; st < 8; st++) {
      const ms = moves(cur, genesUpTo(L)).filter(([, h]) => genomeCost(h) <= cap);
      const rs = await Promise.all(ms.map(([, h]) => score(h, SD)));
      let bi = -1; rs.forEach((r, i) => { if (bi < 0 || r.v > rs[bi].v) bi = i; });
      if (bi < 0 || rs[bi].v <= cs.v) break;
      cur = ms[bi][1]; cs = rs[bi];
    }
    const f = await score(cur, FRESH);
    log(`  from ${start.tag || 'start'}: fresh, default loses ${Math.round(100 * f.dl)}%, best trade-off wins ${Math.round(100 * f.cw)}% — ${describe(cur)}`);
    if (!best || f.v > best.f.v) best = { opp: cur, f };
  }
  const c = await twoEdit(best.opp);
  log(`  best two-edit counter ${fmtC(c)}`);
  return { opp: best.opp, counter: c };
}

const withGenes = (g, ids) => { const h = clone(g); for (const id of ids) if (!h.genes.includes(id)) h.genes.push(id); return h; };
async function plate(L, counter) {
  const B = LEVELS[L].budget, base = opps[L], newIds = new Set(genesUpTo(L).filter(id => !genesUpTo(L - 1).includes(id)));
  const keep = base.genes.filter(id => newIds.has(id)), cap = Math.max(genomeCost(base), B + 2);
  log(`\n== ${LEVELS[L].code} budget ${B}, cap ${cap}, keep ${keep.join(',') || '-'}; carried counter ${describe(counter)}`);
  const vs = [counter, opps[L - 1]], usesNew = g => g.genes.some(id => newIds.has(id));
  let opp = clone(base), good = null, best = null, target = null, oldSeen = null;
  for (let it = 0; it < 4; it++) {
    if (target) opp = await shape(L, opp, vs, [target], cap, keep, it > 1 ? 5 : 3);
    else {
      // the first round climbs from several starts and keeps the one the challengers do worst against: the plate's
      // opponent, its alternatives, and the carried strain itself given the plate's new genes (a strain that stacks
      // genes plate after plate can outgrow an opponent built in another style)
      const starts = [base, ...(roster.alts && roster.alts[L] || []), withGenes(counter, keep)]
        .map(g => withGenes(g, keep)).filter(g => genomeCost(g) <= cap);
      let bs = null;
      for (const st of starts) { const g = await oppClimb(L, st, vs, cap, keep, 3), sc = await oscore(L, g, vs); if (!bs || sc.v > bs.sc.v) bs = { g, sc }; }
      opp = bs.g; log(`    best start: [${bs.sc.per}]/${bs.sc.n} ${describe(opp)}`);
    }
    // counters from the carried strain and from a copy of the plate before's opponent (a player can save it once
    // beaten); any that manages without the plate's new genes is an old-gene counter, however it was found
    const found = [await counterFrom(L, opp, counter, L - 1, 4)];
    log(`    old genes from the carried strain: ${fmtC(found[0])}`);
    for (const st of [counter, opps[L - 1]]) { const r = await counterFrom(L, opp, st, L, 5); found.push(r); log(`    from ${describe(st)}: ${fmtC(r)}`); }
    let neu = found.filter(r => usesNew(r.genome)).sort((a, b) => b.fresh.w - a.fresh.w)[0];
    if (!neu || neu.fresh.w < P_NEW * neu.fresh.n) for (const alt of (roster.alts && roster.alts[L] || []).filter(g => genomeCost(g) <= B)) {
      const r = await counterFrom(L, opp, alt, L, 5); found.push(r);
      log(`    from ${describe(alt)}: ${fmtC(r)}`);
      if (usesNew(r.genome) && (!neu || r.fresh.w > neu.fresh.w)) neu = r;
    }
    const old = found.filter(r => !usesNew(r.genome)).sort((a, b) => b.fresh.w - a.fresh.w)[0];
    if (!neu || neu.fresh.w < P_NEW * neu.fresh.n) { log(`    no counter with the new genes at ${P_NEW * 100}%: keeping the previous opponent`); break; }
    good = clone(opp); best = neu; target = neu.genome; oldSeen = old || null;
    log(`    ${el()} round ${it + 1}: new-gene counter ${pc(neu.fresh)}, best old-gene counter ${old ? pc(old.fresh) : '-'}`);
    if (!old || old.fresh.w <= P_OLD * old.fresh.n) break;
    vs.push(old.genome); log(`    the old-gene counter (${pc(old.fresh)}) joins the challengers`);
  }
  if (!good) { good = clone(base); best = await counterFrom(L, good, counter, L, 6); log(`    fallback counter: ${fmtC(best)}`); }
  if (oldSeen && oldSeen.fresh.w > P_OLD * oldSeen.fresh.n) log(`    GATE: an old-gene counter still wins ${pc(oldSeen.fresh)} (target ≤ ${P_OLD * 100}%)`);
  return { opp: good, counter: best, old: oldSeen };
}

(async () => {
  if (roster.settings.tune !== TUNE.length || roster.settings.check !== FRESH.length) throw new Error(`--out was made with --tune ${roster.settings.tune} --check ${roster.settings.check}; use those, or --restart`);
  log(`${el()} cache: ${P.cache(o.cache || out + '.cache')} rounds already played${resume ? `; resuming, plates done: ${roster.done.map(L => LEVELS[L].code).join(' ') || 'none'}` : ''}`);
  // plates before --from are taken as they stand in the roster, so the report still runs at the end
  for (let L = 0; L < from; L++) if (!roster.done.includes(L)) roster.done.push(L);
  for (let L = from; L <= to; L++) {
    if (roster.done.includes(L)) continue;
    const counter = L ? roster.counters[L - 1] || H.DEFAULT : H.DEFAULT, t1 = Date.now();
    log(`${el()} starting ${LEVELS[L].code}`);
    const r = L === 0 ? await plate1() : await plate(L, counter);
    opps[L] = Object.assign({}, opps[L], { vigor: r.opp.vigor, density: r.opp.density, sense: r.opp.sense, genes: r.opp.genes, taxis: r.opp.taxis });
    const d = await P.duel(L, H.DEFAULT, r.opp, FRESH), c = L ? await P.duel(L, counter, r.opp, FRESH) : d;
    log(`  ${LEVELS[L].code} opponent ${describe(r.opp)} — fresh, both corners: default ${pc(d)}, carried ${pc(c)}, counter ${pc(r.counter.fresh)} → ${describe(r.counter.genome)} ${el()}`);
    roster.counters[L] = r.counter.genome;
    roster.report[L] = { minutes: +((Date.now() - t1) / 60000).toFixed(1), default: d.w / d.n, carried: c.w / c.n, counter: r.counter.fresh.w / r.counter.fresh.n, old: r.old ? { rate: r.old.fresh.w / r.old.fresh.n, genome: r.old.genome } : null };
    roster.done.push(L); save();
  }
  if (LEVELS.every((_, L) => roster.done.includes(L)) && !roster.final) {
    // the report: every plate on 64 more fresh seeds per corner, and each opponent against itself from 200 seeds
    const RS = Array.from({ length: 64 }, (_, i) => 5100007 + i * 7919), MS = Array.from({ length: 200 }, (_, i) => 6100007 + i * 7919);
    log(`\n${el()} report (both corners, 128 fresh rounds; mirror: gold's wins of 200)`);
    roster.final = [];
    for (let L = 0; L < LEVELS.length; L++) {
      const g = opps[L], carried = L ? roster.counters[L - 1] : H.DEFAULT;
      const [d, c, k, m] = await Promise.all([P.duel(L, H.DEFAULT, g, RS), P.duel(L, carried, g, RS), P.duel(L, roster.counters[L], g, RS), P.series(L, g, g, MS)]);
      const R = roster.report[L], row = { default: d.w / d.n, carried: c.w / c.n, counter: k.w / k.n, oldTuning: R && R.old ? R.old.rate : null, mirror: m.w / m.n };
      roster.final[L] = row;
      log(`${LEVELS[L].code} ${String(genomeCost(g)).padStart(2)}/${LEVELS[L].budget} kb  default ${pc(d).padStart(4)}  carried ${pc(c).padStart(4)}  counter ${pc(k).padStart(4)}  old-gene ${row.oldTuning == null ? '  - ' : (Math.round(100 * row.oldTuning) + '%').padStart(4)}  mirror ${pc(m).padStart(4)}  ${describe(g)}`);
    }
    save();
  }
  log(`${el()} done`);
  P.close();
})();

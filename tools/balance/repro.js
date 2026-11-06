// Rebuild a moment of play from a state blob: the text the game's S key shows (a MYXO-STATE header line, then JSON with
// the plate, both genomes, every round's seed, the round and the tick on show). Steps that round's Battle to the tick,
// checks it against the frame the browser recorded, and prints both sides and the selected cell.
//   node tools/balance/repro.js <file | -> [--tick N] [--cell i | --cell x,y] [--events N] [--json]
// --tick and --cell look at another minute or cell of the same round; --json prints the summary as JSON.
// From code: const { load } = require('./tools/balance/repro.js'); const { battle } = load(text, { tick });
// gives the live Battle, stepped to the tick, to inspect or step further (battle.step()).
const fs = require('fs');
const M = require('./sim.js');
const { Battle, LEVELS, GENE_BY_ID, N, NN, normGenome, genomeCost, SIM_FP, FOOD_NAMES } = M;

const fnvBytes = (h, a) => { for (let i = 0; i < a.length; i++) { h ^= a[i]; h = Math.imul(h, 16777619); } return h >>> 0; };
const hex8 = h => (h >>> 0).toString(16).padStart(8, '0');
const frameDigest = f => hex8(fnvBytes(fnvBytes(fnvBytes(2166136261, f.dens), f.flags), f.matter));
const frameCheck = (b, t) => ({ cells: [b.stats.cells[1][t], b.stats.cells[2][t]], energy: [+b.stats.energy[1][t].toFixed(2), +b.stats.energy[2][t].toFixed(2)], frame: frameDigest(b.frames[t]) });
const fmt = t => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(Math.floor(t % 60)).padStart(2, '0');

function parse(text) {
  const s = String(text), a = s.indexOf('{'), z = s.lastIndexOf('}');
  if (a < 0 || z < a) throw new Error('no state JSON found');
  const o = JSON.parse(s.slice(a, z + 1));
  if (o.v !== 1) throw new Error(`state version ${o.v}; this script reads 1`);
  if (!LEVELS[o.level]) throw new Error(`no plate ${o.level}`);
  if (!Array.isArray(o.seeds) || o.seeds[o.round] == null) throw new Error(`no seed for round ${o.round}`);
  return o;
}
// The state's round as a Battle stepped to `tick` (the blob's own, unless given), and how it compares with the blob.
function load(text, { tick } = {}) {
  const state = typeof text === 'string' ? parse(text) : text;
  const want = tick == null ? state.tick : tick;
  const battle = new Battle(state.level, normGenome(state.gold), normGenome(state.pink), state.seeds[state.round] >>> 0);
  while (battle.tick < want && !battle.done) battle.step();
  const diffs = [];
  if (state.sim && state.sim !== SIM_FP) diffs.push(`simulation code changed: blob ${state.sim}, here ${SIM_FP}`);
  if (battle.tick < want) diffs.push(`round ended at tick ${battle.tick}, before tick ${want}`);
  else if (want === state.tick && state.check) {
    const now = frameCheck(battle, want), ck = state.check;
    for (const k of ['cells', 'energy', 'frame']) if (String(now[k]) !== String(ck[k])) diffs.push(`${k}: blob ${ck[k]}, here ${now[k]}`);
  }
  return { state, battle, diffs, reproduced: !diffs.length };
}
const cellArg = v => { if (v == null || v === true) return null; const p = String(v).split(',').map(Number); return p.length === 2 ? p[1] * N + p[0] : p[0]; };
function cellInfo(b, i) {
  const x = i % N, y = Math.floor(i / N), o = b.owner[i];
  const c = { cell: i, x, y, terrain: b.terrain[i], food: { type: FOOD_NAMES[b.ft[i]] || 'none', amount: +b.food[i].toFixed(2), pile: b.pile[i] } };
  if (b.terrain[i] === M.T_ROCK) c.rockHP = +b.rockHP[i].toFixed(2);
  if (o) Object.assign(c, { owner: o, hp: +b.hp[i].toFixed(2), maxHP: b.sides[o].maxHP, mass: +b.mass[i].toFixed(3), vein: +b.vein[i].toFixed(3), dormant: !!b.dorm[i], hub: !!b.isRoot[i], fragment: b.comp[i], energy: +b.cellE[i].toFixed(3), contest: +b.contest[i].toFixed(3), parent: b.parent[i], flow: +b.flow[i].toFixed(3) });
  if (b.dmg[i] > 0) c.damage = { amount: +b.dmg[i].toFixed(2), source: b.dsrc[i], by: b.dby[i] };
  return c;
}
function sideInfo(b, s, name, g) {
  const S = b.sides[s];
  return { side: s === 1 ? 'gold' : 'pink', name, genome: g, cost: genomeCost(g), cells: S.cells, energy: +S.energy.toFixed(2), alive: S.alive, starving: S.starving, fragments: S.frags.map(F => ({ cells: F.cells, energy: +Math.max(0, F.energy).toFixed(1), starving: !!F.starving })), hubs: S.hubs.map(H => ({ cell: H.cell, w: +H.w.toFixed(3) })), pilesKnown: S.known.size, probes: S.probes.length, kills: S.kills, eaten: +S.eaten.toFixed(1) };
}
function summary(r, { cell, events = 12 } = {}) {
  const { state: o, battle: b } = r, L = LEVELS[o.level];
  const sel = cell != null ? cell : o.sel >= 0 ? o.sel : null;
  return {
    plate: `${L.code} ${L.name} (level ${o.level})`, round: `${o.round + 1} of ${o.seeds.length}`, seed: o.seeds[o.round] >>> 0, tick: b.tick, clock: fmt(b.tick),
    reproduced: r.reproduced, diffs: r.diffs, result: b.done ? b.result : null,
    sides: [sideInfo(b, 1, o.names && o.names[0], normGenome(o.gold)), sideInfo(b, 2, o.names && o.names[1], normGenome(o.pink))],
    selected: sel != null && sel >= 0 && sel < NN ? cellInfo(b, sel) : null,
    events: b.events.slice(-events),
  };
}
if (require.main === module) {
  const a = require('./harness.js').args();
  const src = a._[0];
  if (!src) { console.error('usage: node tools/balance/repro.js <file | -> [--tick N] [--cell i | x,y] [--events N] [--json]'); process.exit(2); }
  const text = src === '-' ? fs.readFileSync(0, 'utf8') : fs.existsSync(src) ? fs.readFileSync(src, 'utf8') : src;
  const r = load(text, { tick: a.tick != null ? +a.tick : undefined });
  const out = summary(r, { cell: cellArg(a.cell), events: a.events != null ? +a.events : 12 });
  if (a.json) { console.log(JSON.stringify(out, null, 2)); process.exit(r.reproduced ? 0 : 1); }
  console.log(`${out.plate} · round ${out.round} · seed ${out.seed} · tick ${out.tick} (${out.clock})`);
  console.log(r.reproduced ? 'reproduced: matches the frame the browser recorded' : `NOT reproduced:\n  ${r.diffs.join('\n  ')}`);
  for (const s of out.sides) {
    const g = s.genome;
    console.log(`\n${s.side} · ${s.name || '?'} · V${g.vigor} D${g.density} S${g.sense} · ${g.taxis.food}/${g.taxis.hunt}/${g.taxis.explore} · ${g.genes.map(id => GENE_BY_ID[id] ? id : id + '?').join(', ') || 'no genes'} (${s.cost} kb)`);
    console.log(`  ${s.cells} cells · ${s.energy} ATP · ${s.fragments.length} fragment(s)${s.starving ? ' · starving' : ''}${s.alive ? '' : ' · dead'} · ${s.hubs.length} hub(s) · ${s.pilesKnown} piles known · ${s.probes} probes · ${s.kills} kills · ${s.eaten} eaten`);
  }
  if (out.result) console.log(`\nround over: ${out.result.winner === 1 ? 'gold' : 'pink'} won by ${out.result.reason} at tick ${out.result.tick}`);
  if (out.selected) console.log('\nselected cell', JSON.stringify(out.selected));
  if (out.events.length) { console.log(`\nlast ${out.events.length} events:`); for (const e of out.events) { const { t, side, type, cell, ...x } = e; console.log(`  ${fmt(t)} ${side === 1 ? 'gold' : side === 2 ? 'pink' : '-'} ${type} @${cell}${Object.keys(x).length ? ' ' + JSON.stringify(x) : ''}`); } }
  process.exit(r.reproduced ? 0 : 1);
}
module.exports = { parse, load, summary, cellInfo, frameDigest, frameCheck };

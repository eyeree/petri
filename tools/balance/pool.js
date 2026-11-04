// A worker-thread pool for the balance scripts: rounds run in parallel on every core. run(tasks) takes
// [{ level, gP, gE, seed }] and resolves to the same results as harness.run, in order; series(level, gP, gE, seeds)
// and climb(...) mirror the harness versions; duel(level, gA, gB, seeds) plays every seed from both corners and
// reports gA's results, so nothing it measures depends on which corner a strain starts in.
// cache(file) keeps every round's result on disk (one JSON line each, the first line the simulation's fingerprint),
// so a deterministic script that is interrupted can simply be run again: rounds already played come back from the
// file at once and the run carries on where it stopped. A file from a different simulation is set aside, not used. Workers load the simulation once and stay up until close().
const { Worker, isMainThread, parentPort } = require('worker_threads');
const os = require('os');
if (!isMainThread) {
  const H = require('./harness.js');
  parentPort.on('message', ({ id, t }) => parentPort.postMessage({ id, r: (({ win, reason, tick, p, e, share }) => ({ win, reason, tick, p, e, share }))(H.run(t.level, t.gP, t.gE, t.seed)) }));
} else {
  const H = require('./harness.js');
  const N = Math.max(1, +(process.env.POOL || os.cpus().length - 2));
  const workers = [], idle = [], queue = [], pending = new Map(); let nextId = 0;
  const pump = () => { while (idle.length && queue.length) { const w = idle.pop(), job = queue.shift(); pending.set(job.id, job); w.postMessage({ id: job.id, t: job.t }); } };
  const spawn = () => { const w = new Worker(__filename); w.on('message', ({ id, r }) => { const j = pending.get(id); pending.delete(id); idle.push(w); j.resolve(r); pump(); }); workers.push(w); idle.push(w); };
  const fs = require('fs'), crypto = require('crypto');
  let store = null, file = null, buf = [], timer = null;
  const keyOf = t => crypto.createHash('sha1').update(`${t.level}|${t.seed}|${JSON.stringify(t.gP)}|${JSON.stringify(t.gE)}`).digest('base64').slice(0, 20);
  const flush = () => { if (file && buf.length) { fs.appendFileSync(file, buf.join('')); buf = []; } };
  function cache(path) {
    file = path; store = new Map();
    if (fs.existsSync(path)) {
      const text = fs.readFileSync(path, 'utf8'), lines = text.split('\n');
      if (lines[0] === H.SIM_HASH) {
        for (let i = 1; i < lines.length; i++) if (lines[i]) { try { const [k, r] = JSON.parse(lines[i]); store.set(k, r); } catch (e) { /* a line cut short by an interruption */ } }
        if (!text.endsWith('\n')) fs.appendFileSync(path, '\n'); // so the next line written starts on a line of its own
      } else { fs.renameSync(path, `${path}.stale-${Date.now()}`); fs.writeFileSync(path, H.SIM_HASH + '\n'); }
    } else fs.writeFileSync(path, H.SIM_HASH + '\n');
    timer = setInterval(flush, 2000); timer.unref();
    return store.size;
  }
  const runOne = t => {
    const k = store ? keyOf(t) : null;
    if (k && store.has(k)) return Promise.resolve(store.get(k));
    return new Promise(resolve => {
      if (!workers.length) for (let i = 0; i < N; i++) spawn();
      queue.push({ id: nextId++, t, resolve: k ? r => { store.set(k, r); buf.push(JSON.stringify([k, r]) + '\n'); resolve(r); } : resolve }); pump();
    });
  };
  const run = tasks => Promise.all(tasks.map(runOne));
  const summarize = rs => {
    const reasons = {};
    for (const r of rs) { const k = (r.win ? 'W:' : 'L:') + r.reason; reasons[k] = (reasons[k] || 0) + 1; }
    return { w: rs.filter(r => r.win).length, n: rs.length, reasons, avgShare: rs.reduce((a, r) => a + r.share, 0) / rs.length, avgTick: rs.reduce((a, r) => a + r.tick, 0) / rs.length, rs };
  };
  const series = async (level, gP, gE, sd = H.SEEDS) => summarize(await run(sd.map(seed => ({ level, gP, gE, seed }))));
  const duel = async (level, gA, gB, sd = H.SEEDS) => {
    const [a, b] = await Promise.all([run(sd.map(seed => ({ level, gP: gA, gE: gB, seed }))), run(sd.map(seed => ({ level, gP: gB, gE: gA, seed })))]);
    return summarize([...a, ...b.map(r => ({ ...r, win: !r.win, share: 1 - r.share, p: r.e, e: r.p }))]);
  };
  // the harness's greedy hill-climb, with every candidate edit of a step evaluated at once (both corners with `both`)
  async function climb(level, opp, { budget, allowed, start = H.DEFAULT, steps = 3, sd = H.seeds(4), both = false, log = console.log } = {}) {
    const score = s => s.w + s.avgShare, ev = (g) => both ? duel(level, g, opp, sd) : series(level, g, opp, sd);
    let cur = H.clone(start), curS = await ev(cur); const path = [];
    log(`  start: ${curS.w}/${curS.n} share ${curS.avgShare.toFixed(2)} cost ${H.genomeCost(cur)}`);
    for (let st = 0; st < steps && curS.w < curS.n; st++) {
      const ms = H.moves(cur, allowed).filter(([, h]) => H.genomeCost(h) <= budget);
      const ss = await Promise.all(ms.map(([, h]) => ev(h)));
      let bi = -1; ss.forEach((s, i) => { if (bi < 0 || score(s) > score(ss[bi])) bi = i; });
      if (bi < 0 || score(ss[bi]) <= score(curS)) { log('  no improving move'); break; }
      cur = ms[bi][1]; curS = ss[bi]; path.push(ms[bi][0]);
      log(`  step ${st + 1}: ${path.join(' ')} -> ${H.fmt(curS)} cost ${H.genomeCost(cur)}`);
    }
    return { genome: cur, series: curS, path };
  }
  module.exports = { run, series, duel, climb, cache, close: () => { flush(); if (timer) clearInterval(timer); workers.forEach(w => w.terminate()); } };
}

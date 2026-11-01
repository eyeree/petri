// A worker-thread pool for the balance scripts: rounds run in parallel on every core. run(tasks) takes
// [{ level, gP, gE, seed }] and resolves to the same results as harness.run, in order; series(level, gP, gE, seeds)
// and climb(...) mirror the harness versions. Workers load the simulation once and stay up until close().
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
  const runOne = t => new Promise(resolve => { if (!workers.length) for (let i = 0; i < N; i++) spawn(); queue.push({ id: nextId++, t, resolve }); pump(); });
  const run = tasks => Promise.all(tasks.map(runOne));
  const summarize = rs => {
    const reasons = {};
    for (const r of rs) { const k = (r.win ? 'W:' : 'L:') + r.reason; reasons[k] = (reasons[k] || 0) + 1; }
    return { w: rs.filter(r => r.win).length, n: rs.length, reasons, avgShare: rs.reduce((a, r) => a + r.share, 0) / rs.length, avgTick: rs.reduce((a, r) => a + r.tick, 0) / rs.length, rs };
  };
  const series = async (level, gP, gE, sd = H.SEEDS) => summarize(await run(sd.map(seed => ({ level, gP, gE, seed }))));
  // the harness's greedy hill-climb, with every candidate edit of a step evaluated at once
  async function climb(level, opp, { budget, allowed, start = H.DEFAULT, steps = 3, sd = H.seeds(4), log = console.log } = {}) {
    const score = s => s.w + s.avgShare;
    let cur = H.clone(start), curS = await series(level, cur, opp, sd); const path = [];
    log(`  start: ${curS.w}/${sd.length} share ${curS.avgShare.toFixed(2)} cost ${H.genomeCost(cur)}`);
    for (let st = 0; st < steps && curS.w < sd.length; st++) {
      const ms = H.moves(cur, allowed).filter(([, h]) => H.genomeCost(h) <= budget);
      const ss = await Promise.all(ms.map(([, h]) => series(level, h, opp, sd)));
      let bi = -1; ss.forEach((s, i) => { if (bi < 0 || score(s) > score(ss[bi])) bi = i; });
      if (bi < 0 || score(ss[bi]) <= score(curS)) { log('  no improving move'); break; }
      cur = ms[bi][1]; curS = ss[bi]; path.push(ms[bi][0]);
      log(`  step ${st + 1}: ${path.join(' ')} -> ${H.fmt(curS)} cost ${H.genomeCost(cur)}`);
    }
    return { genome: cur, series: curS, path };
  }
  module.exports = { run, series, climb, close: () => workers.forEach(w => w.terminate()) };
}

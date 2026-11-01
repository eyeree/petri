// How much of each plate's food a strain can reach and eat by terrain key: walking from the gold start over plain
// agar only, then with salt, granite, lit agar, antibiotic halos or chilled agar added. Food lying on salt, under the
// lamp, in a halo or on the cold is listed apart, since reaching it is not the same as being able to stand on it.
// Glass beads and disc paper are never passable. node tools/balance/gating.js
const M = require('./sim.js');
const { LEVELS, makeDish, N, NN, T_AGAR, T_ROCK, T_SALT, T_LIGHT, T_HALO, T_COLD, CORE_P, FOOD_NAMES } = M;
const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
function reach(d, pass) {
  const seen = new Uint8Array(NN), q = [CORE_P]; seen[CORE_P] = 1;
  while (q.length) {
    const i = q.pop(), x = i % N, y = (i - x) / N;
    for (let k = 0; k < 8; k++) {
      const nx = x + DX[k], ny = y + DY[k]; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      const j = ny * N + nx; if (seen[j] || !pass(d.terrain[j])) continue; seen[j] = 1; q.push(j);
    }
  }
  return seen;
}
const keys = { 'plain agar': [], '+salt': [T_SALT], '+granite': [T_ROCK], '+light': [T_LIGHT], '+halo': [T_HALO], '+cold': [T_COLD] };
LEVELS.forEach((L, li) => {
  const d = makeDish(li), byType = new Array(FOOD_NAMES.length).fill(0), on = {}; let tot = 0;
  for (let i = 0; i < NN; i++) { const f = d.food0[i]; if (!f) continue; tot += f; byType[d.foodType[i]] += f; const t = d.terrain[i]; on[t] = (on[t] || 0) + f; }
  const pct = v => `${Math.round(100 * (v || 0) / tot)}%`;
  const reachable = Object.entries(keys).map(([k, extra]) => { const s = reach(d, t => t === T_AGAR || extra.includes(t)); let f = 0; for (let i = 0; i < NN; i++) if (s[i] && d.food0[i] > 0 && d.terrain[i] === T_AGAR) f += d.food0[i]; return `${k} ${pct(f)}`; });
  console.log(`${L.code} ${L.name}: food ${Math.round(tot)} (${byType.map((v, f) => v ? `${FOOD_NAMES[f]} ${pct(v)}` : '').filter(Boolean).join(', ')}); on salt ${pct(on[T_SALT])}, under the lamp ${pct(on[T_LIGHT])}, in halos ${pct(on[T_HALO])}, on the cold ${pct(on[T_COLD])}${d.cycle ? `; lamp cycle ${d.cycle} min` : ''}`);
  console.log(`  food on plain agar reachable from the gold start over: ${reachable.join(' | ')}`);
});

// How much of each plate's food a strain can reach and eat by terrain key: walking from the gold start over plain
// agar only, then with salt, granite or lit agar added. Food lying on salt or under the lamp is listed apart, since
// reaching it is not the same as being able to stand on it.
// node tools/balance/gating.js
const M = require('./sim.js');
const { LEVELS, makeDish, N, NN, T_VOID, T_AGAR, T_ROCK, T_SALT, T_LIGHT, CORE_P, FOOD_NAMES } = M;
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
const keys = { 'plain agar': t => t === T_AGAR, '+salt': t => t === T_AGAR || t === T_SALT, '+granite': t => t === T_AGAR || t === T_ROCK, '+light': t => t === T_AGAR || t === T_LIGHT };
LEVELS.forEach((L, li) => {
  const d = makeDish(li), byType = [0, 0, 0, 0]; let tot = 0, onSalt = 0, onLight = 0;
  for (let i = 0; i < NN; i++) { const f = d.food0[i]; if (!f) continue; tot += f; byType[d.foodType[i]] += f; if (d.terrain[i] === T_SALT) onSalt += f; if (d.terrain[i] === T_LIGHT) onLight += f; }
  const pct = v => `${Math.round(100 * v / tot)}%`;
  const reachable = Object.entries(keys).map(([k, pass]) => { const s = reach(d, pass); let f = 0; for (let i = 0; i < NN; i++) if (s[i] && d.food0[i] > 0 && d.terrain[i] === T_AGAR) f += d.food0[i]; return `${k} ${pct(f)}`; });
  console.log(`${L.code} ${L.name}: food ${Math.round(tot)} (${[1, 2, 3].filter(f => byType[f]).map(f => `${FOOD_NAMES[f]} ${pct(byType[f])}`).join(', ')}); on salt ${pct(onSalt)}, under the lamp ${pct(onLight)}`);
  console.log(`  food on plain agar reachable from the gold start over: ${reachable.join(' | ')}`);
});

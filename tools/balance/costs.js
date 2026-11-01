// The proposed catalogue and opponent roster of game-play-design.md, costed, with the budget rule (a plate's
// budget rises by at most half the kb of the genes it introduces). A pure calculator: nothing here is read from
// index.html, so it can be edited ahead of the code. node tools/balance/costs.js
const TRAIT = [0, 0, 1, 2, 4, 6], DRIVE = [0, 0, 1, 2, 3, 5];
const COST = {
  amylase: 1, protease: 1, ligninase: 2, chloro: 3, necro: 2, chitin: 2, mucus: 2, osmo: 1, sclero: 2, regen: 2, crush: 2, acid: 3, toxin: 3, spores: 3, prune: 1, granules: 2,
  rockscent: 1, brine: 2, anast: 2, melanin: 1, tipdom: 1, efflux: 2, sapro: 2, chitinase: 2, nomad: 2, rmem: 1, antifreeze: 2, thermo: 2, torpor: 1, encyst: 2,
  lipase: 2, lytic: 3, armour: 2, circadian: 2, negphoto: 2, photolyase: 1, surge: 2, shun: 1, cryptic: 2,
};
const NEW = {
  P1: ['amylase', 'protease', 'chitin', 'crush', 'regen', 'prune'], P2: ['acid', 'ligninase', 'mucus', 'rockscent'], P3: ['osmo', 'brine', 'granules', 'anast'],
  P4: ['chloro', 'melanin', 'sclero', 'tipdom'], P5: ['toxin', 'efflux', 'necro', 'sapro'], P6: ['chitinase', 'spores', 'nomad', 'rmem'], P7: ['antifreeze', 'thermo', 'torpor', 'encyst'],
  P8: ['lipase', 'lytic', 'armour'], P9: ['circadian', 'negphoto', 'photolyase'], P10: ['surge', 'shun', 'cryptic'],
};
const BUDGET = { P1: 12, P2: 15, P3: 17, P4: 19, P5: 22, P6: 25, P7: 28, P8: 31, P9: 33, P10: 35 };
const R = (v, d, s, f, h, e, ...genes) => ({ v, d, s, f, h, e, genes });
const ROSTER = {
  P1: { 'Fuligo minor / Rusher': R(2, 3, 2, 3, 3, 1, 'amylase', 'protease', 'crush', 'chitin'), 'Didymium ferox / Healer-hunter': R(2, 2, 2, 3, 3, 1, 'amylase', 'protease', 'crush', 'regen'), 'Diderma lentum / Miser': R(1, 3, 3, 4, 1, 1, 'amylase', 'protease', 'chitin', 'regen', 'prune') },
  P2: { 'Lycogala corrodens': R(2, 2, 3, 3, 3, 1, 'amylase', 'acid', 'ligninase'), 'Comatricha tenax / Wall-runner': R(3, 2, 4, 4, 1, 3, 'amylase', 'protease', 'prune', 'rockscent'), 'Diderma saxicola / Ring squatter': R(2, 3, 3, 3, 2, 1, 'amylase', 'ligninase', 'acid', 'mucus', 'chitin') },
  P3: { 'Stemonitis lorica': R(2, 3, 3, 4, 2, 1, 'amylase', 'protease', 'ligninase', 'chitin', 'osmo', 'regen', 'prune'), 'Mucilago crustacea / Crust': R(2, 3, 2, 4, 1, 1, 'amylase', 'ligninase', 'osmo', 'brine', 'prune', 'chitin'), 'Badhamia salina / Salt raider': R(3, 2, 3, 3, 4, 2, 'amylase', 'protease', 'osmo', 'crush', 'acid') },
  P4: { 'Ceratiomyxa lumina': R(3, 3, 3, 3, 2, 2, 'chloro', 'amylase', 'sclero', 'prune'), 'Lamproderma scintillans / Shade-runner': R(3, 2, 3, 4, 1, 3, 'amylase', 'ligninase', 'melanin', 'prune', 'tipdom'), 'Physarum solare / Solar brawler': R(3, 3, 3, 2, 3, 1, 'chloro', 'crush', 'acid', 'sclero') },
  P5: { 'Badhamia vorax': R(4, 2, 4, 3, 4, 1, 'protease', 'amylase', 'acid', 'crush', 'efflux'), 'Physarum cinereum / Lawn haze': R(2, 3, 3, 4, 2, 1, 'protease', 'toxin', 'mucus', 'efflux', 'prune'), 'Metatrichia vesparium / Carrion': R(3, 2, 3, 3, 4, 2, 'protease', 'amylase', 'sapro', 'necro', 'crush') },
  P6: { 'Badhamia utricularis / Mat grazer': R(3, 2, 3, 5, 1, 2, 'chitinase', 'amylase', 'prune', 'nomad', 'regen'), 'Cribraria aurantiaca / Sporulator': R(2, 2, 4, 4, 1, 3, 'chitinase', 'spores', 'granules', 'prune', 'amylase'), 'Stemonitis fusca / Mat warden': R(3, 3, 3, 3, 3, 1, 'chitinase', 'toxin', 'efflux', 'chitin', 'crush') },
  P7: { 'Lamproderma columbinum / Shelf grazer': R(3, 2, 4, 4, 2, 2, 'amylase', 'ligninase', 'antifreeze', 'prune', 'torpor', 'granules', 'regen'), 'Diderma niveum / Snowbank': R(2, 4, 3, 3, 3, 1, 'amylase', 'ligninase', 'thermo', 'chitin', 'encyst', 'regen', 'crush'), 'Physarum alpinum / Frost raider': R(4, 2, 4, 3, 4, 2, 'amylase', 'protease', 'antifreeze', 'crush', 'acid', 'rmem', 'efflux') },
  P8: { 'Trichia favoginea / Prospector': R(3, 2, 4, 4, 1, 4, 'lipase', 'amylase', 'tipdom', 'prune', 'rockscent'), 'Arcyria incisa / Vein-cutter': R(3, 2, 4, 3, 4, 2, 'lipase', 'lytic', 'rmem', 'crush', 'acid'), 'Hemitrichia serpula / the Net': R(2, 3, 3, 4, 2, 2, 'lipase', 'anast', 'armour', 'granules', 'prune', 'amylase', 'regen') },
  P9: { 'Didymium nigripes / Night-shift': R(4, 2, 4, 4, 2, 3, 'amylase', 'protease', 'ligninase', 'negphoto', 'photolyase', 'melanin', 'prune', 'tipdom'), 'Physarum viride / Day-shift': R(3, 3, 4, 3, 3, 2, 'chloro', 'circadian', 'amylase', 'ligninase', 'sclero', 'prune', 'regen'), 'Fuligo septica / the Yellow Sheet': R(3, 4, 3, 3, 3, 1, 'chloro', 'circadian', 'granules', 'chitin', 'crush', 'acid', 'mucus', 'amylase') },
  P10: { 'Physarum senex': R(3, 3, 5, 3, 3, 2, 'amylase', 'protease', 'ligninase', 'acid', 'mucus', 'chitin', 'regen', 'osmo', 'prune', 'chloro', 'efflux', 'chitinase', 'lipase', 'antifreeze'), 'Brefeldia maxima / the Hydra': R(2, 3, 4, 4, 2, 2, 'amylase', 'protease', 'chitinase', 'lipase', 'anast', 'armour', 'regen', 'granules', 'prune', 'thermo', 'osmo'), 'Leocarpus fragilis / the Plague': R(4, 2, 5, 2, 5, 1, 'protease', 'sapro', 'toxin', 'lytic', 'surge', 'acid', 'efflux', 'cryptic') },
};
const cost = g => TRAIT[g.v] + TRAIT[g.d] + TRAIT[g.s] + DRIVE[g.f] + DRIVE[g.h] + DRIVE[g.e] + g.genes.reduce((a, id) => { if (!(id in COST)) throw new Error('unknown gene ' + id); return a + COST[id]; }, 0);
// an opponent may use only genes usable on its plate
const usable = new Set(); let prev = null, total = 0, ok = true;
for (const p of Object.keys(NEW)) {
  for (const id of NEW[p]) usable.add(id);
  const kb = NEW[p].reduce((a, id) => a + COST[id], 0), rise = prev == null ? 0 : BUDGET[p] - prev, pass = rise <= kb / 2;
  ok = ok && pass; total += kb; prev = BUDGET[p];
  console.log(`${p.padEnd(4)} budget ${String(BUDGET[p]).padStart(2)} (+${rise})  new genes ${NEW[p].length} = ${kb} kb  ${pass ? 'ok' : 'RISE TOO LARGE'}`);
  for (const [name, g] of Object.entries(ROSTER[p] || {})) {
    const late = g.genes.filter(id => !usable.has(id));
    console.log(`     ${String(cost(g)).padStart(2)} kb  ${name}${cost(g) > BUDGET[p] ? '  (over budget)' : ''}${late.length ? `  USES LATER GENES: ${late.join(', ')}` : ''}`);
  }
}
console.log(`\n${Object.keys(COST).length} genes, ${total} kb in all; traits and drives maxed 33 kb; budget rule ${ok ? 'holds' : 'BROKEN'}`);

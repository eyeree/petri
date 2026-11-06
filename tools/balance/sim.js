// Loads the simulation block of index.html as a Node module: everything from the MYXO SIMULATION banner to the
// module.exports line, which has no DOM dependencies. The balance scripts require this instead of a copy, so they
// always test the code that ships.
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', '..', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const start = html.indexOf('// ===================== MYXO SIMULATION');
const exp = html.indexOf("if (typeof module !== 'undefined') module.exports", start);
if (start < 0 || exp < 0) throw new Error('simulation block not found in ' + file);
const end = html.indexOf('\n', exp);
const m = { exports: {} };
new Function('module', html.slice(start, end))(m);
module.exports = m.exports;
// A fingerprint of the simulation's rules, for caches of round results: the block without the opponents' genome lines
// (which only say who plays, and are rewritten by tuning), so any change to the rules or the plates starts a new cache.
module.exports.SIM_HASH = require('crypto').createHash('sha1').update(html.slice(start, end).replace(/^\s*rival: .*$/gm, '')).digest('hex').slice(0, 16);
// The fingerprint a state blob carries (see Debug: state blobs in index.html): FNV-1a over the same text, line endings
// normalised as a browser's parser does, so repro.js can tell a blob saved on other rules.
module.exports.SIM_FP = (() => {
  let h = 2166136261; const s = html.slice(start, end).replace(/\r\n?/g, '\n').replace(/^\s*rival: .*$/gm, '');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
})();

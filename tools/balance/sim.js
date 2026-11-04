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

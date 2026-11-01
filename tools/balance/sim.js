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

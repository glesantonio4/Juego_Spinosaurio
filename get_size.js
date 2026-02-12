const fs = require('fs');
const b = fs.readFileSync('saurio.png');
const w = b.readUInt32BE(16);
const h = b.readUInt32BE(20);
console.log(w + 'x' + h);

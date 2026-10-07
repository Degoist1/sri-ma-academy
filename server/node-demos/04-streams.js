// Streams: handle a file in small chunks instead of loading it all
const fs = require('fs');

fs.writeFileSync('big.txt', 'player attendance line\n'.repeat(1000));

const reader = fs.createReadStream('big.txt', { highWaterMark: 1024 }); // 1 KB chunks
let chunks = 0;
reader.on('data', () => chunks++);
reader.on('end', () => console.log('finished reading, chunks:', chunks));

// pipe: read stream -> write stream (copy a file)
fs.createReadStream('big.txt').pipe(fs.createWriteStream('big-copy.txt'));

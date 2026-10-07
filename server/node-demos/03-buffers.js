// Buffers: raw bytes
const buf = Buffer.from('Sri Ma Academy');

console.log(buf);                        // bytes
console.log(buf.length);                 // 14
console.log(buf.toString());             // back to text
console.log(buf.toString('hex'));
console.log(buf.toString('base64'));

const small = Buffer.alloc(5);           // 5 empty bytes
small.write('Hi');
console.log(small);

// Event loop: see the order in which things run
console.log('1 script start');

setTimeout(() => console.log('5 setTimeout'), 0);
setImmediate(() => console.log('5 setImmediate (may swap with setTimeout)'));
Promise.resolve().then(() => console.log('4 promise'));
process.nextTick(() => console.log('3 nextTick'));

console.log('2 script end');

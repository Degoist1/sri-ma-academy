// File system: create, append, read (sync and async), delete
const fs = require('fs');

fs.writeFileSync('log.txt', 'Attendance log\n');               // create / overwrite
fs.appendFileSync('log.txt', '2026-10-02 Rahul present\n');     // add a line
console.log(fs.readFileSync('log.txt', 'utf8'));                // blocking read

// non-blocking read: the callback runs later
fs.readFile('log.txt', 'utf8', (err, data) => {
  if (err) return console.log(err.message);
  console.log('async read done, characters:', data.length);
  fs.unlinkSync('log.txt');                                     // delete the file
});
console.log('this line prints BEFORE the async read finishes');

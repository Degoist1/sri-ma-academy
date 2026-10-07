// Makes the bcrypt hash for the admin password. The real password is never stored.
// run: node scripts/hash-password.js "your long password"
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password || password.length < 10) {
  console.log('Usage: node scripts/hash-password.js "<password with 10+ characters>"');
  process.exit(1);
}
console.log(bcrypt.hashSync(password, 12));

// Prints an ADMIN_PASSWORD_HASH value for the admin password, so the
// password itself never has to be stored in Vercel.
//   npm --prefix backend run hash-password
const readline = require('readline');
const { hashPassword, MIN_LENGTH } = require('../src/lib/password');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
rl._writeToOutput = (s) => {
  if (s.includes('Admin password')) process.stdout.write(s);
};
rl.question('Admin password (hidden): ', (pw) => {
  rl.close();
  process.stdout.write('\n');
  if (pw.length < MIN_LENGTH) {
    console.error(`Use at least ${MIN_LENGTH} characters.`);
    process.exit(1);
  }
  console.log(`\nADMIN_PASSWORD_HASH=${hashPassword(pw)}\n`);
  console.log('Add this to Vercel (and remove ADMIN_PASSWORD there).');
});

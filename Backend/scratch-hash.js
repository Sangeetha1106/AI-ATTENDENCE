const bcrypt = require('bcrypt');
async function test() {
  const hash = '$2b$10$x8AhO10K0lr54EZ4RpiNleLcWCQQLyo7Hi2hBoZsMwQqIb3yCjSO6';
  const match = await bcrypt.compare('Password123', hash);
  console.log('Matches Password123?', match);
  process.exit();
}
test();

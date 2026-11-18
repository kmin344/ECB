// Gives an existing account the admin role. Use it to create the first admin:
//   1. Register the account through the storefront or POST /api/auth/register.
//   2. docker compose exec auth-service node scripts/promote-admin.js admin@example.com
//   3. Log in again: the role is read into the token at login.
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: node scripts/promote-admin.js <email>');
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/auth-service');
  try {
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) {
      console.error(`No account with email ${email}`);
      process.exitCode = 1;
      return;
    }
    console.log(`${user.email} is now an admin. Log in again to get an admin token.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Could not promote the account:', error.message);
  process.exitCode = 1;
});

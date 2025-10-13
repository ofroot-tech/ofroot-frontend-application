// scripts/create-user.js
require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set. Aborting.');
    process.exit(1);
  }

  // Removed hardcoded credentials. Provide via env or CLI args if needed.
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;
  const name = process.env.SEED_USER_NAME || 'Seed User';

  if (!email || !password) {
    console.error('Missing SEED_USER_EMAIL or SEED_USER_PASSWORD. Aborting.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await client.connect();
    const db = client.db(); // Uses db from URI
    const users = db.collection('User');
    const result = await users.updateOne(
      { email },
      { $set: { passwordHash, name, email } },
      { upsert: true }
    );
    console.log('User created/updated:', result);
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

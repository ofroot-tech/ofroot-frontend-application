// scripts/create-user.js
require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  const email = 'dimitri.mcdaniel@gmail.com';
  const password = 'True1231d!';
  const name = 'Dimitri McDaniel';

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

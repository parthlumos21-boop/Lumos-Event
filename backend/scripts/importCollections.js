const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { COLLECTIONS, SNAPSHOT_DIR, getMongoUri } = require('./dbCollections');

const { EJSON } = mongoose.mongo.BSON;

async function importCollections() {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    console.error(`Snapshot directory not found: ${SNAPSHOT_DIR}`);
    console.error('Run "npm run db:export" in the source environment first.');
    process.exit(1);
  }

  const mongoUri = getMongoUri();
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  let totalProcessed = 0;
  for (const name of COLLECTIONS) {
    const filePath = path.join(SNAPSHOT_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping "${name}" (no snapshot file found).`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const docs = EJSON.parse(raw, { relaxed: false });

    if (!Array.isArray(docs) || docs.length === 0) {
      console.log(`Skipping "${name}" (0 documents in snapshot).`);
      continue;
    }

    const ops = docs.map((doc) => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true
      }
    }));

    const result = await db.collection(name).bulkWrite(ops, { ordered: false });
    const upserted = result.upsertedCount || 0;
    const modified = result.modifiedCount || 0;
    const matched = result.matchedCount || 0;
    totalProcessed += docs.length;

    console.log(
      `Imported "${name}": ${docs.length} docs (${upserted} inserted, ${modified} updated, ${matched} existing)`
    );
  }

  console.log(`\nImport complete: ${totalProcessed} total documents processed.`);
  await mongoose.disconnect();
}

importCollections()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('Import failed:', err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  });

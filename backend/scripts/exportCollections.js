const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { COLLECTIONS, SNAPSHOT_DIR, getMongoUri } = require('./dbCollections');

const { EJSON } = mongoose.mongo.BSON;

async function exportCollections() {
  const mongoUri = getMongoUri();
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  const db = mongoose.connection.db;

  let totalDocs = 0;
  for (const name of COLLECTIONS) {
    const docs = await db.collection(name).find({}).toArray();
    const outPath = path.join(SNAPSHOT_DIR, `${name}.json`);
    const serialized = EJSON.stringify(docs, null, 2, { relaxed: false });
    fs.writeFileSync(outPath, serialized, 'utf8');
    totalDocs += docs.length;
    console.log(`Exported ${docs.length} documents from "${name}" -> ${path.relative(process.cwd(), outPath)}`);
  }

  console.log(`\nExport complete: ${totalDocs} total documents across ${COLLECTIONS.length} collections.`);
  await mongoose.disconnect();
}

exportCollections()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('Export failed:', err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  });

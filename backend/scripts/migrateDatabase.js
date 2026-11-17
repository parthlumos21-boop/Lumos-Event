const mongoose = require('mongoose');

async function migrate() {
  const baseUri = process.env.MONGO_BASE_URI || 'mongodb://127.0.0.1:27017';
  console.log('--- Starting Database Migration ---');

  // Source DB: crm
  const crmConn = await mongoose.createConnection(`${baseUri}/crm`).asPromise();
  console.log('Connected to source DB (crm)');

  // Target DB: LumosEvent
  const lumosConn = await mongoose.createConnection(`${baseUri}/LumosEvent`).asPromise();
  console.log('Connected to target DB (LumosEvent)');

  const crmDb = crmConn.db;
  const lumosDb = lumosConn.db;

  const collections = await crmDb.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  console.log('Collections in crm:', collectionNames);

  let docsToMigrate = [];

  // Check lumos_event in crm
  if (collectionNames.includes('lumos_event')) {
    const docs = await crmDb.collection('lumos_event').find({}).toArray();
    console.log(`Found ${docs.length} documents in crm.lumos_event`);
    docsToMigrate = docsToMigrate.concat(docs);
  }

  // Also check if crm or lumos_event database had office_event_guests
  if (collectionNames.includes('office_event_guests')) {
    const docs = await crmDb.collection('office_event_guests').find({}).toArray();
    console.log(`Found ${docs.length} documents in crm.office_event_guests`);
    for (const d of docs) {
      if (!docsToMigrate.some(existing => String(existing._id) === String(d._id))) {
        docsToMigrate.push(d);
      }
    }
  }

  // Also check old lumos_event db if it exists
  try {
    const oldConn = await mongoose.createConnection(`${baseUri}/lumos_event`).asPromise();
    const oldCollections = await oldConn.db.listCollections().toArray();
    const oldColNames = oldCollections.map(c => c.name);
    if (oldColNames.includes('office_event_guests')) {
      const oldDocs = await oldConn.db.collection('office_event_guests').find({}).toArray();
      console.log(`Found ${oldDocs.length} documents in lumos_event.office_event_guests`);
      for (const d of oldDocs) {
        if (!docsToMigrate.some(existing => String(existing._id) === String(d._id))) {
          docsToMigrate.push(d);
        }
      }
    }
    await oldConn.close();
  } catch (err) {
    console.log('No separate lumos_event database found or accessible:', err.message);
  }

  console.log(`Total unique documents to migrate into LumosEvent.lumos_event: ${docsToMigrate.length}`);

  if (docsToMigrate.length > 0) {
    const targetCol = lumosDb.collection('lumos_event');
    let inserted = 0;
    let updated = 0;

    for (const doc of docsToMigrate) {
      const res = await targetCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
      if (res.upsertedCount > 0) inserted++;
      else updated++;
    }
    console.log(`Migration complete: ${inserted} inserted, ${updated} updated in LumosEvent.lumos_event`);
  } else {
    console.log('No existing records needed migration. LumosEvent.lumos_event is ready for fresh entries.');
  }

  await crmConn.close();
  await lumosConn.close();
  console.log('--- Migration Finished Successfully ---');
}

migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });

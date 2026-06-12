const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:limuHH769pyTW9on@db.yogxblilehxqjaunjhey.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const sql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', '20260611000000_message_attachments_storage.sql'), 'utf8');
    await client.query(sql);
    console.log("SQL executing complete!");
  } catch (err) {
    console.error("Error executing SQL", err);
  } finally {
    await client.end();
  }
}

run();

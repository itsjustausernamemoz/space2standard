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
    const sqlFile = '/Users/onkoshi/Documents/GitHub/space2standard/supabase/migrations/20260411190000_create_communication_logs.sql';
    const sql = fs.readFileSync(sqlFile, 'utf8');
    await client.query(sql);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();

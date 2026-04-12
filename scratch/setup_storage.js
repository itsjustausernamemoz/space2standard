const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:limuHH769pyTW9on@db.yogxblilehxqjaunjhey.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const sql = `
      -- 1. Create the bucket
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('communications', 'communications', false)
      ON CONFLICT (id) DO NOTHING;

      -- 2. Add policies for authenticated users
      DELETE FROM storage.policies WHERE name = 'Admin communications access';
      CREATE POLICY "Admin communications access"
      ON storage.objects FOR ALL
      TO authenticated
      USING (bucket_id = 'communications')
      WITH CHECK (bucket_id = 'communications');
    `;
    await client.query(sql);
    console.log("Bucket and policies created successfully!");
  } catch (err) {
    console.error("Setup failed:", err);
  } finally {
    await client.end();
  }
}

run();

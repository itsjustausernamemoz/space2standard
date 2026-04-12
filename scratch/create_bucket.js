const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:limuHH769pyTW9on@db.yogxblilehxqjaunjhey.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    // Create bucket if not exists via SQL (Supabase storage.buckets table)
    const sql = `
      -- 1. Create the bucket
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('communications', 'communications', false)
      ON CONFLICT (id) DO NOTHING;

      -- 2. Enable RLS
      -- 3. Policy: Admin can do anything in this bucket
      -- Note: In Supabase, bucket policies are often handled in the storage schema
      -- We'll add a catch-all for authenticated users (admins) for now.
      DELETE FROM storage.policies WHERE name = 'Admin communications access';
      CREATE POLICY "Admin communications access"
      ON storage.objects FOR ALL
      TO authenticated
      USING (bucket_id = 'communications')
      WITH CHECK (bucket_id = 'communications');
    `;
    await client.query(sql);
    console.log("Bucket creation successful!");
  } catch (err) {
    console.error("Bucket creation failed:", err);
  } finally {
    await client.end();
  }
}

run();

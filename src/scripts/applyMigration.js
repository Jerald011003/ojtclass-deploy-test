// Run the migration to add the approval_status column
import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const migrationPath = join(dirname(dirname(__dirname)), 'drizzle', '0003_add_approval_status.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    console.log('Running migration...');
    
    await pool.query(migrationSql);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await pool.end();
  }
}

applyMigration(); 
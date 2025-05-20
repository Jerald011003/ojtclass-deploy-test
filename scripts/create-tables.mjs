#!/usr/bin/env node
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();
const { Client } = pg;

async function createTables() {
  console.log('🚀 Creating database tables...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create enums one by one
    console.log('⏳ Creating user_role enum...');
    await client.query(`CREATE TYPE user_role AS ENUM ('student', 'professor', 'admin');`)
      .catch(err => {
        if (err.code === '42710') {
          console.log('ℹ️ user_role enum already exists');
        } else {
          throw err;
        }
      });

    console.log('⏳ Creating activity_type enum...');
    await client.query(`CREATE TYPE activity_type AS ENUM ('student', 'professor', 'company', 'system');`)
      .catch(err => {
        if (err.code === '42710') {
          console.log('ℹ️ activity_type enum already exists');
        } else {
          throw err;
        }
      });

    console.log('⏳ Creating report_status enum...');
    await client.query(`CREATE TYPE report_status AS ENUM ('pending', 'submitted', 'reviewed', 'approved', 'rejected');`)
      .catch(err => {
        if (err.code === '42710') {
          console.log('ℹ️ report_status enum already exists');
        } else {
          throw err;
        }
      });

    console.log('⏳ Creating task_status enum...');
    await client.query(`CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');`)
      .catch(err => {
        if (err.code === '42710') {
          console.log('ℹ️ task_status enum already exists');
        } else {
          throw err;
        }
      });

    // Create users table
    console.log('⏳ Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ojtclassroom-finalproj_user" (
        id SERIAL PRIMARY KEY,
        clerk_id TEXT NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        role user_role NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create companies table
    console.log('⏳ Creating companies table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ojtclassroom-finalproj_company" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create activities table
    console.log('⏳ Creating activities table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ojtclassroom-finalproj_activity" (
        id SERIAL PRIMARY KEY,
        type activity_type NOT NULL,
        action TEXT NOT NULL,
        user_id INTEGER REFERENCES "ojtclassroom-finalproj_user"(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create system_metrics table
    console.log('⏳ Creating system_metrics table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ojtclassroom-finalproj_system_metrics" (
        id SERIAL PRIMARY KEY,
        system_load INTEGER NOT NULL,
        storage_usage INTEGER NOT NULL,
        last_backup TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create classrooms table
    console.log('⏳ Creating classrooms table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ojtclassroom-finalproj_classroom" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image TEXT,
        professor_id INTEGER REFERENCES "ojtclassroom-finalproj_user"(id) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create student_classroom table
    console.log('⏳ Creating student_classroom table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ojtclassroom-finalproj_student_classroom" (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES "ojtclassroom-finalproj_user"(id) NOT NULL,
        classroom_id INTEGER REFERENCES "ojtclassroom-finalproj_classroom"(id) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create time_entry table
    console.log('⏳ Creating time_entry table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ojtclassroom-finalproj_time_entry" (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES "ojtclassroom-finalproj_user"(id) NOT NULL,
        classroom_id INTEGER REFERENCES "ojtclassroom-finalproj_classroom"(id) NOT NULL,
        date DATE NOT NULL,
        hours INTEGER NOT NULL,
        description TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create reports table
    console.log('⏳ Creating reports table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ojtclassroom-finalproj_report" (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE NOT NULL,
        classroom_id INTEGER REFERENCES "ojtclassroom-finalproj_classroom"(id) NOT NULL,
        student_id INTEGER REFERENCES "ojtclassroom-finalproj_user"(id) NOT NULL,
        status report_status NOT NULL DEFAULT 'pending',
        submission_url TEXT,
        feedback TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create tasks table
    console.log('⏳ Creating tasks table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "ojtclassroom-finalproj_task" (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        classroom_id INTEGER REFERENCES "ojtclassroom-finalproj_classroom"(id) NOT NULL,
        student_id INTEGER REFERENCES "ojtclassroom-finalproj_user"(id) NOT NULL,
        status task_status NOT NULL DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('🎉 All tables created successfully!');
  } catch (error) {
    console.error('\n❌ Error creating tables:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if ('code' in error) {
        console.error(`   Error code: ${error.code}`);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTables().catch((error) => {
  console.error('\n❌ Fatal error:');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}); 
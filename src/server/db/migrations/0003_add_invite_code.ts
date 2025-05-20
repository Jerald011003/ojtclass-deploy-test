import { sql } from "drizzle-orm";
import { PgDatabase } from "drizzle-orm/pg-core";

export async function up(db: PgDatabase<any, any, any>) {
  // Add inviteCode column to classrooms table
  await db.execute(
    sql`ALTER TABLE classroom ADD COLUMN invite_code VARCHAR(8)`
  );

  // Convert status column in student_classroom from varchar to integer
  await db.execute(
    sql`ALTER TABLE student_classroom ALTER COLUMN status DROP DEFAULT`
  );
  await db.execute(
    sql`ALTER TABLE student_classroom ALTER COLUMN status TYPE INTEGER USING CASE 
      WHEN status = 'active' THEN 0 
      WHEN status = 'completed' THEN 100 
      ELSE 0 END`
  );
  await db.execute(
    sql`ALTER TABLE student_classroom ALTER COLUMN status SET DEFAULT 0`
  );
}

export async function down(db: PgDatabase<any, any, any>) {
  // Remove inviteCode column from classrooms table
  await db.execute(
    sql`ALTER TABLE classroom DROP COLUMN invite_code`
  );

  // Convert status column in student_classroom back to varchar
  await db.execute(
    sql`ALTER TABLE student_classroom ALTER COLUMN status DROP DEFAULT`
  );
  await db.execute(
    sql`ALTER TABLE student_classroom ALTER COLUMN status TYPE VARCHAR(50) USING CASE 
      WHEN status = 0 THEN 'active' 
      WHEN status = 100 THEN 'completed' 
      ELSE 'active' END`
  );
  await db.execute(
    sql`ALTER TABLE student_classroom ALTER COLUMN status SET DEFAULT 'active'`
  );
} 
#!/usr/bin/env node
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { activities, systemMetrics, users } from "../src/server/db/schema";
import { sql } from "drizzle-orm";

// Load environment variables
dotenv.config();

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is required");
  process.exit(1);
}

// Database connection configuration
const connectionConfig = {
  ssl: true,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
};

const client = postgres(DATABASE_URL, connectionConfig);
const db = drizzle(client);

async function setup() {
  console.log("🚀 Starting database setup...");

  try {
    // Check database connection
    console.log("⏳ Testing database connection...");
    await db.execute(sql`SELECT NOW()`);
    console.log("✅ Database connection successful");

    // Initialize system metrics
    console.log("⏳ Setting up system metrics...");
    const existingMetrics = await db.select().from(systemMetrics).limit(1);
    
    if (!existingMetrics.length) {
      await db.insert(systemMetrics).values({
        systemLoad: 0,
        storageUsage: 0,
        lastBackup: new Date(),
      });
      console.log("✅ System metrics initialized");
    } else {
      console.log("ℹ️ System metrics already exist");
    }

    // Create default admin user if not exists
    console.log("⏳ Setting up admin user...");
    const adminExists = await db.select().from(users).where(sql`role = 'admin'`);
    
    if (!adminExists.length) {
      await db.insert(users).values({
        email: process.env.ADMIN_EMAIL ?? 'admin@example.com',
        role: 'admin',
        clerkId: 'default_admin',
      });
      console.log("✅ Default admin user created");
    } else {
      console.log("ℹ️ Admin user already exists");
    }

    // Initialize activity log
    console.log("⏳ Setting up activity log...");
    await db.insert(activities).values({
      type: 'system',
      action: 'Database initialized',
    });
    console.log("✅ Activity log initialized");

    console.log("\n🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("\n❌ Error during database setup:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if ('code' in error) {
        console.error(`   Error code: ${(error as any).code}`);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

setup().catch((error) => {
  console.error("\n❌ Fatal error during setup:", error);
  process.exit(1);
});

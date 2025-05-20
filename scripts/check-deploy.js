#!/usr/bin/env node

console.log('🚀 Checking deployment requirements...\n');

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET'
];

// Check if all required variables are set
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Please set these variables in your deployment environment.');
  console.error('   For Vercel deployment:');
  console.error('   1. Go to your project settings');
  console.error('   2. Navigate to "Environment Variables"');
  console.error('   3. Add each missing variable\n');
  process.exit(1);
}

console.log('✅ All required environment variables are set!\n');

// Database URL format check
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    new URL(dbUrl);
    console.log('✅ Database URL format is valid');
  } catch (e) {
    console.error('❌ Invalid DATABASE_URL format');
    console.error('   Expected format: postgresql://user:password@host:port/database\n');
    process.exit(1);
  }
} else {
  console.error('❌ DATABASE_URL is undefined');
  process.exit(1);
}

// Clerk keys format check
const clerkKeys = {
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': /^pk_/,
  'CLERK_SECRET_KEY': /^sk_/,
  'CLERK_WEBHOOK_SECRET': /^whsec_/
};

Object.entries(clerkKeys).forEach(([key, pattern]) => {
  const value = process.env[key];
  if (value && !pattern.test(value)) {
    console.error(`❌ Invalid ${key} format`);
    console.error(`   Expected format: Should start with "${pattern.toString().slice(2, -1)}"\n`);
    process.exit(1);
  }
});

console.log('✅ All Clerk keys have valid formats');
console.log('\n🎉 Deployment check passed! Ready to deploy.\n');

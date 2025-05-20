#!/usr/bin/env tsx

console.log('🚀 Running pre-deployment checks...\n');

import { execSync } from 'child_process';

// Required environment variables for deployment
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET'
] as const;

// Check environment variables
console.log('⏳ Checking environment variables...');
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Add these variables in your deployment environment.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are present\n');
}

function runCommand(command: string, message: string) {
    console.log(`⏳ ${message}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${message} completed successfully!\n`);
        return true;
    } catch (error: any) {
        console.error(`❌ ${message} failed!`);
        console.error(error.message);
        return false;
    }
}

// Check TypeScript compilation
if (!runCommand('tsc --noEmit', 'Checking TypeScript compilation')) {
    process.exit(1);
}

// Run environment variable checks
if (!runCommand('node scripts/check-deploy.js', 'Checking environment variables')) {
    process.exit(1);
}

// Run linting
if (!runCommand('next lint', 'Running linter checks')) {
    process.exit(1);
}

// Generate database migrations if needed
if (!runCommand('npm run db:generate', 'Generating database migrations')) {
    process.exit(1);
}

// Push database schema
if (!runCommand('npm run db:push', 'Pushing database schema')) {
    process.exit(1);
}

// Run database migrations
if (!runCommand('npm run db:migrate', 'Running database migrations')) {
    process.exit(1);
}

// Run database setup
if (!runCommand('npm run db:setup', 'Setting up database')) {
    process.exit(1);
}

console.log('🎉 All pre-deployment checks passed! Ready to deploy.\n');

# Setup Guide for OJT Classroom

This guide will help you set up your development environment with Neon PostgreSQL and Clerk Authentication.

## Neon Database Setup

1. Go to [Neon](https://neon.tech) and create an account
2. Create a new project
3. Once created, go to the project dashboard
4. Click on "Connection Details"
5. Copy the connection string
6. In your project, create a `.env` file and add:
   ```
   DATABASE_URL=your_neon_connection_string
   ```

## Clerk Authentication Setup

1. Go to [Clerk](https://clerk.dev) and create an account
2. Create a new application
3. Select Next.js as your framework
4. Go to API Keys in your Clerk Dashboard
5. Copy these values to your `.env` file:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   ```

6. Set up Clerk Webhook:
   - Go to the Webhooks section in Clerk Dashboard
   - Create a new webhook endpoint
   - URL: `https://your-domain/api/clerk-webhook`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the signing secret and add to `.env`:
   ```
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   ```

## Complete Environment Setup

Your final `.env` file should look like this:
```
# Database (Neon)
DATABASE_URL=your_neon_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Environment
NODE_ENV=development
```

## Database Setup

Run these commands to set up your database:

```bash
# Generate database migrations
npm run db:generate

# Push schema to database
npm run db:push

# Set up initial data
npm run db:setup
```

## Starting the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Verifying Setup

1. Open http://localhost:3000
2. Try to sign up - this will test Clerk authentication
3. After signing up, check your database - a new user should be created
4. Try accessing the role selection page - this will test the database connection

## Troubleshooting

### Database Connection Issues
- Make sure your DATABASE_URL is correct
- Check if your IP is allowed in Neon dashboard
- Verify SSL is enabled in the connection

### Clerk Authentication Issues
- Verify all Clerk environment variables are set
- Check if the webhook endpoint is properly configured
- Look for errors in the webhook logs in Clerk dashboard

### Development Issues
- Clear browser cache and local storage
- Restart the development server
- Check the console for error messages

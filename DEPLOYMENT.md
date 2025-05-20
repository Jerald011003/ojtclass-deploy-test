# Deployment Guide

This guide will help you deploy the TrainTrackDesk application to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Neon](https://neon.tech) PostgreSQL database (or other PostgreSQL provider)
- A [Clerk](https://clerk.dev) account for authentication
- An [UploadThing](https://uploadthing.com) account for file uploads

## Step 1: Prepare Your Database

1. Create a new PostgreSQL database on Neon or your preferred provider
2. Get the connection string for your database
3. Ensure the database is accessible from the internet

## Step 2: Configure Clerk

1. Create a new application in Clerk
2. Go to API Keys in your Clerk Dashboard
3. Copy the Publishable Key and Secret Key
4. Configure your redirect URLs in Clerk to match your production domain
5. Set up a webhook endpoint on Clerk with the following settings:
   - URL: `https://your-production-domain.com/api/clerk-webhook`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook signing secret

## Step 3: Configure UploadThing

1. Create an account on UploadThing
2. Create a new application
3. Get your API keys (Secret and App ID)
4. Configure allowed domains to include your production domain

## Step 4: Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the following environment variables:

```
# Database
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# UploadThing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
NEXT_PUBLIC_UPLOADTHING_URL=your_uploadthing_url

# Environment
NODE_ENV=production
```

3. Deploy your application

## Step 5: Initialize the Database

After deploying, you need to initialize your database schema:

1. Use the Vercel CLI to trigger a database migration:
   ```bash
   vercel env pull .env.production
   npx drizzle-kit push
   ```

   Alternatively, you can run a one-time deployment script through Vercel.

2. Verify that your database tables have been created

## Step 6: Verify Your Deployment

1. Test user registration and login
2. Test classroom creation
3. Test file uploads
4. Ensure all features are working as expected

## Troubleshooting

### Database Connection Issues
- Ensure your database is accessible from Vercel's servers
- Check that your connection string is correctly formatted
- Verify that your database user has the correct permissions

### Authentication Issues
- Verify that your Clerk keys are correct
- Check that your redirect URLs are configured properly
- Ensure the webhook endpoint is accessible

### File Upload Issues
- Confirm that your UploadThing configuration is correct
- Check that your domain is whitelisted in UploadThing
- Verify that your environment variables are correctly set

## Need Help?

If you encounter any issues during deployment, please submit a support ticket with detailed information about the problem.

import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { users, activities } from '~/server/db/schema';

export async function POST(req: Request) {
  // Get the headers
  const svix_id = req.headers.get("svix-id") ?? '';
  const svix_timestamp = req.headers.get("svix-timestamp") ?? '';
  const svix_signature = req.headers.get("svix-signature") ?? '';

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const eventType = evt.type;

  // Handle the webhook
  if (eventType === 'user.created') {
    const { id, email_addresses, created_at } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error('[Clerk Webhook] No email address found for new user:', id);
      return new Response('Invalid user data', {
        status: 400
      });
    }

    try {
      // Start a transaction for user registration
      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          clerkId: id,
          email: email,
          role: 'student', // Default role
        });
        
        await tx.insert(activities).values({
          type: 'system',
          action: `New user registered: ${email}`,
        });
      });

      console.log('[Clerk Webhook] Successfully registered new user:', email);
    } catch (dbError) {
      console.error('[Clerk Webhook] Database error while registering user:', dbError);
      return new Response('Database error', {
        status: 500
      });
    }
  }

  return NextResponse.json({ 
    message: 'Webhook processed successfully',
    eventType
  });
}
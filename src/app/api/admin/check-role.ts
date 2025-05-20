import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    console.log('Checking role for userId:', userId);
    
    if (!userId) {
      console.log('No userId found');
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user with detailed logging
    console.log('Querying database for user with clerkId:', userId);
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    console.log('Database query result:', {
      found: !!user,
      userId: user?.id,
      clerkId: user?.clerkId,
      role: user?.role,
      email: user?.email
    });

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== 'professor') {
      console.log('User found but not a professor:', user.role);
      return NextResponse.json(
        { message: "Access denied", role: user.role },
        { status: 403 }
      );
    }

    console.log('Confirmed professor role, sending response');
    // Return role with cache prevention headers
    const response = NextResponse.json({
      role: user.role
    });

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error("Error checking role:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
} 
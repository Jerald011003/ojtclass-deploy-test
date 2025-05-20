import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const url = new URL(req.url);
    const clerkId = url.searchParams.get("clerkId") || userId;
    
    console.log('Checking role for userId:', clerkId);
    
    if (!clerkId) {
      console.log('No userId found');
      return NextResponse.json(
        { exists: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('Querying database for user with clerkId:', clerkId);
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    console.log('User check result:', {
      found: !!user,
      userId: user?.id,
      clerkId: user?.clerkId,
      role: user?.role,
      email: user?.email
    });

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json(
        { exists: false, message: "User not found" },
        { status: 200 } 
      );
    }

    const response = NextResponse.json({
      exists: true,
      role: user.role,
      userId: user.id
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error("Error checking role:", error);
    return NextResponse.json(
      { exists: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
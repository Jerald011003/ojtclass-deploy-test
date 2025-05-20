import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized", isAdmin: false },
        { status: 401 }
      );
    }

    // Get user from database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { message: "User not found", isAdmin: false },
        { status: 404 }
      );
    }

    // Check if user is professor in database
    const isAdmin = dbUser.role === "professor";

    if (!isAdmin) {
      console.log(`User ${userId} is not a professor. Role: ${dbUser.role}`);
    }

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Error checking user role:", error);
    return NextResponse.json(
      { message: "Internal Server Error", isAdmin: false },
      { status: 500 }
    );
  }
} 
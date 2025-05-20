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
        { message: "Unauthorized", isProfessor: false },
        { status: 401 }
      );
    }

    // Get user from database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { message: "User not found", isProfessor: false },
        { status: 404 }
      );
    }

    // Check if user is professor in database
    const isProfessor = dbUser.role === "professor";

    if (!isProfessor) {
      console.log(`User ${userId} is not a professor. Role: ${dbUser.role}`);
    }

    return NextResponse.json({ isProfessor });
  } catch (error) {
    console.error("Error checking user role:", error);
    return NextResponse.json(
      { message: "Internal Server Error", isProfessor: false },
      { status: 500 }
    );
  }
} 
// This file is no longer needed as we've removed role management
// You can safely delete this file

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users, activities } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role } = await req.json();
    if (!role || !["student", "professor"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // Check if user exists first
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    });

    if (existingUser) {
      // Update existing user
      await db
        .update(users)
        .set({ 
          role,
          updatedAt: new Date()
        })
        .where(eq(users.clerkId, clerkUserId));
    } else {
      // Create new user
      await db.insert(users).values({
        clerkId: clerkUserId,
        email: "",
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Log the activity
    await db.insert(activities).values({
      type: "system",
      action: `User role ${existingUser ? 'updated to' : 'set as'} ${role}`,
      userId: existingUser?.id,
      createdAt: new Date(),
    });

    // Return success with redirect path
const redirectPath = "/";
    return NextResponse.json({ 
      success: true,
      redirectPath,
      role 
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { message: "Failed to update role", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

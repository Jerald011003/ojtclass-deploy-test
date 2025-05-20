import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { activities } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const clerkId = formData.get("clerkId") as string;
    const role = formData.get("role") as "student" | "professor" | "admin";

    // Get email directly from Clerk instead of form data
    let email = formData.get("email") as string;

    // If email is missing, fetch it from Clerk
    if (!email || email.trim() === '') {
      const user = await clerkClient.users.getUser(clerkId);
      email = user.emailAddresses[0]?.emailAddress || '';
    }

    // Validate the data
    if (!clerkId || !email || !role) {
      return NextResponse.json(
        {
          message: "Missing required fields: " +
            (!clerkId ? "clerkId " : "") +
            (!email ? "email " : "") +
            (!role ? "role" : "")
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (existingUser) {
      // Update the user if they already exist
      await db
        .update(users)
        .set({
          role,
          email, // Make sure email is updated
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, clerkId));
    } else {
      // Create new user
      await db.insert(users).values({
        clerkId,
        email,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await clerkClient.users.updateUser(clerkId, {
      unsafeMetadata: {
        role
      },
    });

    console.log(`User ${existingUser ? 'updated' : 'created'} successfully with role ${role} in both DB and Clerk:`, {
      clerkId,
      email,
      role
    });

    await db.insert(activities).values({
      type: role === "admin" ? "system" : role,
      action: `User signed up as ${role}`,
      createdAt: new Date(),
    });

    let redirectUrl = "/";
    if (role === "student") {
      redirectUrl = "/";
    } else if (role === "professor") {
      redirectUrl = "/";
    } else if (role === "admin") {
      redirectUrl = "/";
    }

    return NextResponse.json(
      { message: "Account setup successful", redirectUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting up account:", error);
    return NextResponse.json(
      { message: "Failed to set up account" },
      { status: 500 }
    );
  }
}
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq, like, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the admin user
    const adminUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!adminUser || adminUser.role !== "professor") {
      return new NextResponse("Only professors can search students", { status: 403 });
    }

    // Get the search term from query params
    const url = new URL(req.url);
    const term = url.searchParams.get("term");

    if (!term) {
      return new NextResponse("Search term is required", { status: 400 });
    }

    // Search for students by name or email
    const students = await db.query.users.findMany({
      where: (users, { and, or }) => and(
        eq(users.role, "student"),
        or(
          like(users.email, `%${term}%`),
          like(users.email, `%${term}%`)
        )
      ),
      columns: {
        id: true,
        email: true,
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error searching students:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
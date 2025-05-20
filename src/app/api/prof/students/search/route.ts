import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq, like } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the professor user
    const profUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!profUser || profUser.role !== "professor") {
      return NextResponse.json(
        { message: "Forbidden: Professor access required" },
        { status: 403 }
      );
    }

    // Search students by email
    const students = await db.query.users.findMany({
      where: (users) => eq(users.role, "student"),
      columns: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const filteredStudents = students.filter((student) =>
      student.email.toLowerCase().includes(query?.toLowerCase() ?? "")
    );

    return NextResponse.json({ students: filteredStudents });
  } catch (error) {
    console.error("Error in GET /api/prof/students/search:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
} 
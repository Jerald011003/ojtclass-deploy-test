import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { timeEntries, users, studentClassrooms, activities } from "~/server/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// POST - Create a new time entry
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { date, hours, description, classroomId } = await req.json();

    // Validate required fields
    if (!date || !hours || !classroomId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the current user's database ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify user is a student
    if (user.role !== "student") {
      return NextResponse.json(
        { message: "Only students can log hours" },
        { status: 403 }
      );
    }

    // Verify student is assigned to the specified classroom
    const assignment = await db.query.studentClassrooms.findFirst({
      where: and(
        eq(studentClassrooms.studentId, user.id),
        eq(studentClassrooms.classroomId, classroomId)
      ),
    });

    if (!assignment) {
      return NextResponse.json(
        { message: "Student not assigned to this classroom" },
        { status: 403 }
      );
    }

    // Create the time entry
    const [newTimeEntry] = await db.insert(timeEntries).values({
      studentId: user.id,
      classroomId,
      date: date, // Use the string date directly
      hours,
      description: description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Log the activity
    await db.insert(activities).values({
      type: "student",
      action: `Logged ${hours} hours for ${new Date(date).toLocaleDateString()}`,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Time entry created successfully", timeEntry: newTimeEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating time entry:", error);
    return NextResponse.json(
      { message: "Failed to create time entry" },
      { status: 500 }
    );
  }
}

// GET - Get time entries for the current student
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get query parameters
    const url = new URL(req.url);
    const classroomId = url.searchParams.get("classroomId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Get the current user's database ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Build the query conditions
    const conditions = [eq(timeEntries.studentId, user.id)];
    
    // Add optional filters
    if (classroomId) {
      conditions.push(eq(timeEntries.classroomId, parseInt(classroomId)));
    }
    
    if (startDate) {
      conditions.push(sql`${timeEntries.date} >= ${startDate}`);
    }
    
    if (endDate) {
      conditions.push(sql`${timeEntries.date} <= ${endDate}`);
    }
    
    // Execute the query
    const entries = await db.select().from(timeEntries)
      .where(and(...conditions))
      .orderBy(desc(timeEntries.date));

    return NextResponse.json(
      { timeEntries: entries },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json(
      { message: "Failed to fetch time entries" },
      { status: 500 }
    );
  }
} 
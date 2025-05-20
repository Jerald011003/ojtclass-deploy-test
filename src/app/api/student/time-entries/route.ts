import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { timeEntries, users, classrooms, studentClassrooms } from "~/server/db/schema";
import { eq, and, sum } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const student = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!student || student.role !== "student") {
      return NextResponse.json(
        { message: "Only students can submit time entries" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { classroomId, date, timeIn, timeOut, breakMinutes, hours, description } = body;

    if (!classroomId || !date || !timeIn || !timeOut) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate the student is enrolled in this classroom
    const enrollment = await db.query.studentClassrooms.findFirst({
      where: and(
        eq(studentClassrooms.studentId, student.id),
        eq(studentClassrooms.classroomId, classroomId)
      ),
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this classroom" },
        { status: 403 }
      );
    }

    // Create the time entry
    const [entry] = await db.insert(timeEntries).values({
      studentId: student.id,
      classroomId,
      date: new Date(date).toISOString(),
      hours,
      timeIn,
      timeOut,
      breakMinutes: breakMinutes || 0,
      description: description || "",
      isApproved: false,
    }).returning();

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating time entry:", error);
    return NextResponse.json(
      { message: "Failed to create time entry" },
      { status: 500 }
    );
  }
}

// Get all time entries for a student in a classroom
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const url = new URL(req.url);
    const classroomId = url.searchParams.get("classroomId");

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!classroomId) {
      return NextResponse.json(
        { message: "Classroom ID is required" },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Different behavior based on role
    let entries;
    if (user.role === "student") {
      // Students can only see their own entries
      entries = await db.query.timeEntries.findMany({
        where: and(
          eq(timeEntries.classroomId, parseInt(classroomId)),
          eq(timeEntries.studentId, user.id)
        ),
        orderBy: (timeEntries, { desc }) => [desc(timeEntries.date)],
      });
    } else if (user.role === "professor" || user.role === "admin") {
      // Professors can see all entries for their classroom
      const classroom = await db.query.classrooms.findFirst({
        where: and(
          eq(classrooms.id, parseInt(classroomId)),
          eq(classrooms.professorId, user.id)
        ),
      });

      if (!classroom) {
        return NextResponse.json(
          { message: "Classroom not found or you don't have permission" },
          { status: 404 }
        );
      }

      entries = await db.query.timeEntries.findMany({
        where: eq(timeEntries.classroomId, parseInt(classroomId)),
        orderBy: (timeEntries, { desc }) => [desc(timeEntries.date)],
        with: {
          student: true,
        },
      });
    } else {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 403 }
      );
    }

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json(
      { message: "Failed to fetch time entries" },
      { status: 500 }
    );
  }
}
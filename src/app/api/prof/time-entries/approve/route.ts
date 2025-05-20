import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { timeEntries, users, classrooms } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const professor = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!professor || (professor.role !== "professor" && professor.role !== "admin")) {
      return NextResponse.json(
        { message: "Only professors can approve time entries" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { timeEntryId, approved } = body;

    if (!timeEntryId) {
      return NextResponse.json(
        { message: "Time entry ID is required" },
        { status: 400 }
      );
    }

    // Get the time entry
    const entry = await db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, timeEntryId),
    });

    if (!entry) {
      return NextResponse.json(
        { message: "Time entry not found" },
        { status: 404 }
      );
    }

    // Verify professor owns the classroom
    // Important: Use entry.classroomId, not classroomId directly
    const classroom = await db.query.classrooms.findFirst({
      where: and(
        eq(classrooms.id, entry.classroomId),
        eq(classrooms.professorId, professor.id)
      ),
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "You don't have permission to approve this time entry" },
        { status: 403 }
      );
    }

    if (approved) {
      // Approve the time entry
      await db.update(timeEntries)
        .set({ isApproved: true })
        .where(eq(timeEntries.id, timeEntryId));
    } else {
      // Reject by deleting the time entry
      await db.delete(timeEntries)
        .where(eq(timeEntries.id, timeEntryId));
    }

    return NextResponse.json({ 
      message: approved ? "Time entry approved" : "Time entry rejected" 
    });
  } catch (error) {
    console.error("Error approving time entry:", error);
    return NextResponse.json(
      { message: "Failed to process time entry" },
      { status: 500 }
    );
  }
}
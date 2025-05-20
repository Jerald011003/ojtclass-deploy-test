import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { classrooms, users, studentClassrooms } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from 'crypto';

// Helper function to generate a random code
function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// POST - Generate a new invite code for a classroom
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { classroomId } = body;

    if (!classroomId) {
      return NextResponse.json(
        { message: "Classroom ID is required" },
        { status: 400 }
      );
    }

    // Get the professor
    const professor = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!professor || professor.role !== "professor") {
      return NextResponse.json(
        { message: "Only professors can generate invite codes" },
        { status: 403 }
      );
    }

    // Verify classroom ownership
    const classroom = await db.query.classrooms.findFirst({
      where: and(
        eq(classrooms.id, classroomId),
        eq(classrooms.professorId, professor.id)
      ),
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Generate a new invite code
    const inviteCode = generateInviteCode();

    // Update the classroom with the new code
    await db.update(classrooms)
      .set({ inviteCode })
      .where(eq(classrooms.id, classroomId));

    return NextResponse.json({ inviteCode });
  } catch (error) {
    console.error("Error generating invite code:", error);
    return NextResponse.json(
      { message: "Failed to generate invite code" },
      { status: 500 }
    );
  }
}

// PUT - Join a classroom using an invite code
export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json(
        { message: "Invite code is required" },
        { status: 400 }
      );
    }

    // Get the student
    const student = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!student || student.role !== "student") {
      return NextResponse.json(
        { message: "Only students can join classrooms" },
        { status: 403 }
      );
    }

    // Find the classroom with this invite code
    const classroom = await db.query.classrooms.findFirst({
      where: eq(classrooms.inviteCode, inviteCode),
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if student is already enrolled
    const existingEnrollment = await db.query.studentClassrooms.findFirst({
      where: and(
        eq(studentClassrooms.studentId, student.id),
        eq(studentClassrooms.classroomId, classroom.id)
      ),
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { message: "You are already enrolled in this classroom" },
        { status: 400 }
      );
    }

    // Enroll the student
    await db.insert(studentClassrooms).values({
      studentId: student.id,
      classroomId: classroom.id,
      status: 0,
    });

    return NextResponse.json({ message: "Successfully joined classroom" });
  } catch (error) {
    console.error("Error joining classroom:", error);
    return NextResponse.json(
      { message: "Failed to join classroom" },
      { status: 500 }
    );
  }
} 
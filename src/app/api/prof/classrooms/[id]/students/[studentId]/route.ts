import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, studentClassrooms, classrooms } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  id: string;
  studentId: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { userId } = await auth();
    const { id: classroomId, studentId } = params;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the professor user
    const professor = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!professor || professor.role !== "professor") {
      return NextResponse.json(
        { message: "Forbidden: Professor access required" },
        { status: 403 }
      );
    }

    // Verify the classroom exists and belongs to this professor
    const classroom = await db.query.classrooms.findFirst({
      where: and(
        eq(classrooms.id, parseInt(classroomId)),
        eq(classrooms.professorId, professor.id)
      ),
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found or not authorized" },
        { status: 404 }
      );
    }

    // Delete the student enrollment
    await db.delete(studentClassrooms)
      .where(
        and(
          eq(studentClassrooms.studentId, parseInt(studentId)),
          eq(studentClassrooms.classroomId, parseInt(classroomId))
        )
      );

    return NextResponse.json({ 
      message: "Student removed from classroom successfully" 
    });
  } catch (error) {
    console.error("Error in DELETE /api/prof/classrooms/[id]/students/[studentId]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
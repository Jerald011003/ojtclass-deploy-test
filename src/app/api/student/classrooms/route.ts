import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users, studentClassrooms, classrooms } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the student user
    const student = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!student || student.role !== "student") {
      return NextResponse.json(
        { message: "Only students can access this endpoint" },
        { status: 403 }
      );
    }

    // Get all classrooms the student is enrolled in
    const enrollments = await db
      .select({
        classroomId: studentClassrooms.classroomId,
        status: studentClassrooms.status,
      })
      .from(studentClassrooms)
      .where(eq(studentClassrooms.studentId, student.id));

    const classroomIds = enrollments.map(e => e.classroomId);

    if (classroomIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get classroom details
    const studentClassroomDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const classroom = await db.query.classrooms.findFirst({
          where: eq(classrooms.id, enrollment.classroomId),
        });

        if (!classroom) return null;

        return {
          id: classroom.id,
          name: classroom.name,
          description: classroom.description || "",
          progress: enrollment.status || 0,
        };
      })
    );

    // Filter out any null values and return the results
    return NextResponse.json(
      studentClassroomDetails.filter((classroom): classroom is NonNullable<typeof classroom> => classroom !== null)
    );
  } catch (error) {
    console.error("Error fetching student classrooms:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
} 
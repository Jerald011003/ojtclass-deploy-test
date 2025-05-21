import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, reports, classrooms, studentClassrooms } from "~/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const url = new URL(request.url);
    const classroomId = url.searchParams.get("classroomId");

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

    // If classroom ID is provided, verify it belongs to this professor
    let classroomIds: number[] = [];
    
    if (classroomId) {
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
      
      classroomIds = [parseInt(classroomId)];
    } else {
      // Otherwise get all classrooms for this professor
      const professorClassrooms = await db.query.classrooms.findMany({
        where: eq(classrooms.professorId, professor.id),
        columns: {
          id: true
        }
      });
      
      classroomIds = professorClassrooms.map(c => c.id);
    }

    // If professor has no classrooms, return empty array
    if (classroomIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch reports for the classroom(s)
    const allReports = await db.query.reports.findMany({
      where: inArray(reports.classroomId, classroomIds),
      orderBy: (reports, { desc }) => [desc(reports.createdAt)],
    });

    // Return the reports
    return NextResponse.json(allReports);
  } catch (error) {
    console.error("Error in GET /api/prof/reports:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
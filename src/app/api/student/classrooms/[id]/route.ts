import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, classrooms, studentClassrooms } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!student) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (student.role !== "student") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const enrollment = await db.query.studentClassrooms.findFirst({
      where: and(
        eq(studentClassrooms.studentId, student.id),
        eq(studentClassrooms.classroomId, parseInt(params.id))
      ),
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this classroom" },
        { status: 403 }
      );
    }

    const classroom = await db.query.classrooms.findFirst({
      where: eq(classrooms.id, parseInt(params.id)),
      with: {
        professor: true,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }

    const mockReports = [
      { id: 1, title: 'Weekly Summary Report', type: 'Weekly', date: 'May 10, 2025', status: 'approved' },
      { id: 2, title: 'Daily Activity Log', type: 'Daily', date: 'May 9, 2025', status: 'pending' },
      { id: 3, title: 'Project Milestone Report', type: 'Monthly', date: 'April 30, 2025', status: 'rejected' }
    ];

    function formatDateSafely(dateValue: any): string | null {
  if (!dateValue) return null;
  
  try {

    return new Date(dateValue).toISOString();
  } catch (error) {
    console.error("Error formatting date:", error, dateValue);
    return String(dateValue) || null;
  }
}

    return NextResponse.json({
      id: classroom.id,
      name: classroom.name,
      description: classroom.description || '',
      professor: {
        name: 'Professor', // Using default since name property doesn't exist
        email: classroom.professor.email
      },
      progress: 0, // Default value since enrollment doesn't track progress
  completedHours: 0,  // Change from hoursCompleted to completedHours
  requiredHours: classroom.ojtHours || 500,  // Use classroom.ojtHours if available
      startDate: formatDateSafely(classroom.startDate),
      endDate: formatDateSafely(classroom.endDate),
      reports: mockReports
    });
  } catch (error) {
    console.error("Error fetching classroom details:", error);
    return NextResponse.json(
      { message: "Failed to fetch classroom details" },
      { status: 500 }
    );
  }
}
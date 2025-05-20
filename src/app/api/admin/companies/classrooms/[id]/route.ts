import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { 
  users, 
  classrooms, 
  studentClassrooms, 
  timeEntries, 
  reports, 
  tasks, 
  meetings 
} from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

interface StudentEnrollment {
  student: {
    id: number;
    email: string;
  };
  progress: number;
}

type RouteParams = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<void | NextResponse> {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the admin user
    const adminUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!adminUser || adminUser.role !== "professor") {
      return NextResponse.json(
        { message: "Only professors can view classroom details" },
        { status: 403 }
      );    }

    const classroomId = parseInt(id);

    // Get classroom details
    const classroom = await db.query.classrooms.findFirst({
      where: and(
        eq(classrooms.id, classroomId),
        eq(classrooms.professorId, adminUser.id)
      ),
      with: {
        professor: true,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found or you don't have permission to view it" },
        { status: 404 }
      );
    }

    // Get student enrollments
    const enrollments = await db
      .select({
        student: {
          id: users.id,
          email: users.email,
        },
        progress: studentClassrooms.status,
      })
      .from(studentClassrooms)
      .where(eq(studentClassrooms.classroomId, classroomId))
      .innerJoin(users, eq(users.id, studentClassrooms.studentId));

    // Transform the data to include student progress
    const transformedClassroom = {
      ...classroom,
      students: enrollments.map((enrollment) => ({
        id: enrollment.student.id,
        name: enrollment.student.email,
        email: enrollment.student.email,
        progress: enrollment.progress || 0,
      })),
    };

    return NextResponse.json(transformedClassroom);
  } catch (error) {
    console.error("Error fetching classroom details:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { userId } = await auth();
    const { id: paramId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid classroom ID" },
        { status: 400 }
      );
    }

    const profUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!profUser || profUser.role !== "professor") {
      return NextResponse.json(
        { message: "Forbidden: Professor access required" },
        { status: 403 }
      );
    }

    const { name, description, startDate, endDate, ojtHours, isActive } = await request.json();

    const result = await db
      .update(classrooms)
      .set({
        name, 
        description,
        startDate: startDate || null,
        endDate: endDate || null,
        ojtHours: ojtHours || 600,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      })
      .where(eq(classrooms.id, id));

    return NextResponse.json({ message: "Classroom updated successfully" });
  } catch (error) {
    console.error("Error in PUT /api/admin/companies/classrooms/[id]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { userId } = await auth();
    const { id: paramId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid classroom ID" },
        { status: 400 }
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

    console.log(`Attempting to delete classroom ${id} and all related records`);

    // 1. Delete student enrollments
    await db.delete(studentClassrooms)
      .where(eq(studentClassrooms.classroomId, id));
    console.log(`Deleted student enrollments for classroom ${id}`);
      
    // 2. Delete time entries
    await db.delete(timeEntries)
      .where(eq(timeEntries.classroomId, id));
    console.log(`Deleted time entries for classroom ${id}`);
      
    // 3. Delete reports
    await db.delete(reports)
      .where(eq(reports.classroomId, id));
    console.log(`Deleted reports for classroom ${id}`);
      
    // 4. Delete tasks
    await db.delete(tasks)
      .where(eq(tasks.classroomId, id));
    console.log(`Deleted tasks for classroom ${id}`);
      
    // 5. Delete meetings
    await db.delete(meetings)
      .where(eq(meetings.classroomId, id));
    console.log(`Deleted meetings for classroom ${id}`);

    // Only AFTER deleting related records, delete the classroom
    await db.delete(classrooms)
      .where(eq(classrooms.id, id));
    console.log(`Successfully deleted classroom ${id}`);

    return NextResponse.json({ message: "Classroom deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/prof/companies/classrooms/[id]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
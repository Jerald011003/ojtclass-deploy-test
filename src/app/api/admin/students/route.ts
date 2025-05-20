import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { users, studentClassrooms, classrooms } from '~/server/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the professor user
    const professor = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!professor || professor.role !== "professor") {
      return NextResponse.json(
        { message: 'Forbidden: Professor access required' },
        { status: 403 }
      );
    }

    // First, get all classrooms owned by this professor
    const professorClassrooms = await db.query.classrooms.findMany({
      where: eq(classrooms.professorId, professor.id),
      columns: {
        id: true
      }
    });

    const classroomIds = professorClassrooms.map(c => c.id);

    if (classroomIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get all student IDs enrolled in professor's classrooms
    const enrollments = await db
      .select({
        studentId: studentClassrooms.studentId
      })
      .from(studentClassrooms)
      .where(inArray(studentClassrooms.classroomId, classroomIds));

    const studentIds = [...new Set(enrollments.map(e => e.studentId))];

    if (studentIds.length === 0) {
      return NextResponse.json([]);
    }

    // Query only the enrolled students
    const studentUsers = await db
      .select({
        id: users.id,
        email: users.email,
        clerkId: users.clerkId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(
        eq(users.role, "student"),
        inArray(users.id, studentIds)
      ))
      .orderBy(desc(users.createdAt));

    // Get company assignments and progress for each student
    const enhancedStudents = await Promise.all(
      studentUsers.map(async (student) => {
        try {
          // Get the student's classrooms (only for this professor)
          const studentClassroomRecords = await db
            .select({
              classroomId: studentClassrooms.classroomId,
              status: studentClassrooms.status,
            })
            .from(studentClassrooms)
            .where(and(
              eq(studentClassrooms.studentId, student.id),
              inArray(studentClassrooms.classroomId, classroomIds)
            ));

          // Get the first classroom for company info
          let companyName = "Not Assigned";
          let progress = 0;

          if (studentClassroomRecords.length > 0) {
            const firstRecord = studentClassroomRecords[0];
            if (firstRecord && typeof firstRecord.classroomId === 'number') {
              const classroomRecord = await db.query.classrooms.findFirst({
                where: eq(classrooms.id, firstRecord.classroomId),
              });
              
              if (classroomRecord) {
                companyName = classroomRecord.name;
                progress = typeof firstRecord.status === 'string' ? parseInt(firstRecord.status) || 0 : firstRecord.status || 0;
              }
            }
          }

          // Get student name from email
          const emailName = student.email?.split('@')[0] || '';
          const capitalizedName = emailName
            .split(/[._-]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');

          return {
            id: student.id,
            email: student.email,
            clerkId: student.clerkId,
            createdAt: student.createdAt,
            name: capitalizedName || 'Unknown Student',
            company: companyName,
            progress,
          };
        } catch (error) {
          console.error(`Error processing student ${student.id}:`, error);
          return {
            id: student.id,
            email: student.email,
            clerkId: student.clerkId,
            createdAt: student.createdAt,
            name: 'Error loading student data',
            company: 'Error',
            progress: 0,
          };
        }
      })
    );

    return NextResponse.json(enhancedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 
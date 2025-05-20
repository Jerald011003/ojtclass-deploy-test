// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { db } from "~/server/db";
// import { users, studentClassrooms, timeEntries, reports } from "~/server/db/schema";
// import { eq, and, sum } from "drizzle-orm";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { userId } = await auth();
//     const studentId = params.id;

//     if (!userId) {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Get the professor
//     const professor = await db.query.users.findFirst({
//       where: eq(users.clerkId, userId),
//     });

//     if (!professor || professor.role !== "professor") {
//       return NextResponse.json(
//         { message: "Forbidden: Professor access required" },
//         { status: 403 }
//       );
//     }

//     // Get the student with classroom enrollments
//     const student = await db.query.users.findFirst({
//       where: eq(users.id, parseInt(studentId)),
//       with: {
//         studentClassrooms: {
//           with: {
//             classroom: {
//               columns: {
//                 id: true,
//                 name: true,
//                 professorId: true,
//                 ojtHours: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!student) {
//       return NextResponse.json(
//         { message: "Student not found" },
//         { status: 404 }
//       );
//     }

//     // Verify this student is in one of the professor's classrooms
//     const professorClassrooms = student.studentClassrooms.filter(
//       enrollment => enrollment.classroom.professorId === professor.id
//     );

//     if (professorClassrooms.length === 0) {
//       return NextResponse.json(
//         { message: "Student not found in your classrooms" },
//         { status: 403 }
//       );
//     }

//     // Calculate progress for the student
//     let totalHoursCompleted = 0;
//     let totalRequiredHours = 0;

//     // Get approved time entries for this student
//     const timeEntriesResult = await db
//       .select({ sum: sum(timeEntries.hours) })
//       .from(timeEntries)
//       .where(
//         and(
//           eq(timeEntries.studentId, student.id),
//           eq(timeEntries.approved, true)
//         )
//       );

//     totalHoursCompleted = timeEntriesResult[0]?.sum || 0;
    
//     // Get required hours from the first classroom (normally should sum if multiple, but using first for simplicity)
//     totalRequiredHours = professorClassrooms[0]?.classroom.ojtHours || 600;

//     // Calculate progress percentage
//     const progressPercentage = Math.min(
//       Math.round((totalHoursCompleted / totalRequiredHours) * 100),
//       100
//     );

//     // Get student reports
//     const studentReports = await db.query.reports.findMany({
//       where: eq(reports.studentId, student.id),
//       orderBy: (reports, { desc }) => [desc(reports.createdAt)],
//     });

//     // Format response data
//     const formattedStudent = {
//       id: student.id,
//       name: student.firstName && student.lastName 
//         ? `${student.firstName} ${student.lastName}`
//         : student.email?.split('@')[0] || 'Unknown',
//       email: student.email,
//       clerkId: student.clerkId,
//       createdAt: student.createdAt,
//       updatedAt: student.updatedAt,
//       company: professorClassrooms[0]?.classroom.name || 'Not Assigned',
//       classroomId: professorClassrooms[0]?.classroom.id,
//       progress: progressPercentage,
//       totalHoursCompleted,
//       totalRequiredHours,
//       firstName: student.firstName || '',
//       lastName: student.lastName || '',
//       startDate: student.startDate || null,
//       endDate: student.endDate || null,
//       reports: studentReports.map(report => ({
//         id: report.id,
//         title: report.title,
//         status: report.status,
//         date: report.createdAt,
//         feedback: report.feedback
//       }))
//     };

//     return NextResponse.json(formattedStudent);
//   } catch (error) {
//     console.error("Error fetching student details:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { userId } = await auth();
//     const studentId = params.id;
    
//     if (!userId) {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Get the professor
//     const professor = await db.query.users.findFirst({
//       where: eq(users.clerkId, userId),
//     });

//     if (!professor || professor.role !== "professor") {
//       return NextResponse.json(
//         { message: "Forbidden: Professor access required" },
//         { status: 403 }
//       );
//     }

//     // Get the data from the request
//     const { firstName, lastName, email, classroomId, startDate, endDate } = await request.json();

//     // Update the student
//     await db.update(users)
//       .set({
//         firstName, 
//         lastName, 
//         email,
//         startDate: startDate ? new Date(startDate) : undefined,
//         endDate: endDate ? new Date(endDate) : undefined,
//         updatedAt: new Date()
//       })
//       .where(eq(users.id, parseInt(studentId)));
    
//     // If classroom ID is provided, update student's classroom enrollment
//     if (classroomId) {
//       // First check if student is already enrolled
//       const existingEnrollment = await db.query.studentClassrooms.findFirst({
//         where: and(
//           eq(studentClassrooms.studentId, parseInt(studentId)),
//           eq(studentClassrooms.classroomId, parseInt(classroomId))
//         )
//       });

//       // If not enrolled, create new enrollment
//       if (!existingEnrollment) {
//         // Get all current enrollments to handle transfer
//         const currentEnrollments = await db.query.studentClassrooms.findMany({
//           where: eq(studentClassrooms.studentId, parseInt(studentId))
//         });
        
//         // If transferring to new classroom, delete old enrollments
//         if (currentEnrollments.length > 0) {
//           await db.delete(studentClassrooms)
//             .where(eq(studentClassrooms.studentId, parseInt(studentId)));
//         }
        
//         // Create new enrollment
//         await db.insert(studentClassrooms)
//           .values({
//             studentId: parseInt(studentId),
//             classroomId: parseInt(classroomId),
//             createdAt: new Date()
//           });
//       }
//     }

//     return NextResponse.json({ message: "Student updated successfully" });
//   } catch (error) {
//     console.error("Error updating student:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
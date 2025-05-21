import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, reports, classrooms } from "~/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    console.log("Reports API called");
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

    console.log("Professor ID:", professor?.id);

    if (!professor || professor.role !== "professor") {
      return NextResponse.json(
        { message: "Forbidden: Professor access required" },
        { status: 403 }
      );
    }

    // Get classrooms for this professor
    let allReports = [];
    
    if (classroomId) {
      // Single classroom reports
      const singleClassroomReports = await db.query.reports.findMany({
        where: eq(reports.classroomId, parseInt(classroomId)),
        with: {
          student: true
        }
      });
      
      console.log(`Found ${singleClassroomReports.length} reports for classroom ${classroomId}`);
      allReports = singleClassroomReports;
    } else {
      // Get all professor's classrooms
      const professorClassrooms = await db.query.classrooms.findMany({
        where: eq(classrooms.professorId, professor.id),
      });
      
      console.log(`Professor has ${professorClassrooms.length} classrooms`);
      
      if (professorClassrooms.length === 0) {
        return NextResponse.json([]);
      }
      
      const classroomIds = professorClassrooms.map(c => c.id);
      
      // Get all reports from these classrooms
      allReports = await db.query.reports.findMany({
        where: inArray(reports.classroomId, classroomIds),
        with: {
          student: true
        }
      });
      
      console.log(`Found ${allReports.length} total reports for professor`);
    }

    // Format the reports for the client
    const formattedReports = allReports.map(report => ({
      id: report.id,
      title: report.title || "Untitled Report",
      description: report.description,
      type: report.type || "daily",
      studentId: report.studentId,
      classroomId: report.classroomId,
      status: report.status || "pending",
      submissionUrl: report.submissionUrl,
      feedback: report.feedback,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      dueDate: report.dueDate,
      student: report.student ? {
        id: report.student.id,
        name: report.student.firstName && report.student.lastName 
          ? `${report.student.firstName} ${report.student.lastName}`
          : report.student.email?.split('@')[0] || `Student ${report.student.id}`,
        email: report.student.email
      } : undefined,
      submittedBy: report.student?.firstName && report.student?.lastName
        ? `${report.student.firstName} ${report.student.lastName}`
        : report.student?.email?.split('@')[0] || `Student ${report.studentId}`
    }));

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error("Error in GET /api/prof/reports:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}
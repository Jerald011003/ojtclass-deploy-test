import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { reports, users, studentClassrooms, activities } from "~/server/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { reportStatusEnum } from "~/server/db/schema";

// GET - Get reports for the current student
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get query parameters
    const url = new URL(req.url);
    const classroomId = url.searchParams.get("classroomId");
    const status = url.searchParams.get("status") as typeof reportStatusEnum.enumValues[number] | null;

    // Get the current user's database ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Build the query conditions
    const conditions = [eq(reports.studentId, user.id)];
    
    // Add optional filters
    if (classroomId) {
      conditions.push(eq(reports.classroomId, parseInt(classroomId)));
    }
    
    if (status && reportStatusEnum.enumValues.includes(status)) {
      conditions.push(eq(reports.status, status));
    }
    
    // Execute the query
    const studentReports = await db.select().from(reports)
      .where(and(...conditions))
      .orderBy(desc(reports.dueDate));

    return NextResponse.json(
      { reports: studentReports },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST - Submit a report or update submission
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { reportId, submissionUrl } = await req.json();

    // Validate required fields
    if (!reportId || !submissionUrl) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the current user's database ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify user is a student
    if (user.role !== "student") {
      return NextResponse.json(
        { message: "Only students can submit reports" },
        { status: 403 }
      );
    }

    // Find the report
    const report = await db.query.reports.findFirst({
      where: and(
        eq(reports.id, reportId),
        eq(reports.studentId, user.id)
      ),
    });

    if (!report) {
      return NextResponse.json(
        { message: "Report not found or not assigned to this student" },
        { status: 404 }
      );
    }

    // Update the report submission
    const [updatedReport] = await db
      .update(reports)
      .set({
        submissionUrl,
        status: "submitted",
        updatedAt: new Date(),
      })
      .where(eq(reports.id, reportId))
      .returning();

    // Log the activity
    await db.insert(activities).values({
      type: "student",
      action: `Submitted report: ${report.title}`,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Report submitted successfully", report: updatedReport },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      { message: "Failed to submit report" },
      { status: 500 }
    );
  }
} 
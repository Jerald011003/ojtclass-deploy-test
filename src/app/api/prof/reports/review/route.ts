import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, reports, classrooms } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

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

    // Get the data from the request
    const { reportId, status, feedback } = await request.json();

    if (!reportId || !status || (status !== "approved" && status !== "rejected")) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    // Get the report to verify it belongs to a classroom this professor owns
    const report = await db.query.reports.findFirst({
      where: eq(reports.id, reportId),
      with: {
        classroom: true
      }
    });

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    if (report.classroom.professorId !== professor.id) {
      return NextResponse.json(
        { message: "Forbidden: You cannot review reports for classrooms you don't own" },
        { status: 403 }
      );
    }

    // Update the report
    await db.update(reports)
      .set({
        status,
        feedback,
        updatedAt: new Date()
      })
      .where(eq(reports.id, reportId));

    return NextResponse.json({ 
      message: `Report ${status === "approved" ? "approved" : "rejected"} successfully` 
    });
  } catch (error) {
    console.error("Error in POST /api/prof/reports/review:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
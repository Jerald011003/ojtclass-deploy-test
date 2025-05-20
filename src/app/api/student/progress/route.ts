import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { timeEntries, users, classrooms } from "~/server/db/schema";
import { eq, and, sum } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const classroomId = url.searchParams.get("classroomId");
    
    if (!classroomId) {
      return NextResponse.json(
        { message: "Classroom ID is required" },
        { status: 400 }
      );
    }
    
    // Get the classroom to determine required OJT hours
    const classroom = await db.query.classrooms.findFirst({
      where: eq(classrooms.id, parseInt(classroomId)),
    });
    
    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }
    
    const requiredHours = classroom.ojtHours || 600;
    
    // If studentId is not provided, get the current user's ID
    let studentIdToUse = studentId;
    if (!studentIdToUse) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }
      
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });
      
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
      
      studentIdToUse = user.id.toString();
    }
    
    // Query the time entries
    const hoursResult = await db.select({
      total: sum(timeEntries.hours)
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.studentId, parseInt(studentIdToUse)),
        eq(timeEntries.classroomId, parseInt(classroomId)),
        eq(timeEntries.isApproved, true)
      )
    );
    
    const completedHours = Number(hoursResult[0]?.total) || 0;
    
    const progressPercentage = Math.min(100, Math.round((completedHours / requiredHours) * 100));
    
    return NextResponse.json({
      studentId: parseInt(studentIdToUse),
      classroomId: parseInt(classroomId),
      completedHours, 
      requiredHours,   
      progressPercentage
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    return NextResponse.json(
      { message: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
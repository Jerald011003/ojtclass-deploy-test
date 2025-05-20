import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users, classrooms, meetings } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const professor = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    
    if (!professor || professor.role !== "professor") {
      return NextResponse.json(
        { message: "Only professors can schedule meetings" },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { classroomId, title, date, time, meetingUrl } = body;
    
    if (!classroomId || !title || !date || !time || !meetingUrl) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const classroom = await db.query.classrooms.findFirst({
      where: and(
        eq(classrooms.id, classroomId),
        eq(classrooms.professorId, professor.id)
      ),
    });
    
    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found or you don't have permission" },
        { status: 404 }
      );
    }
    
    const [meeting] = await db.insert(meetings).values({
      classroomId,
      title,
      date,
      time,
      meetingUrl,
    }).returning();
    
    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    return NextResponse.json(
      { message: "Failed to schedule meeting" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const url = new URL(req.url);
    const classroomId = url.searchParams.get("classroomId");
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    if (!classroomId) {
      return NextResponse.json(
        { message: "Classroom ID is required" },
        { status: 400 }
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
    
    const classroomMeetings = await db.query.meetings.findMany({
      where: eq(meetings.classroomId, parseInt(classroomId)),
      orderBy: (meetings, { desc }) => [desc(meetings.date)],
    });
    
    return NextResponse.json(classroomMeetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { message: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}
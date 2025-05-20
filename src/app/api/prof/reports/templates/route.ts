import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reports, users, classrooms } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const professor = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!professor) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (professor.role !== "professor" && professor.role !== "admin") {
      return NextResponse.json(
        { message: "Only professors can create report templates" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { title, description, type, dueDate, classroomId } = body;

    if (!title || !type || !classroomId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const classroom = await db.query.classrooms.findFirst({
      where: and(
        eq(classrooms.id, classroomId),
        eq(classrooms.professorId, professor.id),
      ),
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found or you don't have permission" },
        { status: 404 },
      );
    }
    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const validDueDate =
      parsedDueDate && !isNaN(parsedDueDate.getTime()) ? parsedDueDate : null;

    const [template] = await db
      .insert(reports)
      .values({
        title,
        description: description || null,
        type: type as any,
        dueDate: new Date(dueDate).toISOString(),
        classroomId,
        isTemplate: true,
        status: "pending",
        // createdAt: new Date(),
        // updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating report template:", error);
    return NextResponse.json(
      { message: "Failed to create report template" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const url = new URL(req.url);
    const classroomId = url.searchParams.get("classroomId");

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!classroomId) {
      return NextResponse.json(
        { message: "Classroom ID is required" },
        { status: 400 },
      );
    }

    let templates;

    if (user.role === "professor" || user.role === "admin") {
      templates = await db.query.reports.findMany({
        where: and(
          eq(reports.classroomId, parseInt(classroomId)),
          eq(reports.isTemplate, true),
        ),
        orderBy: (reports, { desc }) => [desc(reports.createdAt)],
      });
    } else {
      templates = await db.query.reports.findMany({
        where: and(
          eq(reports.classroomId, parseInt(classroomId)),
          eq(reports.isTemplate, true),
        ),
        orderBy: (reports, { desc }) => [desc(reports.createdAt)],
      });
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching report templates:", error);
    return NextResponse.json(
      { message: "Failed to fetch report templates" },
      { status: 500 },
    );
  }
}

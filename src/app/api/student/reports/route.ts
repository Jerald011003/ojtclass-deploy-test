import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reports, users, classrooms, studentClassrooms, tasks } from "~/server/db/schema";
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
        { message: "Only students can submit reports" },
        { status: 403 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let taskId, classroomId, content, submissionUrl;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      taskId = body.taskId;
      classroomId = body.classroomId;
      content = body.content;
      submissionUrl = body.submissionUrl;
      console.log("JSON submission data:", { taskId, classroomId, content, submissionUrl });
    } else {
      const formData = await req.formData();
      taskId = formData.get('taskId') as string;
      classroomId = formData.get('classroomId') as string;
      content = formData.get('content') as string;
      submissionUrl = formData.get('submissionUrl') as string | null;
      console.log("FormData submission data:", { taskId, classroomId, content, submissionUrl });
    }

    if (!classroomId || !taskId || !content) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const enrollment = await db.query.studentClassrooms.findFirst({
      where: and(
        eq(studentClassrooms.studentId, student.id),
        eq(studentClassrooms.classroomId, parseInt(classroomId))
      ),
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this classroom" },
        { status: 403 }
      );
    }

    const task = await db.query.tasks.findFirst({
      where: and(
        eq(tasks.id, parseInt(taskId)),
        eq(tasks.classroomId, parseInt(classroomId))
      ),
    });

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    const [submission] = await db.insert(reports).values({
      title: task.title,
      description: content,
      type: 'daily',
      classroomId: parseInt(classroomId),
      studentId: student.id,
      status: "submitted",
      dueDate: task.dueDate,
      submissionUrl,
      taskId: parseInt(taskId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      { message: "Failed to submit report" },
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

    let submissions;

    if (user.role === "student") {
      submissions = await db.query.reports.findMany({
        where: and(
          eq(reports.classroomId, parseInt(classroomId)),
          eq(reports.studentId, user.id),
          eq(reports.isTemplate, false)
        ),
        orderBy: (reports, { desc }) => [desc(reports.createdAt)],
      });
    } else if (user.role === "professor" || user.role === "admin") {
      const classroom = await db.query.classrooms.findFirst({
        where: and(
          eq(classrooms.id, parseInt(classroomId)),
          eq(classrooms.professorId, user.id)
        ),
      });

      if (!classroom) {
        return NextResponse.json(
          { message: "Classroom not found or you don't have permission" },
          { status: 404 }
        );
      }

      submissions = await db.query.reports.findMany({
        where: and(
          eq(reports.classroomId, parseInt(classroomId)),
          eq(reports.isTemplate, false)
        ),
        orderBy: (reports, { desc }) => [desc(reports.createdAt)],
        with: {
          student: true,
        },
      });
    } else {
      return NextResponse.json(
        { message: "Unauthorized role" },
        { status: 403 }
      );
    }

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
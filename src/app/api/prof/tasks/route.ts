import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { tasks, users, classrooms, studentClassrooms } from "~/server/db/schema";
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

    // Get the professor
    const professor = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!professor) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (professor.role !== "professor" && professor.role !== "admin") {
      return NextResponse.json(
        { message: "Only professors can create tasks" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await req.json();
    const { 
      title, 
      description, 
      dueDate, 
      classroomId,
      studentId,
      assignToAll = true,
      priority = "medium" 
    } = body;

    // Validate required fields
    if (!title || !classroomId) {
      return NextResponse.json(
        { message: "Title and classroom ID are required" },
        { status: 400 }
      );
    }

    // Check if the classroom exists and belongs to this professor
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

    // Get enrolled students
    const enrollments = await db.query.studentClassrooms.findMany({
      where: eq(studentClassrooms.classroomId, classroomId),
    });

    if (enrollments.length === 0) {
      return NextResponse.json(
        { message: "No students enrolled in this classroom" },
        { status: 400 }
      );
    }

    // const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const createdTasks = [];

    if (assignToAll) {
      for (const enrollment of enrollments) {
        const [task] = await db
          .insert(tasks)
          .values({
            title,
            description: description || null,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null, 
            classroomId,
            studentId: enrollment.studentId, 
            // status: "pending",
            priority,
          })
          .returning();
        
        createdTasks.push(task);
      }
      
      return NextResponse.json(createdTasks, { status: 201 });
    } else if (studentId) {
      const [task] = await db
        .insert(tasks)
        .values({
          title,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null, 
          classroomId,
          studentId: parseInt(studentId), 
        //   status: "pending",
          priority,
        })
        .returning();
      
      return NextResponse.json(task, { status: 201 });
    } else {
      return NextResponse.json(
        { message: "You must either assign to all students or specify a student ID" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const url = new URL(req.url);
    const classroomId = url.searchParams.get("classroomId");
    const studentId = url.searchParams.get("studentId");
    
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

    let tasksList;

    if (user.role === "professor" || user.role === "admin") {
      // Professors can see all tasks for their classrooms
      if (!classroomId) {
        return NextResponse.json(
          { message: "Classroom ID is required" },
          { status: 400 }
        );
      }

      // Check if the classroom belongs to this professor
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

      // Get tasks for this classroom
      tasksList = await db.query.tasks.findMany({
        where: eq(tasks.classroomId, parseInt(classroomId)),
        orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
      });
    } else if (user.role === "student") {
      // Students can only see tasks assigned to them
      if (classroomId) {
        // Get tasks for this student in a specific classroom
        tasksList = await db.query.tasks.findMany({
          where: and(
            eq(tasks.classroomId, parseInt(classroomId)),
            eq(tasks.studentId, user.id)
          ),
          orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
        });
      } else {
        // Get all tasks for this student across all classrooms
        tasksList = await db.query.tasks.findMany({
          where: eq(tasks.studentId, user.id),
          orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
        });
      }
    } else {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 403 }
      );
    }

    return NextResponse.json(tasksList);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
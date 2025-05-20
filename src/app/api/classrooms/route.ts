import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { classrooms, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import type { Classroom } from "~/types";

export async function POST(req: NextRequest) {
  const authResult = await auth();
  const { userId } = authResult;
  
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { name, description, coverImage } = body;

    // Validate input
    if (!name) {
      return NextResponse.json(
        { message: "Classroom name is required" },
        { status: 400 }
      );
    }

    // Check if user is a professor
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "professor") {
      return NextResponse.json(
        { message: "Only professors can create classrooms" },
        { status: 403 }
      );
    }

    // Create classroom
    const [newClassroom] = await db.insert(classrooms).values({
      name,
      description: description || null,
      coverImage: coverImage || null,
      professorId: user.id,
      isActive: true,
    }).returning();

    return NextResponse.json(newClassroom, { status: 201 });
  } catch (error) {
    console.error("Error creating classroom:", error);
    return NextResponse.json(
      { message: "Failed to create classroom" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const authResult = await auth();
  const { userId } = authResult;
  
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Query classrooms based on user role
    let classroomsList: Classroom[] = [];

    if (user.role === "professor") {
      // Professors see only their own classrooms
      classroomsList = await db.query.classrooms.findMany({
        where: eq(classrooms.professorId, user.id),
        orderBy: (classrooms, { desc }) => [desc(classrooms.createdAt)],
      });
    } else if (user.role === "student") {
      // Students see classrooms they're enrolled in
      // This requires a join with the studentClassrooms table
      // For simplicity, we're just showing all classrooms for now
      classroomsList = await db.query.classrooms.findMany({
        orderBy: (classrooms, { desc }) => [desc(classrooms.createdAt)],
      });
    } else if (user.role === "admin") {
      // Admins see all classrooms
      classroomsList = await db.query.classrooms.findMany({
        orderBy: (classrooms, { desc }) => [desc(classrooms.createdAt)],
      });
    }

    return NextResponse.json(classroomsList);
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return NextResponse.json(
      { message: "Failed to fetch classrooms" },
      { status: 500 }
    );
  }
} 
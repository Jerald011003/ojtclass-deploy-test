import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, classrooms } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the professor user
    const profUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!profUser || profUser.role !== "professor") {
      return NextResponse.json(
        { message: "Forbidden: Professor access required" },
        { status: 403 }
      );
    }

    // Get all classrooms for this professor
    const professorClassrooms = await db.query.classrooms.findMany({
      where: eq(classrooms.professorId, profUser.id),
      with: {
        professor: {
          columns: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ classrooms: professorClassrooms });
  } catch (error) {
    console.error("Error in GET /api/prof/companies/classrooms:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the professor user
    const profUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!profUser || profUser.role !== "professor") {
      return NextResponse.json(
        { message: "Forbidden: Professor access required" },
        { status: 403 }
      );
    }

    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { message: "Name and description are required" },
        { status: 400 }
      );
    }

    // Create new classroom
    const newClassroom = await db.insert(classrooms).values({
      name,
      description,
      professorId: profUser.id,
      isActive: true,
    });

    return NextResponse.json({ message: "Classroom created successfully" });
  } catch (error) {
    console.error("Error in POST /api/prof/companies/classrooms:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, classrooms } from "~/server/db/schema";
import { eq } from "drizzle-orm";

type RouteParams = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { userId } = await auth();
    const { id: paramId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid classroom ID" },
        { status: 400 }
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

    // Get the classroom
    const classroom = await db.query.classrooms.findFirst({
      where: eq(classrooms.id, id),
      with: {
        professor: {
          columns: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { message: "Classroom not found" },
        { status: 404 }
      );
    }

    // Check if the classroom belongs to this professor
    if (classroom.professorId !== profUser.id) {
      return NextResponse.json(
        { message: "Forbidden: You don't have access to this classroom" },
        { status: 403 }
      );
    }

    return NextResponse.json({ classroom });
  } catch (error) {
    console.error("Error in GET /api/prof/companies/classrooms/[id]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { userId } = await auth();
    const { id: paramId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid classroom ID" },
        { status: 400 }
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

    const { name, description } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { message: "Name and description are required" },
        { status: 400 }
      );
    }

    // Update the classroom
    const result = await db
      .update(classrooms)
      .set({
        name,
        description,
      })
      .where(eq(classrooms.id, id));

    return NextResponse.json({ message: "Classroom updated successfully" });
  } catch (error) {
    console.error("Error in PUT /api/prof/companies/classrooms/[id]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { userId } = await auth();
    const { id: paramId } = await params;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid classroom ID" },
        { status: 400 }
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

    // Delete the classroom
    await db.delete(classrooms).where(eq(classrooms.id, id));

    return NextResponse.json({ message: "Classroom deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/prof/companies/classrooms/[id]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
} 
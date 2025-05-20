import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { classrooms, companies, users } from "~/server/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const adminUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!adminUser || adminUser.role !== "professor") {
      return NextResponse.json(
        { message: "Only professors can view company classrooms" },
        { status: 403 }
      );
    }

    const companyClassrooms = await db.query.classrooms.findMany({
      where: and(
        eq(classrooms.isActive, true),
        eq(classrooms.professorId, adminUser.id)
      ),
      with: {
        professor: true,
      },
      orderBy: (classrooms, { desc }) => [desc(classrooms.createdAt)],
    });

    return NextResponse.json({ classrooms: companyClassrooms });
  } catch (error) {
    console.error("Error fetching company classrooms:", error);
    return NextResponse.json(
      { message: "Failed to fetch classrooms" },
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

    const body = await req.json();
    const { name, description, startDate, endDate, ojtHours } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const adminUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!adminUser || adminUser.role !== "professor") {
      return NextResponse.json(
        { message: "Only professors can create classrooms" },
        { status: 403 }
      );
    }

    const [classroom] = await db.insert(classrooms).values({
      name,
      description,
      professorId: adminUser.id,
      startDate: startDate || null,  
      endDate: endDate || null,
      ojtHours: ojtHours || 600, 
      isActive: true,
    }).returning();

    return NextResponse.json(
      { classroom },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating classroom:", error);
    return NextResponse.json(
      { message: "Failed to create classroom" },
      { status: 500 }
    );
  }
}
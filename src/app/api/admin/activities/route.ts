import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { activities } from "~/server/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get recent activities
    const recentActivities = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(10);

    return NextResponse.json(recentActivities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
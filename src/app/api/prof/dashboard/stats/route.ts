import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, companies, activities } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
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

    // Get stats
    const [userStats, companyStats, activityStats] = await Promise.all([
      // Get user counts by role
      db
        .select({ role: users.role, count: sql`count(*)` })
        .from(users)
        .groupBy(users.role),
      // Get company count
      db
        .select({ count: sql`count(*)` })
        .from(companies)
        .where(eq(companies.isActive, true)),
      // Get recent activities
      db
        .select()
        .from(activities)
        .orderBy(sql`created_at desc`)
        .limit(5),
    ]);

    return NextResponse.json({
      totalStudents: userStats.find(s => s.role === 'student')?.count ?? 0,
      totalCompanies: companyStats[0]?.count ?? 0,
      totalProfessors: userStats.find(s => s.role === 'professor')?.count ?? 0,
      recentActivities: activityStats,
    });
  } catch (error) {
    console.error("Error in GET /api/prof/dashboard/stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
} 
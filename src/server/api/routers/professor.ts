import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { activities, companies, systemMetrics, users } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";

export const professorRouter = createTRPCRouter({
  getDashboardStats: publicProcedure
    .query(async () => {
      const [userStats, companyStats, activityStats, metrics] = await Promise.all([
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
        // Get latest system metrics
        db
          .select()
          .from(systemMetrics)
          .orderBy(sql`created_at desc`)
          .limit(1),
      ]);

      return {
        stats: {
          totalStudents: userStats.find(s => s.role === 'student')?.count ?? 0,
          totalProfessors: userStats.find(s => s.role === 'professor')?.count ?? 0,
          totalCompanies: companyStats[0]?.count ?? 0,
        },
        recentActivities: activityStats,
        systemMetrics: metrics[0] || null,
      };
    }),

  addUser: publicProcedure
    .input(z.object({
      email: z.string().email(),
      role: z.enum(['student', 'professor']),
      clerkId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const user = await db
        .insert(users)
        .values({
          email: input.email,
          role: input.role,
          clerkId: input.clerkId,
        })
        .returning();

      await db.insert(activities).values({
        type: 'system',
        action: `New ${input.role} added: ${input.email}`,
        userId: user[0]?.id,
      });

      return user[0];
    }),

  addCompany: publicProcedure
    .input(z.object({
      name: z.string(),
      address: z.string(),
    }))
    .mutation(async ({ input }) => {
      const company = await db
        .insert(companies)
        .values(input)
        .returning();

      await db.insert(activities).values({
        type: 'company',
        action: `New company registered: ${input.name}`,
      });

      return company[0];
    }),

  updateSystemMetrics: publicProcedure
    .input(z.object({
      systemLoad: z.number(),
      storageUsage: z.number(),
      lastBackup: z.date(),
    }))
    .mutation(async ({ input }) => {
      return db
        .insert(systemMetrics)
        .values(input)
        .returning();
    }),
}); 
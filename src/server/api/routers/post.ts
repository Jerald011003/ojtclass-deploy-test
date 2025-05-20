import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // For now, we'll just console.log the post that would be created
      console.log('Would create post:', input.name);
      return { success: true };
    }),

  getLatest: publicProcedure.query(async () => {
    // Return mock data instead of querying the database
    return {
      id: 1,
      name: "Welcome to OJT Classroom",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }),
});

import { type inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { classrooms, users } from "~/server/db/schema";

// Utility types
export type RouterOutput = inferRouterOutputs<AppRouter>;

// Database Types
export type User = typeof users.$inferSelect;
export type Classroom = typeof classrooms.$inferSelect;

// Application Types
export type ClassroomWithProfessor = Classroom & {
  professor: {
    id: number;
    name: string;
    email: string;
  };
  studentCount: number;
};

export interface FileUploadResult {
  fileUrl: string;
  uploadedBy: string;
} 
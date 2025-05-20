import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schema";
import Link from "next/link";

export default async function CreateClassroomPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "professor") {
    redirect("/classrooms");
  }

  // Redirect to the Admin/Professor view
  redirect("/classrooms/admin");
} 
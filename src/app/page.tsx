import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default async function RootPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return <div className="hidden">Auth slot will be shown</div>;
  }
  
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  
  if (!user || !user.role) {
    redirect("/role-selection");
  }
  
  if (user.role === "professor") {
    return <div className="hidden">Professor slot will be shown</div>;
  } else {
    return <div className="hidden">Student slot will be shown</div>;
  }
}
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ReportsClientPage from "./client";

export default async function AdminReportsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return <ReportsClientPage />;
} 
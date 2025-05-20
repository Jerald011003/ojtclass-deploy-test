'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation"; 
import { useEffect } from "react";
import ProfessorView from "./dashboard/page";

export default function ProfessorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]);
  
  if (!isLoaded || !user) {
    return null;
  }
  
  return <ProfessorView />;
}
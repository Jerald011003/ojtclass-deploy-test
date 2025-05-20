'use client';

import { useUser } from "@clerk/nextjs";
import ProfessorView from "./components/ProfessorView";

export default function ProfessorPage() {
  const { user } = useUser();
  
  if (!user) {
    return null;
  }
  
  return <ProfessorView />;
}
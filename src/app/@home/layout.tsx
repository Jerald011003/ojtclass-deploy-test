'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "~/components/Navbar";
import Loading from "~/components/Loading";

export default function HomeLayout({
  children,
  professor,
  student,
}: {
  children: React.ReactNode;
  professor: React.ReactNode;
  student: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const isRoleSelectionPage = pathname === "/role-selection";
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isLoaded && user && !user.unsafeMetadata.role && !isRoleSelectionPage) {
      router.push('/role-selection');
    }
  }, [isLoaded, user, router, isClient, isRoleSelectionPage]);
  
  if (isRoleSelectionPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
      </div>
    );
  }
  
  if (!isClient || !isLoaded) {
    return <Loading />;
  }
  
  if (!user) {
    return <div className="hidden">{children}</div>;
  }
  
  const userRole = user.unsafeMetadata.role as string | undefined;
  
  if (userRole === 'professor') {
    return <>{professor}</>; 
  } else if (userRole === 'student') {
    return <>{student}</>;   
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
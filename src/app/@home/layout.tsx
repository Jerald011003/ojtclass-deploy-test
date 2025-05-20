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
  
  // Skip authentication checks if we're on the role-selection page
  const isRoleSelectionPage = pathname === "/role-selection";
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Don't redirect if already on role-selection page
    if (isClient && isLoaded && user && !user.unsafeMetadata.role && !isRoleSelectionPage) {
      router.push('/role-selection');
    }
  }, [isLoaded, user, router, isClient, isRoleSelectionPage]);
  
  // Skip loading screen if on role-selection
  if (isRoleSelectionPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
      </div>
    );
  }
  
  // Regular authentication flow for non-role-selection pages
  if (!isClient || !isLoaded) {
    return <Loading />;
  }
  
  if (!user) {
    return <div className="hidden">{children}</div>;
  }
  
  const userRole = user.unsafeMetadata.role as string | undefined;
  
  if (userRole === 'professor') {
    return (
      <div className="min-h-screen">
        {professor}
      </div>
    );
  } else if (userRole === 'student') {
    return (
      <div className="min-h-screen">
        {student}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
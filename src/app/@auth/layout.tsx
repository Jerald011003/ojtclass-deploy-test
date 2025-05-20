'use client'
import Navbar from "~/components/Navbar";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRoleSelection = pathname === "/role-selection";
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isRoleSelection && <Navbar />}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
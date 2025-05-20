'use client'
import Navbar from "~/components/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar /> {/* Always show the navbar */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
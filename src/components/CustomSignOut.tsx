'use client';

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CustomSignOut() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Sign out of Clerk with a redirect callback
      await signOut(() => {
        // Use window.location.href for a full page refresh
        // This ensures the app state is completely reset
        window.location.href = '/?refresh=true';
      });
    } catch (error) {
      console.error("Error during sign out:", error);
      // Force a hard refresh to recover from error
      window.location.href = '/?error=signout';
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors disabled:opacity-75"
    >
      {isSigningOut ? "Signing out..." : "Sign Out"}
    </button>
  );
}
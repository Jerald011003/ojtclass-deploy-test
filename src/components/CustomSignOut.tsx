'use client';

import { useClerk } from "@clerk/nextjs";

export function CustomSignOut() {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      
      window.location.href = '/';
    } catch (error) {
      console.error("Error during sign out:", error);
      window.location.href = '/';
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
    >
      Sign Out
    </button>
  );
}
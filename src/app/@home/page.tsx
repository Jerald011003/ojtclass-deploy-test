'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function ClassroomsRouter() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    
    if (!userId) {
      router.push('/sign-in');
      return;
    }

    async function checkUserAndRedirect() {
      try {
        console.log("Checking user role for:", userId);
        const res = await fetch(`/api/users/check-role?clerkId=${userId}`);
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("User check response:", data);
        
        if (!data.exists) {
          console.log("User doesn't exist, redirecting to role selection");
          router.push('/role-selection');
          return;
        }
        
        if (data.role === 'student') {
          console.log("Redirecting to student dashboard");
          router.push(`/`);
        } else if (data.role === 'professor') {
          console.log("Redirecting to professor dashboard");
          router.push(`/`);
        } else if (data.role === 'admin') {
          console.log("Redirecting to admin dashboard");
          router.push(`/`);
        } else {
          console.log("Unknown role, redirecting to role selection");
          router.push('/role-selection');
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setError("Failed to load your dashboard. Please try again.");
      }
    }

    checkUserAndRedirect();
  }, [userId, isLoaded, router]);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="mt-4 text-gray-600">Checking authentication...</p>
    </div>
  );
}
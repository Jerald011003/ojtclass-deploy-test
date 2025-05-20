'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignUpButton, UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { userId } = useAuth();
  const router = useRouter();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedRole, setHasCheckedRole] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    async function checkUserRole() {
      if (!isLoaded || !userId || hasCheckedRole) return;

      try {
        const userMetadata = user?.unsafeMetadata?.role;
        if (userMetadata) {
          setHasCheckedRole(true);
          const currentPath = window.location.pathname;
          if (currentPath === "/" || currentPath === "/sign-up" || currentPath === "/sign-in") {
            return;
          }
          return;
        }

        const res = await fetch(`/api/users/check-role?clerkId=${userId}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        if (!data.exists || !data.role) {
          setShowRoleSelector(true);
        } else if (data.redirectPath) {
          const currentPath = window.location.pathname;
          if (currentPath === "/" || currentPath === "/sign-up" || currentPath === "/sign-in") {
            router.push(data.redirectPath);
          }
        }
        setHasCheckedRole(true);
      } catch (error) {
        console.error("Failed to check user role:", error);
      }
    }

    if (isLoaded) {
      checkUserRole();
    }

    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSignedIn, userId, isLoaded, router, hasCheckedRole, user]);

  useEffect(() => {
    if (!isSignedIn) {
      setHasCheckedRole(false);
      setShowRoleSelector(false);
    }
  }, [isSignedIn]);

  const handleRoleSubmit = async (role: 'student' | 'professor') => {
    if (!userId || !user?.emailAddresses[0]?.emailAddress) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role in database');
      }

      await user?.update({
        unsafeMetadata: { role },
      });

      setShowRoleSelector(false);
      setHasCheckedRole(true);

      router.push("/");
    } catch (err) {
      console.error("Error setting up account:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    window.location.href = '/';
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left - Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/UA-Logo.png"
                alt="UA Logo"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
              <span className="text-blue-600 font-bold text-3xl tracking-tight ml-2">TTD</span>
            </Link>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <span className="text-gray-600 text-sm font-medium hidden sm:block">Web-base tracker</span>
          </div>

          {/* Center - Title */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center">
              <h1 className="text-gray-800 font-semibold text-lg">Welcome TrainTrackDesk</h1>
              <p className="text-gray-500 text-sm mt-0.5">We Make your Progress Traceability</p>
            </div>
          </div>

          {/* Right - Navigation */}
          <div className="flex items-center space-x-6">
            {/* <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
              Home
            </Link> */}
            {isSignedIn && (
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
                Dashboard
              </Link>
            )}

            {isSignedIn ? (
              <>
              {/* @ts-ignore - The afterSignUpUrl works at runtime but TS doesn't recognize it */ }
              < UserButton afterSignOutUrl="/" signOutCallback={handleSignOut} />
              </>
            ) : (
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
                  Sign In
                </button>
              </SignInButton>

              {/* @ts-ignore - The afterSignUpUrl works at runtime but TS doesn't recognize it */}

              <SignUpButton mode="modal" afterSignUpUrl="/role-selection">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Role selector dialog */}
      {showRoleSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Select Your Role</h3>
            <p className="text-gray-600 mb-4">
              Please select your role to continue using TrainTrackDesk.
            </p>

            <div className="space-y-4 mb-6">
              <button
                onClick={() => handleRoleSubmit('student')}
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-md flex items-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <span>Student</span>
              </button>

              <button
                onClick={() => handleRoleSubmit('professor')}
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-md flex items-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <span>Professor/Supervisor</span>
              </button>
            </div>

            {isSubmitting && (
              <div className="text-center text-blue-600">
                Setting up your account...
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
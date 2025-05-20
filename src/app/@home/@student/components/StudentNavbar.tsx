'use client';

import { UserButton, useUser } from "@clerk/nextjs";
import { Bell, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function StudentNavbar() {
  const { user } = useUser();
  const role = (user?.unsafeMetadata?.role as string) || 'student';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/UA-Logo.png"
                alt="UA Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-blue-600 font-bold text-xl ml-2">TTD</span>
            </Link>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <span className="text-gray-600 text-sm font-medium hidden sm:block">Web-base tracker</span>
          </div>

          {/* Center - Title */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center">
              <h1 className="text-gray-800 font-semibold text-lg">Student Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5 capitalize">Student View</p>
            </div>
          </div>

          {/* Right - Navigation and Profile */}
          <div className="flex items-center space-x-6">
            {/* <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/classrooms" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Dashboard
            </Link> */}
            {/* <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button> */}
            <div className="flex items-center space-x-2 p-1 bg-gray-300/20 rounded-full">
              {/* <span className="text-sm text-gray-600 capitalize hidden sm:inline-block">student</span> */}
              <UserButton
                afterSignOutUrl="/"
                // signOutCallback={() => window.location.href = '/'}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 
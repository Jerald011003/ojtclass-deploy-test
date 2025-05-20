'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignUpButton } from "@clerk/nextjs";

const Navbar = () => {
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
          <div className="flex items-center space-x-4">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
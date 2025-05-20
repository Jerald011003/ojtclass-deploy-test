'use client';

import Image from 'next/image';
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import Link from 'next/link';
import { useEffect, useState } from "react";

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-center min-h-[calc(100vh-5rem)] py-8">
          <div className="w-full lg:w-1/2 text-white lg:pr-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Let&apos;s start Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                Journey Systemize!
              </span>
            </h1>
            <p className="text-lg sm:text-xl mb-10 text-blue-100/90 leading-relaxed max-w-xl">
              TrainTrackDesk is a web-based OJT tracker system developed by Computer Engineering students 
              of the University of the Assumption to streamline the internship monitoring process.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {isMounted && isLoaded && !isSignedIn && (
                <>
                  {/* @ts-ignore - The afterSignUpUrl works at runtime but TS doesn't recognize it */}
                  <SignUpButton mode="modal" afterSignUpUrl="/role-selection">
                    <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-xl 
                      shadow-lg hover:bg-blue-50 transform hover:-translate-y-1 hover:scale-105 
                      transition-all duration-300 active:scale-95">
                      SIGN UP
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button className="px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white 
                      font-semibold rounded-xl hover:bg-white/10 transform hover:-translate-y-1 
                      hover:scale-105 transition-all duration-300 active:scale-95">
                      SIGN IN
                    </button>
                  </SignInButton>
                </>
              )}
              {!isMounted && (
                <div className="h-[52px] w-[200px]"></div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mb-8 lg:mb-0">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 animate-float">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-300/30 
                to-white/40 backdrop-blur-sm shadow-2xl"></div>
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 
                to-blue-300/30 backdrop-blur-md flex items-center justify-center overflow-hidden">
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
                  <Image
                    src="/images/UA-Logo.png"
                    alt="UA Logo"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
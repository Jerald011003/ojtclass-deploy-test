'use client';

import { useUser } from "@clerk/nextjs";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ApprovalPendingPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Account Pending Approval</h2>
          <p className="mt-2 text-gray-600">
            Hello{user?.firstName ? ` ${user.firstName}` : ''}, your account is pending approval from an administrator.
          </p>
          <p className="mt-4 text-gray-500 text-sm">
            You'll gain access to the student dashboard once your account has been approved. 
            This typically takes 1-2 business days.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-700 text-sm">What happens next?</h3>
            <p className="mt-1 text-sm text-blue-600">
              An administrator will review your account information. You'll receive an email notification once your account is approved.
            </p>
          </div>
          
          <div className="text-center">
            <Link 
              href="/"
              className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
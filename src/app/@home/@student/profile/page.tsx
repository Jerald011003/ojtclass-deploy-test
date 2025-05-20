'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { Loader2, Building2 } from 'lucide-react';

interface Classroom {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
}

export default function StudentProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchClassrooms() {
      try {
        const response = await fetch('/api/student/classrooms');
        
        if (!response.ok) {
          throw new Error('Failed to fetch classrooms');
        }
        
        const data = await response.json();
        setClassrooms(data);
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClassrooms();
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Format date for display
const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'Not set';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Not set';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Not set';
  }
};

  // Get the first classroom (most students will be in one classroom)
  const primaryClassroom = classrooms && classrooms.length > 0 ? classrooms[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-gray-500">
          Manage your account and OJT information
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-500">{user?.emailAddresses[0]?.emailAddress}</p>
              <p className="text-sm text-blue-600 mt-2">Student</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium mb-4">OJT Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company/Classroom</label>
              {primaryClassroom ? (
                <p className="mt-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  {primaryClassroom.name}
                </p>
              ) : (
                <p className="mt-1 text-gray-500">Not assigned to any company yet</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${primaryClassroom 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'}`}>
                  {primaryClassroom ? 'Active' : 'Not Enrolled'}
                </span>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <p className="mt-1 text-gray-700">{formatDate(primaryClassroom?.startDate)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <p className="mt-1 text-gray-700">{formatDate(primaryClassroom?.endDate)}</p>
            </div>
          </div>
        </div>
        
        {classrooms.length > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium mb-4">All Enrollments</h3>
            <div className="space-y-3">
              {classrooms.map(classroom => (
                <div key={classroom.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{classroom.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-gray-600">Start:</span> {formatDate(classroom.startDate)}
                    </div>
                    <div>
                      <span className="text-gray-600">End:</span> {formatDate(classroom.endDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
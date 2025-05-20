'use client';

import { useState, useEffect } from 'react';
import { useAuth, useSession } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { PlusCircle, ArrowLeft, ArrowRight } from "lucide-react";
import StudentInviteCard from "../components/StudentInviteCard";

// Define interfaces for type safety
interface BasicStudent {
  id: number;
  email: string | null;
  clerkId: string;
  createdAt: Date;
}

interface EnhancedStudent extends BasicStudent {
  name: string;
  company: string;
  progress: number;
}

export default function ProfStudentsPage() {
  const { userId, isLoaded } = useAuth();
  const { session } = useSession();
  const router = useRouter();
  const [showInviteCard, setShowInviteCard] = useState(false);
  const [displayStudents, setDisplayStudents] = useState<EnhancedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  // Fetch students data
  useEffect(() => {
    async function fetchStudents() {
      if (!userId) return;

      try {
        const response = await fetch('/api/prof/students');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch students');
        }
        
        const data = await response.json();
        setDisplayStudents(data.students.map((student: BasicStudent) => ({
          ...student,
          name: student.email?.split('@')[0] || 'Unknown',  // Fallback name from email
          company: 'Not Assigned',  // Default company
          progress: 0  // Default progress
        })));
      } catch (error) {
        console.error('Error fetching students:', error);
        // Fallback to demo data if fetch fails
        setDisplayStudents([
          { id: 1, name: 'John Doe', email: 'john@example.com', company: 'ABC Corp', progress: 65, clerkId: '', createdAt: new Date() },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', company: 'XYZ Inc', progress: 42, clerkId: '', createdAt: new Date() },
          { id: 3, name: 'Robert Johnson', email: 'robert@example.com', company: 'Tech Solutions', progress: 78, clerkId: '', createdAt: new Date() },
          { id: 4, name: 'Emily Davis', email: 'emily@example.com', company: 'Digital Systems', progress: 23, clerkId: '', createdAt: new Date() },
          { id: 5, name: 'Michael Wilson', email: 'michael@example.com', company: 'Innovate Ltd', progress: 91, clerkId: '', createdAt: new Date() },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchStudents();
    }
  }, [userId]);

  if (!isLoaded || !userId) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
        <p className="text-gray-500">
          View and manage student OJT records
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium">Students</h2>
            <div className="mt-3 sm:mt-0">
              <button
                onClick={() => setShowInviteCard(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Invite Student</span>
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading students...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            student.progress >= 70 ? 'bg-green-600' : 
                            student.progress >= 40 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`} 
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{student.progress}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/students/${student.id}/view`} className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </Link>
                      <Link href={`/students/${student.id}/edit`} className="text-blue-600 hover:text-blue-900">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {displayStudents.length} of {displayStudents.length} students
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              disabled={true}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="sr-only">Previous</span>
            </button>
            <button
              className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              disabled={true}
            >
              <ArrowRight className="w-4 h-4" />
              <span className="sr-only">Next</span>
            </button>
          </div>
        </div>
      </div>

      {showInviteCard && (
        <StudentInviteCard onClose={() => setShowInviteCard(false)} />
      )}
    </div>
  );
} 
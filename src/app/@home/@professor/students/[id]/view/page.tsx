'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Clock, Calendar, Loader2 } from 'lucide-react';
import ProfNavbar from '../../../components/ProfNavbar';

// Types
interface Student {
  id: number;
  name: string;
  email: string | null;
  company: string;
  classroomId: number;
  progress: number;
  totalHoursCompleted: number;
  totalRequiredHours: number;
  startDate?: string | null;
  endDate?: string | null;
  reports: Report[];
}

interface Report {
  id: number;
  title: string;
  date: Date | string;
  status: string;
  feedback?: string | null;
}

export default function StudentViewPage() {
  const { id } = useParams();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/prof/students/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch student');
        }
        
        const data = await response.json();
        setStudent(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load student data');
        setIsLoading(false);
      }
    }
    
    if (id) {
      fetchStudentData();
    }
  }, [id]);

  const formatDate = (dateString: string | number | Date | null | undefined) => {
    if (!dateString) return 'Not set';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <ProfNavbar />
        <main className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[80vh]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-100">
        <ProfNavbar />
        <main className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error || 'Student not found'}
            </div>
            <div className="mt-4">
              <Link href="/students" className="text-blue-600 hover:text-blue-800">
                &larr; Back to Students
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ProfNavbar />
      <main className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/students" className="p-2 rounded-full hover:bg-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
              <p className="text-gray-500">
                View detailed OJT records for {student.name}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Student profile */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Profile Information</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1">{student.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1">{student.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Classroom</h3>
                    <p className="mt-1">{student.company}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                    <p className="mt-1">{formatDate(student.startDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Expected End Date</h3>
                    <p className="mt-1">{formatDate(student.endDate)}</p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <Link 
                    href={`/students/${id}/edit`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Right column - OJT progress and reports */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress card */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-medium">OJT Progress</h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Overall Completion</span>
                      <span className="text-sm font-medium text-gray-900">{student.progress}%</span>
                    </div>
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
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 text-blue-600 mr-2" />
                        <h3 className="text-sm font-medium">Hours Completed</h3>
                      </div>
                      <p className="text-2xl font-bold">{student.totalHoursCompleted || 0}</p>
                      <p className="text-sm text-gray-500">of {student.totalRequiredHours || 600} required hours</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileText className="w-4 h-4 text-blue-600 mr-2" />
                        <h3 className="text-sm font-medium">Reports Submitted</h3>
                      </div>
                      <p className="text-2xl font-bold">{student.reports?.length || 0}</p>
                      <p className="text-sm text-gray-500">reports for review</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reports card */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-medium">Reports & Documentation</h2>
                  </div>
                </div>
                <div className="p-6">
                  {student.reports && student.reports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {student.reports.map((report) => (
                            <tr key={report.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{report.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(report.date)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  report.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                  report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {report.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Link href={`/reports/${report.id}`} className="text-blue-600 hover:text-blue-800">View</Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p>No reports submitted yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
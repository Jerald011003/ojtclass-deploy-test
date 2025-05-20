'use client';

import { useState, useEffect } from 'react';
import { Users, Book, FileCheck, Video, Bell, UserPlus, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ProfNavbar from '../components/ProfNavbar';

interface Student {
  id: number;
  name: string;
  email: string;
  progress: number;
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  meetingUrl: string;
}

interface Report {
  id: number;
  title: string;
  status: string;
  studentName: string;
  createdAt?: string;
  feedback?: string; 
}

interface Classroom {
  id: number;
  name: string;
  description: string;
  ojtHours?: number; 
  professor: {
    id: number;
    email: string;
  };
  students?: Student[];
}

export default function ProfessorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [completedEvals, setCompletedEvals] = useState(0);

  const [studentProgress, setStudentProgress] = useState<Record<number, number>>({});

  // Keep all your existing fetchClassrooms logic
  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/api/prof/companies/classrooms', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch classrooms');
      }
      return data.classrooms || [];
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      throw error;
    }
  };

  // Keep all other fetch functions - fetchClassroomDetails, fetchReports, fetchMeetings, etc.
  const fetchClassroomDetails = async (classroomId: number) => {
    try {
      const response = await fetch(`/api/admin/companies/classrooms/${classroomId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch classroom details');
      }
      const data = await response.json();
      
      if (data && !data.ojtHours) {
        data.ojtHours = 600; 
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching classroom ${classroomId} details:`, error);
      throw error;
    }
  };

  const fetchReports = async (classroomId: number) => {
    try {
      const response = await fetch(`/api/student/reports?classroomId=${classroomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error(`Error fetching reports for classroom ${classroomId}:`, error);
      return [];
    }
  };

  const fetchMeetings = async (classroomId: number) => {
    try {
      const response = await fetch(`/api/prof/meetings?classroomId=${classroomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error(`Error fetching meetings for classroom ${classroomId}:`, error);
      return [];
    }
  };

  const fetchStudentProgress = async (studentsArray: Student[], classroomId: number) => {
    const progressData: Record<number, number> = {};

    for (const student of studentsArray) {
      try {
        const response = await fetch(`/api/student/progress?studentId=${student.id}&classroomId=${classroomId}`);
        if (response.ok) {
          const data = await response.json();
          progressData[student.id] = data.progressPercentage || 0;
        }
      } catch (error) {
        console.error(`Error fetching progress for student ${student.id}:`, error);
        progressData[student.id] = 0;
      }
    }

    return progressData;
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const classroomsData = await fetchClassrooms();
      setClassrooms(classroomsData);

      let allStudents: Student[] = [];
      let allReports: Report[] = [];
      let allMeetings: Meeting[] = [];
      let allProgressData: Record<number, number> = {};

      for (const classroom of classroomsData) {
        const classroomDetail = await fetchClassroomDetails(classroom.id);

        if (classroomDetail.students?.length > 0) {
        allStudents = [...allStudents, ...classroomDetail.students];

        const progressData = await fetchStudentProgress(classroomDetail.students, classroom.id);

        for (const studentId in progressData) {
          const newProgress = progressData[studentId] || 0;
          const existingProgress = allProgressData[studentId] || 0;

          allProgressData[studentId] = Math.max(existingProgress, newProgress);
        }
      }

        const classroomReports = await fetchReports(classroom.id);
        if (classroomReports.length > 0) {
          allReports = [...allReports, ...classroomReports];
        }

        const classroomMeetings = await fetchMeetings(classroom.id);
        if (classroomMeetings.length > 0) {
          allMeetings = [...allMeetings, ...classroomMeetings];
        }
      }

      const uniqueStudentIds = new Set<number>();
      const uniqueStudents = allStudents.filter(student => {
        if (!uniqueStudentIds.has(student.id)) {
          uniqueStudentIds.add(student.id);
          return true;
        }
        return false;
      });

      setStudents(uniqueStudents);
      setTotalStudents(uniqueStudents.length);

      setReports(allReports);
      setPendingReports(allReports.filter(report =>
        report.status === 'submitted' || report.status === 'pending'
      ).length);

      setCompletedEvals(allReports.filter(report =>
        report.status === 'approved' || report.status === 'rejected'
      ).length);

      setStudentProgress(allProgressData);

      setReports(allReports);
      setMeetings(allMeetings);
      setPendingReports(allReports.filter(report =>
        (report.status === 'submitted' || report.status === 'pending') && 
        (!report.feedback || report.feedback.trim() === '')
      ).length);
      setCompletedEvals(allReports.filter(report =>
        report.feedback && report.feedback.trim() !== ''
      ).length);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchAllData();
    }
  }, [isLoaded, user]);

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return 'No date';

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

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <ProfNavbar />
        <main className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4">
            Error: {error}
          </div>
        </main>
      </div>
    );
  }

  // Return just navbar and main content with proper margins
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navbar only */}
      <ProfNavbar />
      
      {/* Main content with proper top padding to avoid navbar overlap */}
      <main className="pt-1 px-2 sm:px-6 lg:px-1">
        {/* Title Section */}
        <div className="mb-8 mt-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your students and see all progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalStudents || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Active trainees</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Book className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{pendingReports || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Pending reviews</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <FileCheck className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Evaluations</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedEvals || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Completed this semester</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Students</h2>
                  <Link href="/students" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                    <UserPlus className="w-5 h-5" />
                    <span>Manage Students</span>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {students && students.length > 0 ? (
                    students.slice(0, 5).map(student => (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {student.name || student.email?.split('@')[0] || `Student ${student.id}`}
                          </h3>
                          <p className="text-sm text-gray-600">{student.email || 'No email'}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${studentProgress[student.id] || 0}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{studentProgress[student.id] || 0}%</span>
                          </div>
                          {classrooms.length > 0 && (
                            <Link
                              href={`/companies/${classrooms[0]?.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View Details
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No students found</p>
                  )}

                  {students.length > 5 && (
                    <div className="text-center mt-2">
                      <Link href="/companies" className="text-blue-600 hover:text-blue-700 text-sm">
                        View all students
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Schedule & Actions */}
          <div className="space-y-6">
            {/* Upcoming Meetings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Video className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
                </div>
              </div>
              <div className="p-6">
                {meetings && meetings.length > 0 ? (
                  meetings.slice(0, 3).map(meeting => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{meeting.title || 'Untitled Meeting'}</h3>
                        <p className="text-sm text-gray-600">{formatDate(meeting.date)} at {meeting.time || 'TBD'}</p>
                      </div>
                      {meeting.meetingUrl && (
                        <a
                          href={meeting.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Join
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No upcoming meetings</p>
                )}

                {meetings.length > 3 && (
                  <div className="text-center mt-2">
                    <Link href="/companies" className="text-blue-600 hover:text-blue-700 text-sm">
                      View all meetings
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <Link href="/companies" className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center">
                  Manage Classrooms
                </Link>
                <Link href="/reports" className="block w-full border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors text-center">
                  Review Reports
                </Link>
                <Link href="/students" className="block w-full border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors text-center">
                  View All Students
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
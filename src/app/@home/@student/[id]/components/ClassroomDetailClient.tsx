'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Building2, FileText, Clock, Calendar, ChevronLeft, Upload, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SubmitReportModal from './SubmitReportModal';
import TimeEntryForm from './TimeEntryForm';
import ProgressDashboard from './ProgressDashboard';

interface Report {
  createdAt: string | number | Date;
  id: number;
  title: string;
  type: 'Daily' | 'Weekly' | 'Monthly';
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'submitted';
}

interface ClassroomDetail {
  id: number;
  name: string;
  description: string;
  professor: {
    name: string;
    email: string;
  };
  progress: number;
  hoursCompleted: number;
  hoursRequired: number;
  reports: Report[];
  startDate: string;
  endDate: string;
}

interface ClassroomDetailClientProps {
  id: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export function ClassroomDetailClient({ id }: ClassroomDetailClientProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
const [refreshKey, setRefreshKey] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [progressData, setProgressData] = useState<{
    completedHours: number;
    requiredHours: number;
    progressPercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportsPage, setReportsPage] = useState(1);
  const [tasksPage, setTasksPage] = useState(1);
  const [itemsPerPage] = useState(3);

  const reportsStartIndex = (reportsPage - 1) * itemsPerPage;
  const reportsEndIndex = reportsPage * itemsPerPage;
  const tasksStartIndex = (tasksPage - 1) * itemsPerPage;
  const tasksEndIndex = tasksPage * itemsPerPage;

  const paginatedReports = myReports?.slice(reportsStartIndex, reportsEndIndex) || [];
  const paginatedTasks = tasks?.slice(tasksStartIndex, tasksEndIndex) || [];

  const reportsPageCount = Math.ceil((myReports?.length || 0) / itemsPerPage);
  const tasksPageCount = Math.ceil((tasks?.length || 0) / itemsPerPage);

  const fetchClassroomDetail = async () => {
    try {
      if (!userId) return;

      const response = await fetch(`/api/student/classrooms/${id}`);

      if (response.status === 401 || response.status === 403) {
        router.push('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch classroom details');
      }

      const data = await response.json();
      setClassroom(data);
    } catch (error) {
      console.error('Error fetching classroom details:', error);
      setError('Failed to load classroom details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/prof/tasks?classroomId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchMyReports = async () => {
    try {
      const response = await fetch(`/api/student/reports?classroomId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch my reports');
      }
      const data = await response.json();
      setMyReports(data);
    } catch (error) {
      console.error('Error fetching my reports:', error);
    }
  };

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`/api/student/progress?classroomId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchClassroomDetail();
      fetchTasks();
      fetchMyReports();
      fetchProgressData();
    }
  }, [userId, id, router]);

  if (!userId) {
    router.push('/sign-in');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const formatDateTime = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error || !classroom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || "Classroom not found"}
        </div>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 z-0">
      {/* Back navigation */}
      <Link
        href="/"
        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Classroom header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">{classroom.name}</h1>
              <p className="text-gray-500 mt-1">Professor: {classroom.professor.name}</p>
              <p className="text-gray-500 mt-1">Email: {classroom.professor.email}</p>
              <p className="mt-4 text-gray-700">{classroom.description}</p>
            </div>
          </div>
          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            {progressData ? `${progressData.progressPercentage}%` : `${classroom.progress}%`} Complete
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Start Date: {formatDateTime(classroom.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>End Date: {formatDateTime(classroom.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>
              {progressData
                ? `${progressData.completedHours} / ${progressData.requiredHours} hours completed`
                : `${classroom.hoursCompleted} / ${classroom.hoursRequired} hours completed`}
            </span>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Progress and Reports */}
        <div className="lg:col-span-2 space-y-8">
          <ProgressDashboard key={refreshKey} classroomId={Number(id)} />

          {/* Recent Reports with Pagination */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Reports</h2>
            </div>
            <div className="space-y-4">
              {myReports && myReports.length > 0 ? (
                <>
                  {paginatedReports.map(report => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-gray-900 font-medium">{report.title}</p>
                          <p className="text-sm text-gray-600">
                            {report.type} Report • {formatDateTime(report.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {report.status === 'approved' && (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-5 h-5 mr-1" />
                            Approved
                          </span>
                        )}
                        {report.status === 'rejected' && (
                          <span className="flex items-center text-red-600">
                            <XCircle className="w-5 h-5 mr-1" />
                            Rejected
                          </span>
                        )}
                        {report.status === 'submitted' && (
                          <span className="flex items-center text-yellow-600">
                            <Clock className="w-5 h-5 mr-1" />
                            Submitted
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Reports Pagination Controls */}
                  {reportsPageCount > 1 && (
                    <div className="flex items-center justify-center mt-6 space-x-2">
                      <button
                        onClick={() => setReportsPage(page => Math.max(1, page - 1))}
                        disabled={reportsPage === 1}
                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {Array.from({ length: reportsPageCount }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setReportsPage(idx + 1)}
                          className={`w-8 h-8 rounded-full ${reportsPage === idx + 1
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {idx + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setReportsPage(page => Math.min(reportsPageCount, page + 1))}
                        disabled={reportsPage === reportsPageCount}
                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No reports submitted yet</p>
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Submit Your First Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Actions and Info */}
        <div className="space-y-6">
          {/* Time Entry Form */}
          <TimeEntryForm
            classroomId={Number(id)}
            onSuccess={() => {
              fetchProgressData();
              setRefreshKey(prev => prev + 1);
            }}
          />

          {/* Daily Report Upload Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Daily Report</h2>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Daily Report
              </button>
            </div>
          </div>

          {/* Assigned Tasks with Pagination */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Assigned Tasks</h2>
            </div>

            <div className="space-y-4">
              {tasks.length > 0 ? (
                <>
                  {paginatedTasks.map((task) => (
                    <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Due: {formatDateTime(task.dueDate)}
                          </p>
                        </div>
                        <span className={`h-fit px-2 py-1 text-xs rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Tasks Pagination Controls */}
                  {tasksPageCount > 1 && (
                    <div className="flex items-center justify-center mt-6 space-x-2">
                      <button
                        onClick={() => setTasksPage(page => Math.max(1, page - 1))}
                        disabled={tasksPage === 1}
                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {Array.from({ length: tasksPageCount }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setTasksPage(idx + 1)}
                          className={`w-8 h-8 rounded-full ${tasksPage === idx + 1
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {idx + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setTasksPage(page => Math.min(tasksPageCount, page + 1))}
                        disabled={tasksPage === tasksPageCount}
                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center">No tasks assigned yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <SubmitReportModal
            classroomId={Number(id)}
            tasks={tasks || []}
            onClose={() => setShowSubmitModal(false)}
            onSuccess={() => {
              fetchMyReports();
              setShowSubmitModal(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
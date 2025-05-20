'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Building2, Users, Calendar, Clock, FileText, UserPlus, Plus, Link as LinkIcon, Video } from 'lucide-react';
import Link from 'next/link';
import StudentInviteModal from '../../components/StudentInviteModal';
import InviteCodeButton from '../../components/InviteCodeButton';
import CreateTaskModal from './CreateTaskModal';
import TimeEntryApproval from './TimeEntryApproval';
import ScheduleMeetingModal from './ScheduleMeetingModal';

interface Student {
  id: number;
  name: string;
  email: string;
  progress: number;
}

interface Report {
  createdAt: string | Date;
  id: number;
  title: string;
  date: string;
  studentId: number;
  studentName: string;
  submissionUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  meetingUrl: string;
}

interface CompanyClassroom {
  ojtHours: number;
  id: number;
  name: string;
  description: string;
  professor: {
    id: number;
    email: string;
  };
  createdAt: Date;
  isActive: boolean;
  students: Student[];
  meetings?: Meeting[];
}

interface CompanyClassroomDetailsClientProps {
  id: string;
}

export default function CompanyClassroomDetailsClient({ id }: CompanyClassroomDetailsClientProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [classroom, setClassroom] = useState<CompanyClassroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPage, setStudentsPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [itemsPerPage] = useState(5);

  interface Task {
    id: number;
    title: string;
    description: string;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
  }

  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [studentProgress, setStudentProgress] = useState<Record<number, number>>({});

  const fetchClassroomDetails = async () => {
    try {
      const response = await fetch(`/api/admin/companies/classrooms/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch classroom details');
      }
      const data = await response.json();
      setClassroom(data);
      console.log("classroom data", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/student/reports?classroomId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`/api/prof/meetings?classroomId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      const data = await response.json();
      setMeetings(data);
      console.log("Meetings data:", data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const fetchStudentProgress = async () => {
    if (!classroom || !classroom.students) return;

    const progressData: Record<number, number> = {};

    for (const student of classroom.students) {
      try {
        const response = await fetch(`/api/student/progress?studentId=${student.id}&classroomId=${id}`);
        if (response.ok) {
          const data = await response.json();
          progressData[student.id] = data.progressPercentage || 0;
        }
      } catch (error) {
        console.error(`Error fetching progress for student ${student.id}:`, error);
        progressData[student.id] = 0;
      }
    }

    setStudentProgress(progressData);
  };

  useEffect(() => {
    if (userId) {
      fetchClassroomDetails();
    }
  }, [userId, id]);

  useEffect(() => {
    if (userId && classroom?.students && classroom.students.length > 0) {
      fetchTasks();
      fetchReports();
      fetchMeetings();
      fetchStudentProgress();
    }
  }, [classroom?.students]);

  const formatDate = (dateValue: string | number | Date) => {
    if (!dateValue) return 'No date';

    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Classroom not found</div>
      </div>
    );
  }

  const paginatedTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedStudents = classroom.students?.slice((studentsPage - 1) * itemsPerPage, studentsPage * itemsPerPage) || [];
  const paginatedReports = reports.slice((reportsPage - 1) * itemsPerPage, reportsPage * itemsPerPage);

  const tasksPageCount = Math.ceil(tasks.length / itemsPerPage);
  const studentsPageCount = Math.ceil((classroom.students?.length || 0) / itemsPerPage);
  const reportsPageCount = Math.ceil(reports.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/companies"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Classrooms
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">{classroom.name}</h1>
              <p className="text-gray-500 mt-1">Created by {classroom.professor.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <InviteCodeButton classroomId={classroom.id} />
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Video className="w-4 h-4" />
              Schedule Meeting
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add Students
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3 width) - Now contains TimeEntryApproval and Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Classroom Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Classroom Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-gray-900">{classroom.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Required OJT Hours</h3>
                <p className="mt-1 text-gray-900">{classroom.ojtHours || 600} hours</p>
              </div>
              {/* <div>
                <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                <p className="mt-1 text-gray-900">{classroom.professor.email}</p>
              </div> */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                <p className="mt-1 text-gray-900">
                  {new Date(classroom.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classroom.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {classroom.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Time Entry Approval - Moved to left column */}
          <TimeEntryApproval classroomId={classroom.id} />

          {/* Reports - Stays in left column with pagination */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold">Student Reports</h2>
            </div>

            {reports.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedReports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{report.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">Student: {report.studentName}</p>
                          <p className="text-sm text-gray-500">
                            Date: {report.createdAt ? formatDate(report.createdAt) : 'No date'}
                          </p>
                        </div>

                        <span className={`px-2 py-1 text-xs rounded-full ${report.status === 'approved' ? 'bg-green-100 text-green-800' :
                          report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {report.status}
                        </span>
                      </div>
                      {report.submissionUrl && (
                        <div className="mt-3">
                          <a
                            href={report.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <LinkIcon className="w-3 h-3" />
                            View Submission
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination controls for reports */}
                {reportsPageCount > 1 && (
                  <div className="flex items-center justify-center mt-6">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: reportsPageCount }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setReportsPage(index + 1)}
                          className={`w-8 h-8 rounded-full text-sm ${reportsPage === index + 1
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No reports submitted yet</p>
            )}
          </div>
        </div>

        {/* Right column (1/3 width) - Now contains Students and Tasks */}
        <div className="space-y-6">
          {/* Students - Moved to right column with pagination */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Students</h2>
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-blue-600 text-sm hover:text-blue-800 font-medium flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Students
              </button>
            </div>
            {classroom.students && classroom.students.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${studentProgress[student.id] || 0}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {studentProgress[student.id] || 0}%
                          {/* ({student.completedHours || 0}/{classroom.ojtHours || 600} hours) */}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination controls for students */}
                {studentsPageCount > 1 && (
                  <div className="flex items-center justify-center mt-6">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: studentsPageCount }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setStudentsPage(index + 1)}
                          className={`w-8 h-8 rounded-full text-sm ${studentsPage === index + 1
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Yet</h3>
                <p className="text-gray-500">
                  Share the invite code with students or add them directly.
                </p>
              </div>
            )}
          </div>

          {/* Tasks - Stays in right column */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <button
                onClick={() => setShowTaskModal(true)}
                className="text-blue-600 text-sm hover:text-blue-800 font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            </div>

            {tasks.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedTasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        </div>

                        <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination controls for tasks */}
                {tasksPageCount > 1 && (
                  <div className="flex items-center justify-center mt-6">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: tasksPageCount }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`w-8 h-8 rounded-full text-sm ${currentPage === index + 1
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No tasks created yet</p>
            )}
          </div>

          {/* Scheduled Meetings Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* <Calendar className="w-6 h-6 text-blue-600" /> */}
                <h2 className="text-lg font-semibold">Scheduled Meetings</h2>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="text-blue-600 text-sm hover:text-blue-800 font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Meeting
              </button>
            </div>

            {meetings && meetings.length > 0 ? (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(meeting.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {meeting.time}
                          </span>
                        </div>
                      </div>
                      <a
                        href={meeting.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm hover:bg-blue-200 transition-colors"
                      >
                        Join Meeting
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4">No meetings scheduled yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && (
        <StudentInviteModal
          classroomId={classroom.id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            fetchClassroomDetails();
            setShowInviteModal(false);
          }}
        />
      )}

      {showScheduleModal && (
        <ScheduleMeetingModal
          classroomId={classroom.id}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            fetchMeetings();
            setShowScheduleModal(false);
          }}
        />
      )}

      {showTaskModal && (
        <CreateTaskModal
          classroomId={classroom.id}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            fetchTasks();
            setShowTaskModal(false);
          }}
          students={classroom.students || []}
        />
      )}

    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface TimeEntry {
  id: number;
  date: string;
  hours: number;
  description: string;
  classroomId: number;
  studentId: number;
  createdAt: string;
  updatedAt: string;
}

interface Classroom {
  id: number;
  name: string;
  description: string;
  professorId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
}

interface DayEntries {
  [key: number]: boolean;
}

export default function ProgressPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [requiredHours, setRequiredHours] = useState(500); // Default required hours
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchClassrooms() {
      setLoading(true);
      try {
        const response = await fetch('/api/student/classrooms');

        if (response.status === 401 || response.status === 403) {
          setClassrooms([]);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch classrooms');
        }

        const data = await response.json();
        console.log("Fetched classrooms data:", data); // For debugging

        setClassrooms(data);
        if (data.length > 0) {
          setSelectedClassroom(Number(data[0].id));
        }
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClassrooms();
  }, [isSignedIn]);

  useEffect(() => {
    if (!selectedClassroom) return;

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch time entries
        const entriesResponse = await fetch(`/api/student/time-entries?classroomId=${selectedClassroom}`);
        if (!entriesResponse.ok) {
          throw new Error('Failed to fetch time entries');
        }
        const entriesData = await entriesResponse.json();
        setTimeEntries(entriesData);

        // Fetch progress data
        const progressResponse = await fetch(`/api/student/progress?classroomId=${selectedClassroom}`);
        if (!progressResponse.ok) {
          throw new Error('Failed to fetch progress');
        }
        const progressData = await progressResponse.json();

        // Update state with the progress data from API
        setTotalHours(progressData.completedHours);
        setRequiredHours(progressData.requiredHours);

        // Fetch tasks using the same endpoint as ClassroomDetailClient
        const tasksResponse = await fetch(`/api/prof/tasks?classroomId=${selectedClassroom}`);
        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedClassroom]);

  // Generate calendar days for attendance tracking
  const renderAttendanceCalendar = () => {
    // Get current month
    const currentDate = new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Check which days have time entries
    const daysWithEntries = timeEntries.reduce<DayEntries>((acc, entry) => {
      const entryDate = parseISO(entry.date);
      // Only include days in the current month
      if (isSameMonth(entryDate, currentDate)) {
        const day = entryDate.getDate();
        acc[day] = true;
      }
      return acc;
    }, {});

    // Return array of numbers 1-30 (days of month)
    return Array.from({ length: days.length }, (_, i) => {
      const day = i + 1;
      const hasEntry = daysWithEntries[day] || false;

      return (
        <div
          key={i}
          className={`aspect-square rounded-md flex items-center justify-center text-sm ${hasEntry
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-400'
            }`}
        >
          {day}
        </div>
      );
    });
  };

  // Count completed tasks
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  // Calculate progress percentage
  const progressPercentage = Math.min(Math.round((totalHours / requiredHours) * 100), 100);

  if (!isLoaded) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress Tracking</h1>
        <p className="text-gray-500">
          Monitor your OJT progress and achievements
        </p>
      </div>

      {loading ? (
        <div className="h-60 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {classrooms.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">You are not assigned to any company yet</p>
            </div>
          ) : (
            <>
              {selectedClassroom && (
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Overall Progress</h2>

                    {classrooms.length > 1 && (
                      <select
                        value={selectedClassroom}
                        onChange={(e) => setSelectedClassroom(e.target.value ? Number(e.target.value) : null)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        {classrooms.map((classroom) => (
                          <option key={classroom.id} value={classroom.id}>
                            {classroom.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Progress Bar - Styled like ProgressDashboard */}
                  <div className="flex flex-col">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Completed Hours</span>
                      <span className="font-semibold text-gray-900">{totalHours}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-600">Required Hours</span>
                      <span className="font-semibold text-gray-900">{requiredHours}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {requiredHours - totalHours} hours remaining
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Attendance Summary</h2>
                <div className="grid grid-cols-7 gap-2">
                  {renderAttendanceCalendar()}
                </div>
                <p className="text-sm text-gray-500 mt-4">Green indicates days with recorded hours</p>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Task Progress</h2>
                <div className="space-y-4">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}></div>
                          <span>{task.title}</span>
                        </div>
                        <span className="text-sm text-gray-500 capitalize">{task.status.replace('_', ' ')}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No tasks assigned yet</p>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
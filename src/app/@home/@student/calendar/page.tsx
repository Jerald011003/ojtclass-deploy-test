'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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

interface DayEntries {
  [key: string]: number;
}

export default function CalendarPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  // Check authentication
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch student's classrooms
  useEffect(() => {
    if (!isSignedIn) return;
    
    async function fetchClassrooms() {
      setLoading(true);
      try {
        const response = await fetch('/api/classrooms');
        const data = await response.json();
        setClassrooms(data.classrooms || []);
        if (data.classrooms && data.classrooms.length > 0) {
          setSelectedClassroom(Number(data.classrooms[0].id));
        }
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchClassrooms();
  }, [isSignedIn]);

  // Fetch time entries when classroom selected or month changes
  useEffect(() => {
    if (!selectedClassroom) return;
    
    async function fetchTimeEntries() {
      setLoading(true);
      try {
        const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
        
        const response = await fetch(`/api/classrooms/timeEntries?classroomId=${selectedClassroom}&startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        setTimeEntries(data.timeEntries || []);
        
        // Calculate weekly and total hours
        calculateHours(data.timeEntries || []);
      } catch (error) {
        console.error('Error fetching time entries:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTimeEntries();
  }, [selectedClassroom, currentDate]);

  // Calculate hours from time entries
  const calculateHours = (entries: TimeEntry[]) => {
    // Calculate total hours
    const total = entries.reduce((sum, entry) => sum + entry.hours, 0);
    setTotalHours(total);
    
    // Calculate weekly hours (last 7 days)
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const weeklyTotal = entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneWeekAgo && entryDate <= today;
      })
      .reduce((sum, entry) => sum + entry.hours, 0);
    
    setWeeklyHours(weeklyTotal);
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Log time entry
  const logHours = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClassroom || !hours || parseFloat(hours) <= 0) {
      setMessage({ type: 'error', content: 'Please select a company and enter valid hours' });
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/classrooms/timeEntries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classroomId: selectedClassroom,
          date: format(new Date(), 'yyyy-MM-dd'),
          hours: parseInt(hours),
          description,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', content: 'Hours logged successfully!' });
        setHours('');
        setDescription('');
        
        // Refresh time entries
        const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
        const refreshResponse = await fetch(`/api/classrooms/timeEntries?classroomId=${selectedClassroom}&startDate=${startDate}&endDate=${endDate}`);
        const refreshData = await refreshResponse.json();
        setTimeEntries(refreshData.timeEntries || []);
        calculateHours(refreshData.timeEntries || []);
      } else {
        setMessage({ type: 'error', content: data.message || 'Failed to log hours' });
      }
    } catch (error) {
      console.error('Error logging hours:', error);
      setMessage({ type: 'error', content: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  // Generate calendar days
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Check which days have time entries
    const daysWithEntries = timeEntries.reduce<DayEntries>((acc, entry) => {
      const entryDate = new Date(entry.date);
      const dateKey = format(entryDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += entry.hours;
      return acc;
    }, {});
    
    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const hasEntry = dateKey in daysWithEntries;
      const hours = daysWithEntries[dateKey] || 0;
      
      return (
        <div 
          key={day.toString()} 
          className={`aspect-square flex flex-col items-center justify-center text-sm rounded-md
            ${hasEntry ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-700'}
            ${isSameDay(day, new Date()) ? 'ring-2 ring-blue-500' : ''}
          `}
        >
          <span>{format(day, 'd')}</span>
          {hasEntry && (
            <span className="text-xs mt-1">{hours}h</span>
          )}
        </div>
      );
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {/* Log Hours Form */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-semibold">Log Hours</h2>
          <form onSubmit={logHours} className="space-y-4">
            <div>
              <label htmlFor="classroom" className="block text-sm font-medium text-gray-700">
                Select Company
              </label>
              <div className="mt-1">
                <select
                  value={selectedClassroom || ''}
                  onChange={(e) => setSelectedClassroom(e.target.value ? Number(e.target.value) : null)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Today's Hours</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                  required
                />
                <button 
                  type="submit"
                  disabled={submitting} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Log Hours
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="What did you work on today?"
              ></textarea>
            </div>
          </form>
        </div>
        
        {/* Calendar */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-xl font-semibold mb-4">Calendar</h2>
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <div className="text-center">
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={prevMonth}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-medium text-lg">
                      {format(currentDate, 'MMMM yyyy')}
                    </h3>
                    <button 
                      onClick={nextMonth}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    <div className="text-xs text-gray-500">Sun</div>
                    <div className="text-xs text-gray-500">Mon</div>
                    <div className="text-xs text-gray-500">Tue</div>
                    <div className="text-xs text-gray-500">Wed</div>
                    <div className="text-xs text-gray-500">Thu</div>
                    <div className="text-xs text-gray-500">Fri</div>
                    <div className="text-xs text-gray-500">Sat</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 flex justify-between">
                  <div>
                    <span className="inline-block w-3 h-3 bg-green-100 rounded-full mr-1"></span>
                    Days with logged hours
                  </div>
                  <div>
                    <span className="inline-block ring-2 ring-blue-500 w-3 h-3 rounded-full mr-1"></span>
                    Today
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4">Time Tracking</h3>
                {classrooms.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    You are not assigned to any company yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">This Week</label>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((weeklyHours / 40) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{weeklyHours} hours</span>
                        <span>40 hours</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Hours Logged</label>
                      <p className="text-2xl font-bold">{totalHours} hours</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {message.content && (
        <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {message.content}
        </div>
      )}
    </div>
  );
}
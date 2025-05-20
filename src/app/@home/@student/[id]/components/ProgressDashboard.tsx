'use client';

import { useEffect, useState } from 'react';
import { Clock, ChevronLeft, ChevronRight, Coffee } from 'lucide-react';

interface TimeEntry {
  id: number;
  date: string;
  hours: number;
  description: string;
  isApproved: boolean;
  timeIn?: string;     
  timeOut?: string;    
  breakMinutes?: number; 
}

interface ProgressData {
  completedHours: number;
  requiredHours: number;
  progressPercentage: number;
}

interface ProgressDashboardProps {
  classroomId: number;
}

export default function ProgressDashboard({ classroomId }: ProgressDashboardProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [entriesPage, setEntriesPage] = useState(1);
  const [entriesPerPage] = useState(5);

  const entriesStartIndex = (entriesPage - 1) * entriesPerPage;
  const entriesEndIndex = entriesPage * entriesPerPage;
  const paginatedEntries = timeEntries?.slice(entriesStartIndex, entriesEndIndex) || [];
  const entriesPageCount = Math.ceil((timeEntries?.length || 0) / entriesPerPage);

  const fetchData = async () => {
  try {
    const entriesResponse = await fetch(`/api/student/time-entries?classroomId=${classroomId}`);
    if (!entriesResponse.ok) {
      const errorData = await entriesResponse.json();
      throw new Error(errorData.message || 'Failed to fetch time entries');
    }
    const entriesData = await entriesResponse.json();
    setTimeEntries(entriesData);
    
    const progressResponse = await fetch(`/api/student/progress?classroomId=${classroomId}`);
    if (!progressResponse.ok) {
      const errorText = await progressResponse.text();
      let errorMessage = 'Failed to fetch progress';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }
    const progressData = await progressResponse.json();
    setProgress(progressData);
    
  } catch (err) {
    console.error("Error fetching data:", err);
    setError(err instanceof Error ? err.message : 'An error occurred');
  }
};

  useEffect(() => {
    fetchData();
  }, [classroomId]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">OJT Progress</h2>

        <div className="flex flex-col">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Completed Hours</span>
            <span className="font-semibold text-gray-900">{progress?.completedHours || 0}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Required Hours</span>
            <span className="font-semibold text-gray-900">{progress?.requiredHours || 500}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress?.progressPercentage || 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {(progress?.requiredHours || 500) - (progress?.completedHours || 0)} hours remaining
          </p>
        </div>
      </div>

      {/* Recent Time Entries with Pagination */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Time Entries</h2>
        {timeEntries.length > 0 ? (
          <div className="space-y-4">
            {paginatedEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-medium">{entry.hours} hours</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(entry.date)}
                    </p>
                    
                    {/* Time In/Out and Break Display */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-600">
                      {entry.timeIn && (
                        <p className="flex items-center">
                          <span className="font-medium mr-1">Time In:</span> {entry.timeIn}
                        </p>
                      )}
                      {entry.timeOut && (
                        <p className="flex items-center">
                          <span className="font-medium mr-1">Time Out:</span> {entry.timeOut}
                        </p>
                      )}
                      {entry.breakMinutes !== undefined && entry.breakMinutes > 0 && (
                        <p className="flex items-center">
                          <Coffee className="w-3 h-3 mr-1" />
                          <span className="font-medium mr-1">Break:</span> {entry.breakMinutes} min
                        </p>
                      )}
                    </div>
                    
                    {entry.description && (
                      <p className="text-sm text-gray-700 mt-1">{entry.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination Controls */}
            {entriesPageCount > 1 && (
              <div className="flex items-center justify-center mt-6 space-x-2">
                <button 
                  onClick={() => setEntriesPage(page => Math.max(1, page - 1))} 
                  disabled={entriesPage === 1}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: entriesPageCount }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setEntriesPage(idx + 1)}
                    className={`w-8 h-8 rounded-full ${
                      entriesPage === idx + 1 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setEntriesPage(page => Math.min(entriesPageCount, page + 1))} 
                  disabled={entriesPage === entriesPageCount}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No time entries yet</p>
        )}
      </div>
    </div>
  );
}
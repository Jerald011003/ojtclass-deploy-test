'use client';

import { useEffect, useState } from 'react';
import { Check, X, Clock, Calendar, User } from 'lucide-react';

interface TimeEntry {
  id: number;
  date: string;
  hours: number;
  description: string;
  isApproved: boolean;
  student: {
    id: number;
    email: string;
  };
}

interface TimeEntryApprovalProps {
  classroomId: number;
}

export default function TimeEntryApproval({ classroomId }: TimeEntryApprovalProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/student/time-entries?classroomId=${classroomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch time entries');
      }
      const data = await response.json();
      setTimeEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeEntries();
  }, [classroomId]);

  const handleApprove = async (entryId: number) => {
    try {
      const response = await fetch(`/api/prof/time-entries/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          timeEntryId: entryId,
          approved: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve time entry');
      }
      
      // Update the local state
      setTimeEntries(prev => 
        prev.map(entry => 
          entry.id === entryId ? { ...entry, isApproved: true } : entry
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleReject = async (entryId: number) => {
    if (!confirm('Are you sure you want to reject this time entry?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/prof/time-entries/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          timeEntryId: entryId,
          approved: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject time entry');
      }
      
      // Remove the entry from the list
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Filter for pending entries
  const pendingEntries = timeEntries.filter(entry => !entry.isApproved);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Time Entry Approvals
      </h2>
      
      {pendingEntries.length > 0 ? (
        <div className="space-y-4">
          {pendingEntries.map((entry) => (
            <div 
              key={entry.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">{entry.student.email}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{entry.hours} hours</span>
                    <span>•</span>
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-gray-700 mt-1">{entry.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleApprove(entry.id)}
                  className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                  title="Approve"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleReject(entry.id)}
                  className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                  title="Reject"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No pending time entries to approve</p>
      )}
    </div>
  );
}
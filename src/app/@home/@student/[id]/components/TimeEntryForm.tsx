'use client';

import { useState } from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';

interface TimeEntryFormProps {
  classroomId: number;
  onSuccess: () => void;
}

export default function TimeEntryForm({ classroomId, onSuccess }: TimeEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const timeIn = formData.get('timeIn') as string;
    const timeOut = formData.get('timeOut') as string;
    const breakMinutes = parseInt(formData.get('breakMinutes') as string) || 0;
    
    const [inHour = 0, inMinute = 0] = timeIn.split(':').map(Number);
    const [outHour = 0, outMinute = 0] = timeOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMinute;
    const outMinutes = outHour * 60 + outMinute;
    
    let totalMinutes = outMinutes - inMinutes - breakMinutes;
    
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; 
    }
    
    const hours = Math.round(totalMinutes / 30) / 2;

    const data = {
      classroomId,
      date: formData.get('date') as string,
      timeIn,
      timeOut,
      breakMinutes,
      hours,
      description: formData.get('description') as string,
    };

    try {
      const response = await fetch('/api/student/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit time entry');
      }

      if (form) {
        try {
          form.reset();
        } catch (resetError) {
          console.warn('Could not reset form:', resetError);
        }
      }
      setSuccessMessage('Time entry submitted successfully!');

         if (form) {
        try {
          form.reset();
        } catch (resetError) {
          console.warn('Could not reset form:', resetError);
        }
      }

      onSuccess();
           setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Log OJT Hours
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="date"
              name="date"
              required
              max={new Date().toISOString().split('T')[0]}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timeIn" className="block text-sm font-medium text-gray-700 mb-1">
              Time In
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="time"
                id="timeIn"
                name="timeIn"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="timeOut" className="block text-sm font-medium text-gray-700 mb-1">
              Time Out
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="time"
                id="timeOut"
                name="timeOut"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="breakMinutes" className="block text-sm font-medium text-gray-700 mb-1">
            Break Time (minutes)
          </label>
          <input
            type="number"
            id="breakMinutes"
            name="breakMinutes"
            min="0"
            max="480"
            defaultValue="0"
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Enter total break time in minutes</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Work Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Describe the work you did today"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Time Entry'}
        </button>
      </form>
    </div>
  );
}
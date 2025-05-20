'use client';

import { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
}

interface StudentInviteModalProps {
  classroomId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentInviteModal({ classroomId, onClose, onSuccess }: StudentInviteModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setStudents([]);
      return;
    }

    try {
      const response = await fetch(`/api/admin/students/search?term=${encodeURIComponent(term)}`);
      if (!response.ok) {
        throw new Error('Failed to search students');
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError('Failed to search students');
    }
  };

  const handleInvite = async () => {
    if (selectedStudents.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/companies/classrooms/${classroomId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds: selectedStudents }),
      });

      if (!response.ok) {
        throw new Error('Failed to invite students');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to invite students. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudent = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Invite Students</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search students by name or email"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto mb-6">
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No students found'}
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                      selectedStudents.includes(student.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50 border-gray-200'
                    } border`}
                    onClick={() => toggleStudent(student.id)}
                  >
                    <div>
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                    <div className={`w-5 h-5 border rounded ${
                      selectedStudents.includes(student.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedStudents.includes(student.id) && (
                        <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInvite}
              disabled={selectedStudents.length === 0 || isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {isLoading ? 'Inviting...' : 'Invite Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
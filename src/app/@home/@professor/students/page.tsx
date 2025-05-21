'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { PlusCircle, ArrowLeft, ArrowRight, Loader2, Trash2 } from "lucide-react";
import StudentInviteCard from "../components/StudentInviteCard";
import ProfNavbar from "../components/ProfNavbar";

// Define interfaces for type safety
interface Classroom {
  id: number;
  name: string;
  ojtHours?: number;
}

interface Student {
  id: number;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  clerkId: string;
  createdAt: Date;
}

interface EnhancedStudent {
  id: number;
  email: string | null;
  name: string;
  classroom: string;
  progress: number;
  completedHours: number;
  requiredHours: number;
}

export default function ProfStudentsPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [showInviteCard, setShowInviteCard] = useState(false);
  const [displayStudents, setDisplayStudents] = useState<EnhancedStudent[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [studentToDelete, setStudentToDelete] = useState<EnhancedStudent | null>(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
  // Check authentication
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  // Fetch students data
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;

      try {
        setIsLoading(true);

        // Fetch the professor's classrooms
        const classroomsResponse = await fetch('/api/prof/companies/classrooms', {
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (!classroomsResponse.ok) {
          throw new Error('Failed to fetch classrooms');
        }

        const classroomsData = await classroomsResponse.json();
        const professorClassrooms = classroomsData.classrooms || [];
        setClassrooms(professorClassrooms);

        // If no classrooms, no students to fetch
        if (professorClassrooms.length === 0) {
          setDisplayStudents([]);
          setIsLoading(false);
          return;
        }

        // Fetch all students enrolled in these classrooms
        const studentsMap = new Map<number, EnhancedStudent>();
        const processedStudents = new Set<number>();

        for (const classroom of professorClassrooms) {
          try {
            // Fetch classroom details including students
            const classroomDetailsResponse = await fetch(`/api/admin/companies/classrooms/${classroom.id}`);

            if (!classroomDetailsResponse.ok) {
              console.error(`Failed to fetch details for classroom ${classroom.id}`);
              continue;
            }

            const classroomDetails = await classroomDetailsResponse.json();
            const students = classroomDetails.students || [];

            // Process each student
            for (const student of students) {
              // Skip if already processed this student
              if (processedStudents.has(student.id)) continue;
              processedStudents.add(student.id);

              // Fetch progress data for this student in this classroom
              let completedHours = 0;
              let requiredHours = classroom.ojtHours || 600;
              let progressPercentage = 0;

              try {
                const progressResponse = await fetch(`/api/student/progress?studentId=${student.id}&classroomId=${classroom.id}`);

                if (progressResponse.ok) {
                  const progressData = await progressResponse.json();
                  completedHours = progressData.completedHours || 0;
                  requiredHours = progressData.requiredHours || classroom.ojtHours || 600;
                  progressPercentage = progressData.progressPercentage || 0;
                }
              } catch (error) {
                console.error(`Error fetching progress for student ${student.id}:`, error);
              }

              // Create enhanced student object with real data
              const enhancedStudent: EnhancedStudent = {
                id: student.id,
                email: student.email,
                name: student.firstName && student.lastName
                  ? `${student.firstName} ${student.lastName}`
                  : student.email?.split('@')[0] || 'Unknown',
                classroom: classroom.name,
                progress: progressPercentage,
                completedHours: completedHours,
                requiredHours: requiredHours
              };

              studentsMap.set(student.id, enhancedStudent);
            }
          } catch (error) {
            console.error(`Error processing classroom ${classroom.id}:`, error);
          }
        }

        setDisplayStudents(Array.from(studentsMap.values()));
        setError(null);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to fetch students. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const openDeleteModal = (student: EnhancedStudent) => {
  setStudentToDelete(student);
  setShowDeleteModal(true);
};

const closeDeleteModal = () => {
  setShowDeleteModal(false);
  setStudentToDelete(null);
};

const handleDeleteStudent = async () => {
  if (!studentToDelete) return;
  
  try {
    setIsDeleting(true);
    
    // Find the classroom ID for this student
    const classroom = classrooms.find(c => c.name === studentToDelete.classroom);
    if (!classroom) {
      throw new Error("Classroom not found for student");
    }
    
    const response = await fetch(`/api/prof/classrooms/${classroom.id}/students/${studentToDelete.id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to remove student');
    }
    
    // Remove student from state
    setDisplayStudents(students => 
      students.filter(s => s.id !== studentToDelete.id)
    );
    
    closeDeleteModal();
  } catch (error) {
    console.error('Failed to remove student:', error);
    setError(error instanceof Error ? error.message : 'Failed to remove student');
  } finally {
    setIsDeleting(false);
  }
};

  if (!isLoaded) {
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

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ProfNavbar />
      <main className="pt-1 px-2 sm:px-3 lg:px-4">
        <div className="space-y-6 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
            <p className="text-gray-500">
              View progress of students in your classrooms
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-medium">Students</h2>
                <div className="mt-3 sm:mt-0">
                  <button
                    onClick={() => setShowInviteCard(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Invite Student</span>
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Loading students...</p>
              </div>
            ) : displayStudents.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-gray-500">No students found in your classrooms.</p>
                <p className="text-gray-500 mt-2">Invite students to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classroom
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
      Actions
    </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.classroom}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${student.progress >= 70 ? 'bg-green-600' :
                                  student.progress >= 40 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{student.progress}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.completedHours}/{student.requiredHours}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => openDeleteModal(student)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {displayStudents.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {displayStudents.length} students
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    disabled={true}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="sr-only">Previous</span>
                  </button>
                  <button
                    className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    disabled={true}
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span className="sr-only">Next</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* {showInviteCard && (
            <StudentInviteCard onClose={() => setShowInviteCard(false)} />
          )} */}
        </div>
      </main>
    </div>
  );
}
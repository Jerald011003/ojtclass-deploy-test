'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { Building2, Plus, Users, Calendar, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface CompanyClassroom {
  id: number;
  name: string;
  description: string;
  professor: {
    id: number;
    email: string;
  };
  isActive: boolean;
  createdAt: Date;
}

export default function CompanyClassroomsPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [classrooms, setClassrooms] = useState<CompanyClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRoleAndFetchData = async () => {
      if (!isLoaded) return;

      if (!userId) {
        router.push('/sign-in');
        return;
      }

      try {
        console.log('Starting role check...');
        const roleResponse = await fetch('/api/prof/check-role');
        const roleData = await roleResponse.json();
        
        console.log('Role check response:', {
          status: roleResponse.status,
          data: roleData
        });

        if (!roleResponse.ok) {
          if (roleResponse.status === 403) {
            console.log('Access forbidden - redirecting to student view');
            router.push('/');
            return;
          }
          throw new Error(roleData.message || 'Failed to verify role');
        }

        // if (roleData.role !== 'professor') {
        //   console.log('Not a professor role:', roleData.role);
        //   router.push('/');
        //   return;
        // }

        console.log('Confirmed professor role, fetching classrooms...');

        const response = await fetch('/api/prof/companies/classrooms', {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        const data = await response.json();
        
        console.log('Classrooms response:', {
          status: response.status,
          data: data
        });

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch classrooms');
        }
        
        setClassrooms(data.classrooms || []);
      } catch (err) {
        console.error('Error in checkRoleAndFetchData:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkRoleAndFetchData();
  }, [userId, isLoaded, router]);

  const handleDelete = async (classroomId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this classroom?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/companies/classrooms/${classroomId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete classroom');
      }

      setClassrooms(prevClassrooms => 
        prevClassrooms.filter(classroom => classroom.id !== classroomId)
      );
    } catch (err) {
      setError('Failed to delete classroom');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Company Classrooms</h1>
        <Link
          href="/companies/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Classroom
        </Link>
      </div>

      {classrooms.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Classrooms Yet</h3>
          <p className="text-gray-500 mb-6">Create your first company classroom to get started.</p>
          <Link
            href="/companies/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Classroom
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(`/companies/${classroom.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">{classroom.name}</h2>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/companies/${classroom.id}/edit`);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                    title="Edit classroom"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(classroom.id, e)}
                    className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete classroom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{classroom.description}</p>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Created by: {classroom.professor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(classroom.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
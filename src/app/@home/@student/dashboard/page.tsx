'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Loader2 } from 'lucide-react';
import JoinClassroomModal from '../components/JoinClassroomModal';

interface Classroom {
  id: number;
  name: string;
  description: string;
  progress?: number;
}

interface ProgressData {
  completedHours: number;
  requiredHours: number;
  progressPercentage: number;
}

interface ClassroomWithProgress extends Classroom {
  progress: number;
}

export default function StudentDashboard() {
  const { userId } = useAuth();
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<ClassroomWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchClassrooms = async () => {
    try {
      if (!userId) return;
      
      setLoading(true);
      const response = await fetch('/api/student/classrooms');
      
      if (response.status === 401 || response.status === 403) {
        setClassrooms([]);
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch classrooms');
      }
      
      const classroomsData = await response.json();
      
      const classroomsWithProgress = await Promise.all(
        classroomsData.map(async (classroom: Classroom) => {
          try {
            const progressResponse = await fetch(`/api/student/progress?classroomId=${classroom.id}`);
            if (!progressResponse.ok) {
              return { 
                ...classroom, 
                progress: 0 
              };
            }
            
            const progressData: ProgressData = await progressResponse.json();
            return {
              ...classroom,
              progress: progressData.progressPercentage 
            };
          } catch (error) {
            console.error(`Error fetching progress for classroom ${classroom.id}:`, error);
            return { 
              ...classroom, 
              progress: 0 
            };
          }
        })
      );
      
      setClassrooms(classroomsWithProgress);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchClassrooms();
    }
  }, [userId]);


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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Classrooms</h1>
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Join Classroom
        </button>
      </div>

      {classrooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/${classroom.id}`)}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold">{classroom.name}</h2>
                </div>
                <p className="text-gray-500 mb-4 line-clamp-2">{classroom.description}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{classroom.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${classroom.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No Classrooms Yet</h2>
          <p className="text-gray-500 mb-4">
            Join a classroom using an invite code from your professor.
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Join Classroom
          </button>
        </div>
      )}

      {showJoinModal && (
        <JoinClassroomModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            fetchClassrooms();
            setShowJoinModal(false);
          }}
        />
      )}
    </div>
  );
} 

// 'use client';

// import { useUser } from "@clerk/nextjs";
// import StudentView from "../_components/StudentView";

// export default function StudentPage() {
//   const { user } = useUser();
  
//   if (!user) {
//     return null;
//   }
  
//   return <StudentView />;
// }
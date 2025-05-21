// 'use client';

// import { useState, useEffect } from 'react';
// import { useUser } from '@clerk/nextjs';
// import { useRouter, useParams } from 'next/navigation';
// import Link from 'next/link';
// import { ArrowLeft, Loader2 } from 'lucide-react';
// import ProfNavbar from '../../../components/ProfNavbar';

// // Types
// interface Student {
//   id: number;
//   name: string;
//   email: string | null;
//   company: string;
//   classroomId: number;
//   progress: number;
//   firstName: string;
//   lastName: string;
//   startDate?: string | null;
//   endDate?: string | null;
// }

// interface Classroom {
//   id: number;
//   name: string;
// }

// export default function StudentEditPage() {
//   const { id } = useParams();
//   const { user, isLoaded } = useUser();
//   const router = useRouter();
  
//   const [student, setStudent] = useState<Student | null>(null);
//   const [classrooms, setClassrooms] = useState<Classroom[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isSaving, setIsSaving] = useState(false);
  
//   // Form state
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [classroomId, setClassroomId] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');

//   useEffect(() => {
//     if (isLoaded && !user) {
//       router.push('/sign-in');
//     }
//   }, [isLoaded, user, router]);

//   // Fetch classrooms
//   useEffect(() => {
//     async function fetchClassrooms() {
//       try {
//         const response = await fetch('/api/prof/companies/classrooms');
//         if (!response.ok) {
//           throw new Error('Failed to fetch classrooms');
//         }
//         const data = await response.json();
//         setClassrooms(data.classrooms || []);
//       } catch (error) {
//         console.error('Error fetching classrooms:', error);
//       }
//     }

//     fetchClassrooms();
//   }, []);

//   // Fetch student data
//   useEffect(() => {
//     async function fetchStudentData() {
//       try {
//         setIsLoading(true);
        
//         const response = await fetch(`/api/prof/students/${id}`);
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Failed to fetch student');
//         }
        
//         const data = await response.json();
//         setStudent(data);
        
//         // Initialize form state with fetched data
//         setFirstName(data.firstName || '');
//         setLastName(data.lastName || '');
//         setEmail(data.email || '');
//         setClassroomId(data.classroomId?.toString() || '');
        
//         // Format dates for input elements (YYYY-MM-DD)
//         if (data.startDate) {
//           const startDate = new Date(data.startDate);
//           if (!isNaN(startDate.getTime())) {
//             setStartDate(startDate.toISOString().split('T')[0]);
//           }
//         }
        
//         if (data.endDate) {
//           const endDate = new Date(data.endDate);
//           if (!isNaN(endDate.getTime())) {
//             setEndDate(endDate.toISOString().split('T')[0]);
//           }
//         }
        
//         setIsLoading(false);
//       } catch (err) {
//         console.error('Error fetching student data:', err);
//         setError(err instanceof Error ? err.message : 'Failed to load student data');
//         setIsLoading(false);
//       }
//     }
    
//     if (id) {
//       fetchStudentData();
//     }
//   }, [id]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSaving(true);
    
//     try {
//       const response = await fetch(`/api/prof/students/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           firstName,
//           lastName,
//           email,
//           classroomId: classroomId ? parseInt(classroomId) : undefined,
//           startDate,
//           endDate
//         })
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update student');
//       }
      
//       // Redirect to view page on success
//       router.push(`/students/${id}/view`);
//     } catch (err) {
//       console.error('Error updating student:', err);
//       setError(err instanceof Error ? err.message : 'Failed to update student. Please try again.');
//       setIsSaving(false);
//     }
//   };

//   if (!isLoaded || isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-100">
//         <ProfNavbar />
//         <main className="pt-16 px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-center items-center min-h-[80vh]">
//             <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//           </div>
//         </main>
//       </div>
//     );
//   }

//   if (error || !student) {
//     return (
//       <div className="min-h-screen bg-gray-100">
//         <ProfNavbar />
//         <main className="pt-16 px-4 sm:px-6 lg:px-8">
//           <div className="py-6">
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
//               {error || 'Student not found'}
//             </div>
//             <div className="mt-4">
//               <Link href="/students" className="text-blue-600 hover:text-blue-800">
//                 &larr; Back to Students
//               </Link>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <ProfNavbar />
//       <main className="pt-16 px-4 sm:px-6 lg:px-8">
//         <div className="py-6 space-y-6">
//           <div className="flex items-center gap-4">
//             <Link href={`/students/${id}/view`} className="p-2 rounded-full hover:bg-gray-200">
//               <ArrowLeft className="w-5 h-5" />
//             </Link>
//             <div>
//               <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
//               <p className="text-gray-500">
//                 Update information for {student.name}
//               </p>
//             </div>
//           </div>
          
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
//               {error}
//             </div>
//           )}
          
//           <div className="bg-white shadow rounded-lg overflow-hidden">
//             <div className="p-6">
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <label 
//                       htmlFor="firstName" 
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       First Name
//                     </label>
//                     <input
//                       type="text"
//                       id="firstName"
//                       name="firstName"
//                       value={firstName}
//                       onChange={(e) => setFirstName(e.target.value)}
//                       required
//                       className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label 
//                       htmlFor="lastName" 
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Last Name
//                     </label>
//                     <input
//                       type="text"
//                       id="lastName"
//                       name="lastName"
//                       value={lastName}
//                       onChange={(e) => setLastName(e.target.value)}
//                       required
//                       className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label 
//                       htmlFor="email" 
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Email Address
//                     </label>
//                     <input
//                       type="email"
//                       id="email"
//                       name="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                       className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label 
//                       htmlFor="classroom" 
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Classroom
//                     </label>
//                     <select
//                       id="classroom"
//                       name="classroom"
//                       value={classroomId}
//                       onChange={(e) => setClassroomId(e.target.value)}
//                       className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="">-- Select Classroom --</option>
//                       {classrooms.map(classroom => (
//                         <option key={classroom.id} value={classroom.id}>
//                           {classroom.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label 
//                       htmlFor="startDate" 
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Start Date
//                     </label>
//                     <input
//                       type="date"
//                       id="startDate"
//                       name="startDate"
//                       value={startDate}
//                       onChange={(e) => setStartDate(e.target.value)}
//                       className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <label 
//                       htmlFor="endDate" 
//                       className="block text-sm font-medium text-gray-700"
//                     >
//                       Expected End Date
//                     </label>
//                     <input
//                       type="date"
//                       id="endDate"
//                       name="endDate"
//                       value={endDate}
//                       onChange={(e) => setEndDate(e.target.value)}
//                       className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </div>
                
//                 <div className="pt-4 border-t border-gray-200">
//                   <div className="flex justify-end">
//                     <Link 
//                       href={`/students/${id}/view`}
//                       className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
//                     >
//                       Cancel
//                     </Link>
//                     <button
//                       type="submit"
//                       disabled={isSaving}
//                       className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 flex items-center"
//                     >
//                       {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                       {isSaving ? 'Saving...' : 'Save Changes'}
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
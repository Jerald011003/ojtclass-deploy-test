import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageParams = Promise<{ id: string }>;

export default async function StudentEditPage({
  params,
}: {
  params: PageParams;
}) {
  const { id } = await params;
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Get the professor user
  const profUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!profUser || profUser.role !== "professor") {
    redirect("/classrooms");
  }

  // Try to fetch real student data if available
  let student;
  try {
    const studentId = parseInt(id);
    
    if (!isNaN(studentId)) {
      student = await db.query.users.findFirst({
        where: eq(users.id, studentId),
      });
    }
  } catch (error) {
    console.error("Error fetching student:", error);
  }

  // Use mock data if no real data is available
  const mockStudents = {
    '1': { id: 1, name: 'John Doe', email: 'john@example.com', company: 'ABC Corp', progress: 65 },
    '2': { id: 2, name: 'Jane Smith', email: 'jane@example.com', company: 'XYZ Inc', progress: 42 },
    '3': { id: 3, name: 'Robert Johnson', email: 'robert@example.com', company: 'Tech Solutions', progress: 78 },
    '4': { id: 4, name: 'Emily Davis', email: 'emily@example.com', company: 'Digital Systems', progress: 23 },
    '5': { id: 5, name: 'Michael Wilson', email: 'michael@example.com', company: 'Innovate Ltd', progress: 91 },
  };

  // Get mock student data for display
  const mockStudentData = id in mockStudents 
    ? mockStudents[id as keyof typeof mockStudents] 
    : mockStudents['1'];
    
  // For a real implementation, we would split the name into first and last name
  const nameParts = mockStudentData.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/classrooms/prof/students/${id}/view`} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
          <p className="text-gray-500">
            Update information for {mockStudentData.name}
          </p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <form action={`/api/students/${id}/update`} method="POST" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label 
                  htmlFor="firstName" 
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  defaultValue={firstName}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="lastName" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  defaultValue={lastName}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={mockStudentData.email}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="company" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Company
                </label>
                <select
                  id="company"
                  name="company"
                  defaultValue={mockStudentData.company === "ABC Corp" ? "1" : 
                                mockStudentData.company === "XYZ Inc" ? "2" :
                                mockStudentData.company === "Tech Solutions" ? "3" :
                                mockStudentData.company === "Digital Systems" ? "4" :
                                mockStudentData.company === "Innovate Ltd" ? "5" : ""}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select Company --</option>
                  <option value="1">ABC Corp</option>
                  <option value="2">XYZ Inc</option>
                  <option value="3">Tech Solutions</option>
                  <option value="4">Digital Systems</option>
                  <option value="5">Innovate Ltd</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="startDate" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  defaultValue="2025-05-01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="endDate" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Expected End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  defaultValue="2025-08-31"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <Link 
                  href={`/classrooms/prof/students/${id}/view`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
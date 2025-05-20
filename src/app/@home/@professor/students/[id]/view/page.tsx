import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { users, studentClassrooms, classrooms } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, FileText, Clock, Calendar, Building } from "lucide-react";

// Mock data for student details display
const mockReports = [
  { id: 1, title: "Weekly Progress Report", date: "2025-05-12", status: "approved" },
  { id: 2, title: "Monthly Evaluation", date: "2025-05-01", status: "approved" },
  { id: 3, title: "Daily Activity Log", date: "2025-05-15", status: "pending" },
];

type PageParams = Promise<{ id: string }>;

export default async function StudentViewPage({
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/classrooms/prof/students" className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
          <p className="text-gray-500">
            View detailed OJT records for {mockStudentData.name}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Student profile */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium">Profile Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="mt-1">{mockStudentData.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{mockStudentData.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Company</h3>
                <p className="mt-1">{mockStudentData.company}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                <p className="mt-1">May 1, 2025</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Expected End Date</h3>
                <p className="mt-1">August 31, 2025</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Link 
                href={`/classrooms/prof/students/${id}/edit`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right column - OJT progress and reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-medium">OJT Progress</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Overall Completion</span>
                  <span className="text-sm font-medium text-gray-900">{mockStudentData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      mockStudentData.progress >= 70 ? 'bg-green-600' : 
                      mockStudentData.progress >= 40 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`} 
                    style={{ width: `${mockStudentData.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium">Hours Completed</h3>
                  </div>
                  <p className="text-2xl font-bold">{Math.floor(mockStudentData.progress * 5)}</p>
                  <p className="text-sm text-gray-500">of 500 required hours</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium">Reports Submitted</h3>
                  </div>
                  <p className="text-2xl font-bold">{mockReports.length}</p>
                  <p className="text-sm text-gray-500">reports for review</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Reports card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-medium">Reports & Documentation</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            report.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link href="#" className="text-blue-600 hover:text-blue-800">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from "react";

// Define report type
type ReportStatus = 'pending' | 'approved' | 'rejected';
type ReportType = 'daily' | 'weekly';

interface Report {
  id: number;
  type: ReportType;
  title: string;
  submittedBy: string;
  date: string;
  status: ReportStatus;
  content: string;
}

export default function ReportsClientPage() {
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Mock data for demonstration
  const reports: Report[] = [
    { 
      id: 1, 
      type: 'weekly', 
      title: 'Weekly Progress Report', 
      submittedBy: 'John Doe', 
      date: '2025-05-01', 
      status: 'pending',
      content: 'This week I focused on implementing the user authentication system and database integration. I learned about security best practices and how to properly hash passwords.'
    },
    { 
      id: 2, 
      type: 'daily', 
      title: 'Daily Activity Log', 
      submittedBy: 'Jane Smith', 
      date: '2025-05-02', 
      status: 'pending',
      content: 'Today I worked on frontend components using React and styled them with Tailwind CSS. I created reusable button and form components.'
    },
    { 
      id: 3, 
      type: 'weekly', 
      title: 'Weekly Progress Report', 
      submittedBy: 'Robert Johnson', 
      date: '2025-04-24', 
      status: 'approved',
      content: 'This week I completed the API integration and fixed several bugs in the checkout process. I also participated in code reviews with senior developers.'
    },
    { 
      id: 4, 
      type: 'daily', 
      title: 'Daily Activity Log', 
      submittedBy: 'Emily Davis', 
      date: '2025-05-05', 
      status: 'rejected',
      content: 'Today I worked on debugging the payment gateway integration and documenting the API endpoints for the team.'
    },
    { 
      id: 5, 
      type: 'weekly', 
      title: 'Weekly Progress Report', 
      submittedBy: 'Michael Wilson', 
      date: '2025-05-08', 
      status: 'pending',
      content: 'This week I focused on optimizing database queries and implementing caching to improve application performance. I also attended a workshop on scalable architecture.'
    },
  ];

  // Function to open modal with selected report
  const openReportModal = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Functions to approve or reject reports
  const approveReport = (reportId: number) => {
    console.log(`Approving report ${reportId}`);
    // Here you would implement the actual approval logic
    // For example: mutation.mutateAsync({ reportId, status: 'approved' })
  };

  const rejectReport = (reportId: number) => {
    console.log(`Rejecting report ${reportId}`);
    // Here you would implement the actual rejection logic
    // For example: mutation.mutateAsync({ reportId, status: 'rejected' })
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports Management</h1>
        <p className="text-gray-500">
          Review and approve student daily and weekly reports
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium">Submitted Reports</h2>
            <div className="mt-3 sm:mt-0 flex space-x-2">
              <div className="relative">
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue="all"
                >
                  <option value="all">All Reports</option>
                  <option value="daily">Daily Reports</option>
                  <option value="weekly">Weekly Reports</option>
                </select>
              </div>
              <div className="relative">
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue="all"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
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
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.type === 'daily' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {report.type === 'daily' ? 'Daily' : 'Weekly'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{report.submittedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{report.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => openReportModal(report)}
                    >
                      View
                    </button>
                    {report.status === 'pending' && (
                      <>
                        <button 
                          className="text-green-600 hover:text-green-900 mr-3"
                          onClick={() => approveReport(report.id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => rejectReport(report.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing 1 to 5 of 5 reports
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Report Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
            <p className="text-2xl font-semibold mt-1">5</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Approved Reports</h3>
            <p className="text-2xl font-semibold mt-1">1</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
            <p className="text-2xl font-semibold mt-1">3</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Rejected Reports</h3>
            <p className="text-2xl font-semibold mt-1">1</p>
          </div>
        </div>
      </div>
      
      {/* Report View Modal */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Report Details</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setIsModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Student</h4>
                <p className="text-sm">{selectedReport.submittedBy}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Report Type</h4>
                <p className="text-sm">{selectedReport.type === 'daily' ? 'Daily Report' : 'Weekly Report'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Submission Date</h4>
                <p className="text-sm">{selectedReport.date}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Content</h4>
                <div className="mt-2 p-4 bg-gray-50 rounded-md text-sm">
                  <p>{selectedReport.content}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Attachments</h4>
                <div className="mt-2 flex items-center space-x-2">
                  <a href="#" className="text-blue-600 hover:text-blue-900 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {selectedReport.type === 'daily' ? 'daily_log.pdf' : 'weekly_report.pdf'}
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Feedback</h4>
                <textarea 
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  rows={3}
                  placeholder="Enter feedback for the student..."
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              {selectedReport.status === 'pending' && (
                <>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                    onClick={() => {
                      rejectReport(selectedReport.id);
                      setIsModalOpen(false);
                    }}
                  >
                    Reject
                  </button>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                    onClick={() => {
                      approveReport(selectedReport.id);
                      setIsModalOpen(false);
                    }}
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
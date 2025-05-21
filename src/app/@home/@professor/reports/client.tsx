'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Filter, Search, Calendar, FileText, User, Tag, ExternalLink } from "lucide-react";
import Link from "next/link";

// Define report types
type ReportStatus = 'pending' | 'approved' | 'rejected' | 'submitted';
type ReportType = 'daily' | 'weekly' | 'monthly';

interface Report {
  id: number;
  type: ReportType;
  title: string;
  description: string;
  submittedBy?: string;
  studentId: number;
  student?: {
    id: number;
    name: string;
    email: string;
  };
  classroomId: number;
  classroom?: {
    id: number;
    name: string;
  };
  status: ReportStatus;
  submissionUrl?: string | null;
  feedback?: string | null;
  createdAt: string;
  updatedAt: string;
  dueDate?: string | null;
}

interface FeedbackInput {
  feedback: string;
  reportId: number;
}

export default function ReportsClientPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  // Authentication check
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  // Fetch reports
  useEffect(() => {
    async function fetchReports() {
      if (!userId) return;

      try {
        setIsLoading(true);
        
        // First fetch classrooms to get the professor's classes
        const classroomsResponse = await fetch('/api/prof/companies/classrooms', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!classroomsResponse.ok) {
          throw new Error('Failed to fetch classrooms');
        }
        
        const classroomsData = await classroomsResponse.json();
        const professorClassrooms = classroomsData.classrooms || [];
        
        // If no classrooms, no reports to fetch
        if (professorClassrooms.length === 0) {
          setReports([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch all reports for professor's classrooms
        let allReports: Report[] = [];
        
        for (const classroom of professorClassrooms) {
          try {
            const reportsResponse = await fetch(`/api/prof/reports?classroomId=${classroom.id}`);
            
            if (reportsResponse.ok) {
              const classroomReports = await reportsResponse.json();
              
              // Transform the reports data to add classroom info
              const transformedReports = classroomReports.map((report: Report) => ({
                ...report,
                classroom: { id: classroom.id, name: classroom.name }
              }));
              
              allReports = [...allReports, ...transformedReports];
            }
          } catch (error) {
            console.error(`Error fetching reports for classroom ${classroom.id}:`, error);
          }
        }
        
        // Fetch student details for each report
        for (let i = 0; i < allReports.length; i++) {
                  const report = allReports[i];
                  if (!report) continue;
                  
                  try {
                    const studentResponse = await fetch(`/api/prof/students/${report.studentId}`);
                    
                    if (studentResponse.ok) {
                      const studentData = await studentResponse.json();
                      report.student = {
                        id: studentData.id,
                        name: studentData.name || `Student ${studentData.id}`,
                        email: studentData.email
                      };
                      report.submittedBy = studentData.name || studentData.email;
                    }
                  } catch (error) {
                    console.error(`Error fetching student data for report ${report.id}:`, error);
                  }
                }
        
        // Sort by newest first
        allReports.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setReports(allReports);
        
        // Calculate stats
        const stats = {
          total: allReports.length,
          approved: allReports.filter(r => r.status === 'approved').length,
          pending: allReports.filter(r => r.status === 'pending' || r.status === 'submitted').length,
          rejected: allReports.filter(r => r.status === 'rejected').length
        };
        
        setStats(stats);
        setError(null);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError('Failed to fetch reports. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchReports();
    }
  }, [userId]);

  // Function to open modal with selected report
  const openReportModal = (report: Report) => {
    setSelectedReport(report);
    setFeedback(report.feedback || "");
    setIsModalOpen(true);
  };

  // Functions to approve or reject reports
  const approveReport = async (reportId: number) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/prof/reports/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId,
          status: 'approved',
          feedback
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve report');
      }
      
      // Update report in state
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { ...report, status: 'approved', feedback } 
            : report
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        approved: prev.approved + 1,
        pending: prev.pending - 1
      }));
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Failed to approve report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectReport = async (reportId: number) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/prof/reports/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId,
          status: 'rejected',
          feedback
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject report');
      }
      
      // Update report in state
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { ...report, status: 'rejected', feedback } 
            : report
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        rejected: prev.rejected + 1,
        pending: prev.pending - 1
      }));
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('Failed to reject report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter reports based on current filters
  const filteredReports = reports.filter(report => {
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      (report.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       report.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       report.classroom?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesStatus && matchesSearch;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isLoaded || (isLoading && !error)) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports Management</h1>
        <p className="text-gray-500">
          Review and approve student daily and weekly reports
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
            <h2 className="text-lg font-medium">Submitted Reports</h2>
            <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Reports</option>
                  <option value="daily">Daily Reports</option>
                  <option value="weekly">Weekly Reports</option>
                  <option value="monthly">Monthly Reports</option>
                </select>
              </div>
              <div className="relative">
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
              <p className="text-gray-500">
                {reports.length > 0 
                  ? "Try changing your filters to see more results" 
                  : "There are no reports submitted yet"}
              </p>
            </div>
          ) : (
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
                    Classroom
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
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.type === 'daily' ? 'bg-blue-100 text-blue-800' : 
                        report.type === 'weekly' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.type === 'daily' ? 'Daily' : 
                         report.type === 'weekly' ? 'Weekly' : 'Monthly'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{report.submittedBy || `Student ${report.studentId}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{report.classroom?.name || `Classroom ${report.classroomId}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(report.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        report.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
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
                      {(report.status === 'pending' || report.status === 'submitted') && (
                        <>
                          <button 
                            className="text-green-600 hover:text-green-900 mr-3"
                            onClick={() => openReportModal(report)}
                          >
                            Review
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredReports.length} of {reports.length} reports
            </div>
            <div className="flex space-x-2">
              <button 
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                disabled={true}
              >
                Previous
              </button>
              <button 
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                disabled={true}
              >
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
            <p className="text-2xl font-semibold mt-1">{stats.total}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Approved Reports</h3>
            <p className="text-2xl font-semibold mt-1">{stats.approved}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
            <p className="text-2xl font-semibold mt-1">{stats.pending}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Rejected Reports</h3>
            <p className="text-2xl font-semibold mt-1">{stats.rejected}</p>
          </div>
        </div>
      </div>
      
      {/* Report View Modal */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{selectedReport.title}</h3>
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
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-50 p-3 rounded-md flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="block text-xs text-gray-500">Student</span>
                    <span className="font-medium">{selectedReport.student?.name || `Student ${selectedReport.studentId}`}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="block text-xs text-gray-500">Report Type</span>
                    <span className="font-medium capitalize">{selectedReport.type}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="block text-xs text-gray-500">Submission Date</span>
                    <span className="font-medium">{formatDate(selectedReport.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Content</h4>
                <div className="p-4 bg-gray-50 rounded-md text-sm">
                  <p>{selectedReport.description || "No description provided"}</p>
                </div>
              </div>
              
              {selectedReport.submissionUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                  <div className="mt-2 flex items-center space-x-2">
                    <a 
                      href={selectedReport.submissionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-900 text-sm flex items-center p-2 bg-blue-50 rounded-md"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Submission
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
                <textarea 
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  rows={4}
                  placeholder="Enter feedback for the student..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={selectedReport.status === 'approved' || selectedReport.status === 'rejected'}
                />
                {(selectedReport.status === 'approved' || selectedReport.status === 'rejected') && (
                  <p className="mt-2 text-sm text-gray-500">
                    This report has already been {selectedReport.status}.
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
              
              {(selectedReport.status === 'pending' || selectedReport.status === 'submitted') && (
                <>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 flex items-center gap-2 disabled:opacity-70"
                    onClick={() => rejectReport(selectedReport.id)}
                    disabled={isSubmitting || !feedback.trim()}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    {isSubmitting ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button 
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center gap-2 disabled:opacity-70"
                    onClick={() => approveReport(selectedReport.id)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {isSubmitting ? 'Approving...' : 'Approve'}
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
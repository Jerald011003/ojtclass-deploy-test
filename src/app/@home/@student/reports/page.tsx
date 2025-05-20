'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, FileText, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Report {
  createdAt: string | number | Date;
  id: number;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  description: string;
  submissionUrl?: string;
}

interface Classroom {
  id: number;
  name: string;
  description: string;
  professorId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Check authentication
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch student's classrooms
  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchClassrooms() {
      setLoading(true);
      try {
        const response = await fetch('/api/student/classrooms');

        if (!response.ok) {
          throw new Error('Failed to fetch classrooms');
        }

        const data = await response.json();
        console.log("Fetched classrooms data:", data);

        setClassrooms(data);
        if (data.length > 0) {
          setSelectedClassroom(Number(data[0].id));
        }
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClassrooms();
  }, [isSignedIn]);

  useEffect(() => {
    if (!selectedClassroom) return;

    async function fetchReports() {
      setLoading(true);
      try {
        const response = await fetch(`/api/student/reports?classroomId=${selectedClassroom}`);

        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }

        const data = await response.json();
        console.log("Fetched reports data:", data);

        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [selectedClassroom]);

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!submissionUrl) {
      setMessage({ type: 'error', content: 'Please enter a submission URL' });
      return;
    }

    setSubmitting(true);
    try {
      // Todo: Once API is ready, uncomment this endpoint
      /*
      const response = await fetch('/api/classrooms/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReportId,
          submissionUrl,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', content: 'Report submitted successfully!' });
        
        // Update the reports list
        setReports(reports.map(report => 
          report.id === selectedReportId 
            ? { ...report, status: 'submitted', submissionUrl } 
            : report
        ));
      } else {
        setMessage({ type: 'error', content: data.message || 'Failed to submit report' });
      }
      */

      // Mock successful submission for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', content: 'Report submitted successfully!' });

      // Update the reports list
      setReports(reports.map(report =>
        report.id === selectedReportId
          ? { ...report, status: 'submitted', submissionUrl }
          : report
      ));

      // Close the modal
      setShowSubmitModal(false);
      setSubmissionUrl('');
      setSelectedReportId(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      setMessage({ type: 'error', content: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  // Open the submission modal
  const openSubmitModal = (reportId: number) => {
    setSelectedReportId(reportId);
    setShowSubmitModal(true);
  };

  // Close the submission modal
  const closeSubmitModal = () => {
    setShowSubmitModal(false);
    setSubmissionUrl('');
    setSelectedReportId(null);
  };

  // Get status icon
  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'submitted':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-gray-500">
          View your submitted required reports
        </p>
      </div>

      {message.content && (
        <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {message.content}
        </div>
      )}

      {loading ? (
        <div className="h-60 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {classrooms.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">You are not assigned to any company yet</p>
            </div>
          ) : (
            <>
              {selectedClassroom && (
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Required Reports</h2>

                    {classrooms.length > 1 && (
                      <select
                        value={selectedClassroom}
                        onChange={(e) => setSelectedClassroom(e.target.value ? Number(e.target.value) : null)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        {classrooms.map((classroom) => (
                          <option key={classroom.id} value={classroom.id}>
                            {classroom.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {reports.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Report
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Due Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submitted Date
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
                              {/* Report title cell */}
                              <td className="px-6 py-4">
                                <div className="flex items-start">
                                  <FileText className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{report.title}</div>
                                    {report.description && <div className="text-xs text-gray-500 mt-1">{report.description}</div>}
                                  </div>
                                </div>
                              </td>

                              {/* Due Date cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {report.dueDate ? new Date(report.dueDate).toLocaleDateString() : "No due date"}
                                </div>
                              </td>

                              {/* Submitted Date cell - NEW */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {report.status !== 'pending' ? (
                                  <div className={`text-sm ${report.dueDate && report.createdAt &&
                                      new Date(report.createdAt) > new Date(report.dueDate)
                                      ? 'text-red-500 font-medium'
                                      : 'text-green-600'
                                    }`}>
                                    {new Date(report.createdAt).toLocaleDateString()}
                                    {report.dueDate && report.createdAt &&
                                      new Date(report.createdAt) > new Date(report.dueDate) &&
                                      " (Late)"}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-400">Not submitted</div>
                                )}
                              </td>

                              {/* Status cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getStatusIcon(report.status)}
                                  <span className={`ml-1.5 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${report.status === 'submitted' || report.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      report.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {report.status === 'pending' ? (
                                  <button
                                    onClick={() => openSubmitModal(report.id)}
                                    className="text-blue-600 hover:text-blue-900 flex items-center"
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Submit
                                  </button>
                                ) : (
                                  <a
                                    href={report.submissionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    View File
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reports required at this time</p>
                    </div>
                  )}
                </div>
              )}


            </>
          )}
        </>
      )}

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Submit Report</h3>

            <form onSubmit={submitReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submission URL (Google Drive, OneDrive, etc.)
                </label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your document to a cloud service and paste the link here
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeSubmitModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
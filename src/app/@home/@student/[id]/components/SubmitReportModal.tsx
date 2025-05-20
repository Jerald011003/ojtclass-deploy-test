'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Clock } from 'lucide-react';
import { FileUpload } from "~/components/FileUpload";

interface ReportTemplate {
  id: number;
  title: string;
  description: string | null;
  type: 'daily' | 'weekly' | 'activity_log';
  dueDate: string | null;
}

interface SubmitReportModalProps {
  classroomId: number;
  tasks: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitReportModal({
  classroomId,
  tasks,
  onClose,
  onSuccess,
}: SubmitReportModalProps) {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedTask) {
      setError('Please select a task to report on');
      return;
    }

    console.log("Submitting with fileUrl:", fileUrl);

    setIsSubmitting(true);
    setError(null);

    try {
      const content = (e.currentTarget.elements.namedItem('content') as HTMLTextAreaElement).value;

      const submissionData = {
        taskId: selectedTask.toString(),
        classroomId: classroomId.toString(),
        content,
        submissionUrl: fileUrl
      };

      console.log("Submission data:", submissionData);

      const response = await fetch('/api/student/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Failed to submit report');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleUploadComplete = (url: string) => {
    console.log("RAW URL FROM UPLOADTHING:", url);

    // Store this URL directly - it's the correct format
    setFileUrl(url);
    setIsUploading(false);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-semibold text-gray-800">Submit Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content - scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          {error && (
            <div className="p-4 mb-5 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Report Selection - Same as before */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Report Type
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-gray-50">
                  <div className="p-3 space-y-2">
                    {Array.isArray(tasks) && tasks.length > 0 ? (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedTask === task.id
                            ? 'border-blue-500 bg-white shadow-sm'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                            }`}
                          onClick={() => setSelectedTask(task.id)}
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{task.title}</h3>
                              {task.description && (
                                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                              )}
                              {task.dueDate && (
                                <div className="flex items-center mt-2 text-xs text-blue-600">
                                  <Clock className="w-3.5 h-3.5 mr-1" />
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">No tasks available</p>
                      </div>
                    )}
                  </div>
                </div>
                <input type="hidden" name="taskId" value={selectedTask || ''} />
              </div>

              {/* Report Content */}
              <div className="pt-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Report Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={5}
                  required
                  className="block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm"
                  placeholder="Describe your tasks, progress, and learnings..."
                ></textarea>
              </div>

              {/* Replace the old file upload with UploadThing component */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment (Optional)
                </label>

                {fileUrl ? (
                  <div className="mt-2">
                    <div className="flex items-center justify-between p-3 border rounded-md bg-blue-50">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-500 mr-2" />
                        <span className="text-sm text-blue-700">
                          File uploaded successfully
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setFileUrl(null);
                            setIsUploading(false);
                          }}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <FileUpload
                      endpoint="documentUploader"
                      onUploadBegin={() => {
                        console.log("Upload starting");
                        setIsUploading(true);
                      }}
                      onUploadComplete={handleUploadComplete}
                      onUploadError={(error) => {
                        console.error("Upload error:", error);
                        setError(`Upload failed: ${error.message}`);
                        setIsUploading(false);
                      }}
                      className={isUploading ? "opacity-50 pointer-events-none" : ""}
                    />
                    {/* {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                          <p className="mt-2 text-sm font-medium text-blue-600">Uploading...</p>
                        </div>
                      </div>
                    )} */}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
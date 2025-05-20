'use client';

import { Video, Bell, FileText, Clock, Upload, CheckCircle, XCircle } from 'lucide-react';

export default function MainContent() {
  // Mock data for demonstration
  const ojtData = {
    completedHours: 286,
    requiredHours: 500,
    pendingReports: 2,
    recentReports: [
      { id: 1, type: 'Daily', date: 'May 1, 2025', status: 'pending', title: 'Day 45 Report' },
      { id: 2, type: 'Weekly', date: 'April 30, 2025', status: 'approved', title: 'Week 9 Summary' },
      { id: 3, type: 'Daily', date: 'April 30, 2025', status: 'rejected', title: 'Day 44 Report' },
    ]
  };

  return (
    <main className="flex-1 p-8">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Web Development</h1>
        <p className="text-gray-600 mt-1">CPE 2A (SY2024-2025-2)</p>
      </div>

      {/* Hours Progress Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">OJT Hours Progress</h2>
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Completed Hours</span>
            <span className="font-semibold text-gray-900">{ojtData.completedHours}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Required Hours</span>
            <span className="font-semibold text-gray-900">{ojtData.requiredHours}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(ojtData.completedHours / ojtData.requiredHours) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {ojtData.requiredHours - ojtData.completedHours} hours remaining
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Google Meet Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Video className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Google Meet</h2>
          </div>
          <p className="text-gray-600 mb-4">Join your virtual classroom session</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Join Meeting
          </button>
        </div>

        {/* Announcements Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-gray-600 text-sm">No new announcements</p>
            </div>
          </div>
        </div>

        {/* Daily Report Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Daily Report</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-center items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                <Upload className="w-5 h-5" />
                <span>Upload Daily Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Weekly Report Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Weekly Report</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-center items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                <Upload className="w-5 h-5" />
                <span>Upload Weekly Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-gray-900">
                  <span className="font-medium">Assignment posted:</span> Critique paper
                </p>
                <p className="text-sm text-gray-600">by Reynaldo L. De Asis on April 2</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-gray-900">
                  <span className="font-medium">File uploaded:</span> software critique.pdf
                </p>
                <p className="text-sm text-gray-600">March 12</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reports */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
            {ojtData.pendingReports > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                {ojtData.pendingReports} Pending
              </span>
            )}
          </div>
          <div className="space-y-4">
            {ojtData.recentReports.map(report => (
              <div 
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-gray-900 font-medium">{report.title}</p>
                    <p className="text-sm text-gray-600">
                      {report.type} Report • {report.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {report.status === 'approved' && (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      Approved
                    </span>
                  )}
                  {report.status === 'rejected' && (
                    <span className="flex items-center text-red-600">
                      <XCircle className="w-5 h-5 mr-1" />
                      Rejected
                    </span>
                  )}
                  {report.status === 'pending' && (
                    <span className="flex items-center text-yellow-600">
                      <Clock className="w-5 h-5 mr-1" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h2>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-gray-600 text-center">Woohoo, no work due soon!</p>
          </div>
        </div>
      </section>
    </main>
  );
}
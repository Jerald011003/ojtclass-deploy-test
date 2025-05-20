'use client';

import { MessageSquare } from 'lucide-react';
import { useState } from 'react';

export function DashboardContent() {
  const [announcement, setAnnouncement] = useState('');

  // Mock data for demonstration
  const stats = [
    { name: 'Total Students', value: '124' },
    { name: 'Active OJT Placements', value: '98' },
    { name: 'Pending Reports', value: '12' },
    { name: 'System Notifications', value: '5' },
  ];

  const handlePost = () => {
    if (announcement.trim()) {
      // TODO: Implement announcement posting
      console.log('Posting announcement:', announcement);
      setAnnouncement('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500">
          Overview of the OJT tracking system
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="mt-1">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Announcement Box */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-6 w-6 text-gray-400" />
          <input
            type="text"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Announce something to your class"
            className="w-full bg-gray-50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handlePost}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Post
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Recent Activities</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-sm text-gray-600">New student registered for OJT</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-sm text-gray-600">Weekly report submitted by John Doe</p>
              <p className="text-xs text-gray-400">5 hours ago</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <p className="text-sm text-gray-600">System maintenance scheduled</p>
              <p className="text-xs text-gray-400">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

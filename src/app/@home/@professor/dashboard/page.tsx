'use client';

import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Building2, Users, FileText, Clock } from 'lucide-react';
import Link from 'next/link';
import { api } from "~/trpc/react";

interface Activity {
  id: number;
  type: 'student' | 'professor' | 'company' | 'system';
  action: string;
  userId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardStats {
  stats: {
    totalStudents: number;
    totalProfessors: number;
    totalCompanies: number;
  };
  recentActivities: Activity[];
  systemMetrics: {
    systemLoad: number;
    storageUsage: number;
    lastBackup: Date;
  } | null;
}

export default function ProfDashboard(): ReactElement {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();

  // Use TRPC query for dashboard stats
  const { data: stats, isLoading } = api.professor.getDashboardStats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push('/sign-in');
      return;
    }
  }, [userId, isLoaded, router]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back! Here's an overview of your OJT management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Students</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{Number(stats?.stats.totalStudents) || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Total registered</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Companies</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{Number(stats?.stats.totalCompanies) || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Partner organizations</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600 mt-1">Pending review</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Hours</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600 mt-1">Total tracked</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{activity.action}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/classrooms/prof/companies/create"
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Classroom
              </Link>
              <Link
                href="/classrooms/prof/students"
                className="block w-full text-center border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
              >
                Manage Students
              </Link>
              <Link
                href="/classrooms/prof/reports"
                className="block w-full text-center border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
              >
                View Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
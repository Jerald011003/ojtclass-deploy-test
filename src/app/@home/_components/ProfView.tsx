'use client';

import { Users, Building, GraduationCap, Settings, PieChart, UserPlus, BookOpen, Shield, Plus } from 'lucide-react';
import { api } from "~/trpc/react";
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AddUserModal, AddCompanyModal } from './modals/ProfModals';
import Link from 'next/link';

export default function ProfView() {
  const { user } = useUser();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingCompany, setIsAddingCompany] = useState(false);

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = api.professor.getDashboardStats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutations
  const addUserMutation = api.professor.addUser.useMutation({
    onSuccess: () => {
      setIsAddingUser(false);
      // Refetch dashboard data
      utils.professor.getDashboardStats.invalidate();
    },
  });

  const addCompanyMutation = api.professor.addCompany.useMutation({
    onSuccess: () => {
      setIsAddingCompany(false);
      // Refetch dashboard data
      utils.professor.getDashboardStats.invalidate();
    },
  });

  const updateSystemMetricsMutation = api.professor.updateSystemMetrics.useMutation({
    onSuccess: () => {
      utils.professor.getDashboardStats.invalidate();
    },
  });

  const utils = api.useUtils();

  // Handle user creation
  const handleAddUser = async (data: { email: string; role: 'student' | 'professor' }) => {
    try {
      await addUserMutation.mutateAsync({
        email: data.email,
        role: data.role,
        clerkId: 'temp_' + Date.now(), // In a real app, this would be handled by Clerk webhook
      });
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  // Handle company creation
  const handleAddCompany = async (data: { name: string; address: string }) => {
    try {
      await addCompanyMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to add company:', error);
    }
  };

  const stats = {
    totalStudents: Number(dashboardData?.stats?.totalStudents ?? 0),
    totalCompanies: Number(dashboardData?.stats?.totalCompanies ?? 0),
    totalProfessors: Number(dashboardData?.stats?.totalProfessors ?? 0),
  };

  const systemMetrics = dashboardData?.systemMetrics ?? {
    systemLoad: 0,
    storageUsage: 0,
    lastBackup: new Date(),
  };

  const recentActivities = dashboardData?.recentActivities ?? [];

  interface Activity {
    id: number;
    type: 'student' | 'professor' | 'company' | 'system';
    action: string;
    userId: number | null;
    createdAt: Date;
    updatedAt: Date;
  }

  return (
    <main className="flex-1 p-8">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Professor Dashboard</h1>
        <p className="text-gray-600 mt-1">System Overview and Management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Students</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
          <p className="text-sm text-gray-600 mt-1">Total registered</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Building className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Companies</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCompanies}</p>
          <p className="text-sm text-gray-600 mt-1">Partner organizations</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Professors</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalProfessors}</p>
          <p className="text-sm text-gray-600 mt-1">OJT supervisors</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Active OJTs</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
          <p className="text-sm text-gray-600 mt-1">Current internships</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={() => setIsAddingUser(true)}
                className="w-full flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors justify-center"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add New User</span>
              </button>
              <button 
                onClick={() => setIsAddingCompany(true)}
                className="w-full flex items-center space-x-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors justify-center"
              >
                <Building className="w-5 h-5" />
                <span>Register Company</span>
              </button>
              <Link
                href="/classrooms/prof/companies/create"
                className="w-full flex items-center space-x-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors justify-center"
              >
                <Plus className="w-5 h-5" />
                <span>Create Classroom</span>
              </Link>
              <button 
                onClick={() => updateSystemMetricsMutation.mutate({
                  systemLoad: Math.floor(Math.random() * 100),
                  storageUsage: Math.floor(Math.random() * 100),
                  lastBackup: new Date()
                })}
                className="w-full flex items-center space-x-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors justify-center"
              >
                <Shield className="w-5 h-5" />
                <span>Update System Status</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <PieChart className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">System Load</span>
                  <span className="text-green-600 font-medium">Normal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Storage Usage</span>
                  <span className="text-blue-600 font-medium">45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Backup</span>
                  <span className="text-gray-900">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center and Right Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Classrooms */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Company Classrooms</h2>
                </div>
                <Link
                  href="/classrooms/prof/companies"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities
                  .filter((activity: Activity) => activity.type === 'company')
                  .slice(0, 3)
                  .map((activity: Activity, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{activity.action}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                {recentActivities.filter((activity: Activity) => activity.type === 'company').length === 0 && (
                  <div className="text-center py-8">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Classrooms</h3>
                    <p className="text-gray-500 mb-6">Create your first company classroom to get started.</p>
                    <Link
                      href="/classrooms/prof/companies/create"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Create Classroom
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity: Activity, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{activity.action}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent activities</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAddingUser && (
        <AddUserModal
          isOpen={isAddingUser}
          onClose={() => setIsAddingUser(false)}
          onSubmit={handleAddUser}
        />
      )}
      {isAddingCompany && (
        <AddCompanyModal
          isOpen={isAddingCompany}
          onClose={() => setIsAddingCompany(false)}
          onSubmit={handleAddCompany}
        />
      )}
    </main>
  );
}

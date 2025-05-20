import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-gray-500">
          Configure the OJT tracking system
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">User Management</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="defaultRole" className="block text-sm font-medium text-gray-700">Default User Role</label>
              <select
                id="defaultRole"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                defaultValue="student"
              >
                <option value="student">Student</option>
                <option value="admin">Admin/Professor</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="userApproval" className="block text-sm font-medium text-gray-700">User Registration</label>
              <select
                id="userApproval"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                defaultValue="automatic"
              >
                <option value="automatic">Automatic Approval</option>
                <option value="manual">Manual Approval</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="allowSelfRegistration"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                defaultChecked
              />
              <label htmlFor="allowSelfRegistration" className="ml-2 block text-sm text-gray-900">
                Allow Self Registration
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">System Maintenance</h2>
          <div className="space-y-4">
            <button className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 flex justify-between items-center">
              <span>Backup Database</span>
              <span className="text-xs text-gray-500">Last backup: 2 days ago</span>
            </button>
            
            <button className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 flex justify-between items-center">
              <span>Clear Cache</span>
              <span className="text-xs text-gray-500">Last cleared: 5 days ago</span>
            </button>
            
            <button className="w-full bg-red-50 text-red-800 px-4 py-2 rounded-md hover:bg-red-100 flex justify-between items-center">
              <span>Reset System</span>
              <span className="text-xs text-red-500">Use with caution</span>
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">System Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Last Updated</span>
              <span className="text-sm font-medium">May 10, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Environment</span>
              <span className="text-sm font-medium">Production</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Database Status</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
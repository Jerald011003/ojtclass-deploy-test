'use client';

import { Calendar, LineChart, FileText, User, Users, Settings, Building2, GraduationCap, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from 'react';

const roleBasedNavItems = {
  student: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    // { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: LineChart, label: 'Progress', href: '/progress' }, 
    { icon: FileText, label: 'Reports', href: '/reports' }, 
    { icon: User, label: 'Profile', href: '/profile' }, 
  ],
  professor: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Building2, label: 'Company Classrooms', href: '/companies' }, 
    { icon: Users, label: 'Students', href: '/students' }, 
    { icon: FileText, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' }, 
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Building2, label: 'Company Classrooms', href: '/companies' }, 
    { icon: Users, label: 'Students', href: '/students' }, 
    { icon: FileText, label: 'Reports', href: '/reports' },
    // { icon: Settings, label: 'Settings', href: '/settings' },
  ],
};

export default function Sidebar() {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const pathname = typeof window !== 'undefined' ? usePathname() : '/';
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return <div className="w-64 min-h-full bg-white border-r border-gray-200 flex flex-col">
    </div>;
  }

  const role = user?.unsafeMetadata?.role as string || 'student';
  
  if (!mounted) {
    return (
      <div className="w-64 min-h-full bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Enrolled</h2>
        </div>
        <div className="flex-1 p-4">
          {/* Loading state */}
        </div>
      </div>
    );
  }
  return (
    <div className="w-64 min-h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Enrolled</h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {roleBasedNavItems[role as keyof typeof roleBasedNavItems].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
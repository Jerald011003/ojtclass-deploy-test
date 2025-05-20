'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Trash2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  action: string;
  type: 'student' | 'professor' | 'company' | 'system';
  createdAt: Date;
  read?: boolean;
}

interface NotificationDropdownProps {
  activities: Activity[];
  onClearAll?: () => void;
  onDeleteNotification?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export default function NotificationDropdown({ 
  activities: initialActivities,
  onClearAll,
  onDeleteNotification,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  useEffect(() => {
    // Count unread notifications
    const unread = activities.filter(activity => !activity.read).length;
    setUnreadCount(unread);
  }, [activities]);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'student':
        return 'border-blue-500';
      case 'professor':
        return 'border-green-500';
      case 'company':
        return 'border-yellow-500';
      default:
        return 'border-gray-500';
    }
  };

  const handleClearAll = async () => {
    if (onClearAll) {
      await onClearAll();
    }
    setActivities([]);
    setUnreadCount(0);
    setIsOpen(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteNotification) {
      await onDeleteNotification(id);
    }
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      await onMarkAsRead(id);
    }
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, read: true } : activity
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    if (onMarkAllAsRead) {
      await onMarkAllAsRead();
    }
    setActivities(prev => 
      prev.map(activity => ({ ...activity, read: true }))
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full relative"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            </div>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-gray-600 hover:text-green-600"
                >
                  Mark all read
                </button>
              )}
              {activities.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-gray-600 hover:text-red-600"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`border-l-4 ${getActivityColor(activity.type)} pl-4 py-3 hover:bg-gray-50 relative group ${
                    activity.read ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="pr-8">
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!activity.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(activity.id, e)}
                        className="p-1 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(activity.id, e)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
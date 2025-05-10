
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Upload, Settings } from 'lucide-react';

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  color: string;
}

export const QuickActions: React.FC = () => {
  const actions: ActionItem[] = [
    {
      icon: <Plus size={20} />,
      label: 'New Post',
      to: '/dashboard/blog/new',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    },
    {
      icon: <Edit size={20} />,
      label: 'Edit Template',
      to: '/dashboard/templates',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    },
    {
      icon: <Upload size={20} />,
      label: 'Upload File',
      to: '/dashboard/templates/upload',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      to: '/dashboard/settings',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    }
  ];

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 p-6">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.to}
            className="flex items-center p-4 rounded-md hover:bg-muted transition-colors"
          >
            <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center mr-3`}>
              {action.icon}
            </div>
            <span className="font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

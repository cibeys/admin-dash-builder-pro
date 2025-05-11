
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { idID } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  date: string;
}

interface ActivityData {
  id: string;
  activity_type: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  [key: string]: any;
}

interface RecentActivityProps {
  activities: ActivityData[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities = [] }) => {
  const formatActivityData = (activity: ActivityData): ActivityItem => {
    // Format the activity type to be more readable
    let action = 'performed';
    let target = activity.activity_type;
    
    if (activity.activity_type.includes('create')) {
      action = 'created';
      target = activity.activity_type.replace('create_', '').replace('_', ' ');
    } else if (activity.activity_type.includes('update')) {
      action = 'updated';
      target = activity.activity_type.replace('update_', '').replace('_', ' ');
    } else if (activity.activity_type.includes('delete')) {
      action = 'deleted';
      target = activity.activity_type.replace('delete_', '').replace('_', ' ');
    } else if (activity.activity_type.includes('view')) {
      action = 'viewed';
      target = activity.activity_type.replace('view_', '').replace('_', ' ');
    } else if (activity.activity_type.includes('download')) {
      action = 'downloaded';
      target = activity.activity_type.replace('download_', '').replace('_', ' ');
    } else if (activity.activity_type.includes('login')) {
      action = 'logged in';
      target = '';
    } else if (activity.activity_type.includes('click')) {
      action = 'clicked';
      target = activity.activity_type.replace('click_', '').replace('_', ' ');
    }
    
    // Format the date
    const date = new Date(activity.created_at);
    const relativeTime = formatDistanceToNow(date, { addSuffix: true, locale: idID });
    
    return {
      id: activity.id,
      user: {
        name: activity.profiles?.full_name || activity.profiles?.username || 'User',
        avatar: activity.profiles?.avatar_url
      },
      action,
      target,
      date: relativeTime
    };
  };
  
  const formattedActivities = activities.map(formatActivityData);
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      user: { name: 'John Doe', avatar: 'https://github.com/shadcn.png' },
      action: 'created',
      target: 'Blog Post: Getting Started with React',
      date: '10 min ago'
    },
    {
      id: '2',
      user: { name: 'Jane Smith' },
      action: 'updated',
      target: 'Template: Portfolio Pro',
      date: '1 hour ago'
    },
    {
      id: '3',
      user: { name: 'Robert Johnson' },
      action: 'deleted',
      target: 'User: michael@example.com',
      date: '3 hours ago'
    },
    {
      id: '4',
      user: { name: 'Lisa Brown' },
      action: 'published',
      target: 'Blog Post: CSS Grid Mastery',
      date: '5 hours ago'
    },
    {
      id: '5',
      user: { name: 'Admin' },
      action: 'updated',
      target: 'System Settings',
      date: '1 day ago'
    }
  ];
  
  // Use real activities if available, otherwise use mock data
  const displayActivities = formattedActivities.length > 0 ? formattedActivities : mockActivities;

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      
      <div className="divide-y divide-border">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-muted/50">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                {activity.user.avatar ? (
                  <img
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-semibold">
                    {activity.user.name.charAt(0)}
                  </span>
                )}
              </div>
              
              <div>
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span> {' '}
                  <span className="text-muted-foreground">{activity.action}</span> {' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border text-center">
        <button className="text-sm text-primary hover:underline">
          View All Activity
        </button>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Activity, FileText, Download, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { id as idID } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const RecentActivity: React.FC = () => {
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const { data: activityData, error: activityError } = await supabase
          .from('user_activities')
          .select(`
            id, 
            user_id, 
            activity_type, 
            created_at, 
            profiles:user_id (username, full_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (activityError) {
          console.error('Error fetching activities:', activityError);
          toast({
            title: 'Peringatan',
            description: 'Gagal memuat data aktivitas',
            variant: 'default'
          });
        } else {
          setActivities(activityData || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();

    // Set up a subscription for real-time updates
    const subscription = supabase
      .channel('public:user_activities')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'user_activities' 
      }, payload => {
        console.log('New activity received:', payload);
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'download':
        return <Download className="h-6 w-6 text-green-500" />;
      case 'message':
        return <MessageSquare className="h-6 w-6 text-purple-500" />;
      default:
        return <Activity className="h-6 w-6 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    const userName = activity.profiles?.full_name || activity.profiles?.username || 'User';
    
    switch (activity.activity_type) {
      case 'post':
        return `${userName} membuat post blog baru`;
      case 'download':
        return `${userName} mengunduh template`;
      case 'message':
        return `${userName} mengirim pesan baru`;
      default:
        return `${userName} melakukan aktivitas`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-secondary animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-secondary rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-secondary rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Belum ada aktivitas</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="rounded-full bg-background p-2 border">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{getActivityText(activity)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { 
                      addSuffix: true,
                      locale: idID
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

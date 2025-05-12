
import React, { useState, useEffect } from 'react';
import { Users, FileText, Download, Activity, Filter } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { RecentActivity } from './components/RecentActivity';
import { QuickActions } from './components/QuickActions';
import { UserGrowthChart } from './components/Charts/UserGrowthChart';
import { BlogPostsChart } from './components/Charts/BlogPostsChart';
import { TrafficSourcesChart } from './components/Charts/TrafficSourcesChart';
import { AdminChatPanel } from './components/AdminChatPanel';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardStats {
  userCount: number;
  postCount: number;
  downloadCount: number;
  activeUsers: number;
  userGrowth: number;
  postGrowth: number;
  downloadGrowth: number;
  activeSessionsGrowth: number;
}

const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    postCount: 0,
    downloadCount: 0,
    activeUsers: 0,
    userGrowth: 0,
    postGrowth: 0,
    downloadGrowth: 0,
    activeSessionsGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>('week');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch users count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch blog posts count
        const { count: postCount, error: postError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true });

        // Fetch downloads count
        const { count: downloadCount, error: downloadError } = await supabase
          .from('download_history')
          .select('*', { count: 'exact', head: true });

        // Fetch active users (approximation based on distinct user_ids in user_activities)
        const { data: activeUsers, error: activeError } = await supabase
          .from('user_activities')
          .select('user_id')
          .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .limit(1000);

        if (userError || postError || downloadError || activeError) {
          console.error('Error fetching stats:', { userError, postError, downloadError, activeError });
          throw new Error('Failed to fetch dashboard stats');
        }

        // Get unique user IDs for active users
        const uniqueActiveUsers = activeUsers ? [...new Set(activeUsers.map(a => a.user_id))].length : 0;

        setStats({
          userCount: userCount || 0,
          postCount: postCount || 0,
          downloadCount: downloadCount || 0,
          activeUsers: uniqueActiveUsers,
          userGrowth: 12, // Placeholder growth percentages (would be calculated from historical data)
          postGrowth: 8,
          downloadGrowth: 24,
          activeSessionsGrowth: -5
        });

        // Fetch user activities
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
          // Don't throw here, just show a toast and continue with empty activities
          toast({
            title: 'Warning',
            description: 'Failed to load activity data',
            variant: 'warning'
          });
        } else {
          setActivities(activityData || []);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Set up a subscription for real-time updates to user_activities
    const subscription = supabase
      .channel('public:user_activities')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'user_activities' 
      }, payload => {
        console.log('New activity received:', payload);
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [toast]);

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    // In a real application, you would refetch data based on this filter
    toast({
      title: 'Filter Changed',
      description: `Data showing for last ${value}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="flex items-center gap-2">
          <Select defaultValue={timeFilter} onValueChange={handleTimeFilterChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time Period</SelectLabel>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4 mr-1" /> 
            More Filters
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          value={isLoading ? "Loading..." : stats.userCount.toString()} 
          icon={<Users className="text-primary" size={24} />}
          trend={{ value: stats.userGrowth, positive: stats.userGrowth > 0 }}
        />
        <StatsCard 
          title="Blog Posts" 
          value={isLoading ? "Loading..." : stats.postCount.toString()} 
          icon={<FileText className="text-primary" size={24} />}
          trend={{ value: stats.postGrowth, positive: stats.postGrowth > 0 }}
        />
        <StatsCard 
          title="Total Downloads" 
          value={isLoading ? "Loading..." : stats.downloadCount.toString()} 
          icon={<Download className="text-primary" size={24} />}
          trend={{ value: stats.downloadGrowth, positive: stats.downloadGrowth > 0 }}
        />
        <StatsCard 
          title="Active Sessions" 
          value={isLoading ? "Loading..." : stats.activeUsers.toString()} 
          icon={<Activity className="text-primary" size={24} />}
          trend={{ value: stats.activeSessionsGrowth, positive: stats.activeSessionsGrowth > 0 }}
        />
      </div>
      
      {/* Admin Chat Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Chat</CardTitle>
          <CardDescription>Manage user conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminChatPanel />
        </CardContent>
      </Card>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <UserGrowthChart />
        </div>
        <div>
          <TrafficSourcesChart />
        </div>
      </div>
      
      {/* Blog Posts Chart */}
      <div>
        <BlogPostsChart />
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={activities} />
        <QuickActions />
      </div>
    </div>
  );
};

export default DashboardPage;

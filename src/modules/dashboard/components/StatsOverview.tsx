
import React, { useEffect, useState } from 'react';
import { Users, FileText, MessageSquare, Download } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const StatsOverview: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    userCount: 0,
    postCount: 0,
    downloadCount: 0,
    chatCount: 0,
    userGrowth: 0,
    postGrowth: 0,
    downloadGrowth: 0,
    chatGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
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
          
        // Fetch chat conversations count
        const { count: chatCount, error: chatError } = await supabase
          .from('ai_chat_conversations')
          .select('*', { count: 'exact', head: true });

        if (userError || postError || downloadError || chatError) {
          console.error('Error fetching stats:', { userError, postError, downloadError, chatError });
          throw new Error('Gagal mengambil data statistik dashboard');
        }

        setStats({
          userCount: userCount || 0,
          postCount: postCount || 0,
          downloadCount: downloadCount || 0,
          chatCount: chatCount || 0,
          userGrowth: 12, // Persentase pertumbuhan placeholder (akan dihitung dari data historis)
          postGrowth: 8,
          downloadGrowth: 24,
          chatGrowth: 15
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat data statistik dashboard',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [toast]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard 
        title="Total Pengguna" 
        value={isLoading ? "Memuat..." : stats.userCount.toString()} 
        icon={<Users className="text-primary" size={24} />}
        trend={{ value: stats.userGrowth, positive: stats.userGrowth > 0 }}
      />
      <StatsCard 
        title="Blog Posts" 
        value={isLoading ? "Memuat..." : stats.postCount.toString()} 
        icon={<FileText className="text-primary" size={24} />}
        trend={{ value: stats.postGrowth, positive: stats.postGrowth > 0 }}
      />
      <StatsCard 
        title="Total Unduhan" 
        value={isLoading ? "Memuat..." : stats.downloadCount.toString()} 
        icon={<Download className="text-primary" size={24} />}
        trend={{ value: stats.downloadGrowth, positive: stats.downloadGrowth > 0 }}
      />
      <StatsCard 
        title="Chat Admin" 
        value={isLoading ? "Memuat..." : stats.chatCount.toString()} 
        icon={<MessageSquare className="text-primary" size={24} />}
        trend={{ value: stats.chatGrowth, positive: stats.chatGrowth > 0 }}
      />
    </div>
  );
};


import React from 'react';
import { Users, FileText, Download, Activity } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { RecentActivity } from './components/RecentActivity';
import { QuickActions } from './components/QuickActions';
import { UserGrowthChart } from './components/Charts/UserGrowthChart';
import { BlogPostsChart } from './components/Charts/BlogPostsChart';
import { TrafficSourcesChart } from './components/Charts/TrafficSourcesChart';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          value="2,532" 
          icon={<Users className="text-primary" size={24} />}
          trend={{ value: 12, positive: true }}
        />
        <StatsCard 
          title="Blog Posts" 
          value="152" 
          icon={<FileText className="text-primary" size={24} />}
          trend={{ value: 8, positive: true }}
        />
        <StatsCard 
          title="Total Downloads" 
          value="10,842" 
          icon={<Download className="text-primary" size={24} />}
          trend={{ value: 24, positive: true }}
        />
        <StatsCard 
          title="Active Sessions" 
          value="439" 
          icon={<Activity className="text-primary" size={24} />}
          trend={{ value: 5, positive: false }}
        />
      </div>
      
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
        <RecentActivity activities={[]} />
        <QuickActions />
      </div>
    </div>
  );
};

export default DashboardPage;

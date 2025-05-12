
import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { StatsOverview } from './components/StatsOverview';
import { RecentActivity } from './components/RecentActivity';
import { QuickActions } from './components/QuickActions';
import { UserGrowthChart } from './components/Charts/UserGrowthChart';
import { BlogPostsChart } from './components/Charts/BlogPostsChart';
import { TrafficSourcesChart } from './components/Charts/TrafficSourcesChart';
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

const DashboardPage: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<string>('week');

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="flex items-center gap-2">
          <Select defaultValue={timeFilter} onValueChange={handleTimeFilterChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Pilih periode waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Periode Waktu</SelectLabel>
                <SelectItem value="day">24 Jam Terakhir</SelectItem>
                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                <SelectItem value="month">30 Hari Terakhir</SelectItem>
                <SelectItem value="year">Tahun Terakhir</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4 mr-1" /> 
            Filter Lainnya
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <StatsOverview />
      
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
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
};

export default DashboardPage;

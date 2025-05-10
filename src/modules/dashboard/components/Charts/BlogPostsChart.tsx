
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Sample data for blog posts chart
const data = [
  { name: 'Jan', published: 4, draft: 2 },
  { name: 'Feb', published: 3, draft: 1 },
  { name: 'Mar', published: 6, draft: 3 },
  { name: 'Apr', published: 8, draft: 2 },
  { name: 'May', published: 7, draft: 4 },
  { name: 'Jun', published: 5, draft: 1 },
  { name: 'Jul', published: 9, draft: 2 },
  { name: 'Aug', published: 11, draft: 3 },
  { name: 'Sep', published: 8, draft: 5 },
  { name: 'Oct', published: 12, draft: 4 },
  { name: 'Nov', published: 10, draft: 3 },
  { name: 'Dec', published: 15, draft: 6 },
];

export const BlogPostsChart: React.FC = () => {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Blog Post Trends</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="currentColor" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="currentColor"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card)', 
              borderColor: 'var(--border)', 
              borderRadius: 'var(--radius)',
              color: 'var(--card-foreground)'
            }} 
          />
          <Legend />
          <Bar dataKey="published" fill="#8884d8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="draft" fill="#82ca9d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

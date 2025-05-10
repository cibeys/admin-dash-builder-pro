
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
} from 'recharts';
import { useTheme } from '@/common/context/ThemeContext';

// Sample data - in real app, this would come from API
const data = [
  { name: 'Jan', users: 400, sessions: 240 },
  { name: 'Feb', users: 300, sessions: 138 },
  { name: 'Mar', users: 200, sessions: 980 },
  { name: 'Apr', users: 278, sessions: 390 },
  { name: 'May', users: 189, sessions: 480 },
  { name: 'Jun', users: 239, sessions: 380 },
  { name: 'Jul', users: 349, sessions: 430 },
  { name: 'Aug', users: 420, sessions: 510 },
  { name: 'Sep', users: 490, sessions: 580 },
  { name: 'Oct', users: 500, sessions: 600 },
  { name: 'Nov', users: 650, sessions: 700 },
  { name: 'Dec', users: 800, sessions: 850 },
];

export const UserGrowthChart: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">User Growth</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
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
          <Line
            type="monotone"
            dataKey="users"
            stroke={theme.primaryColor}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="sessions" 
            stroke="#82ca9d" 
            strokeWidth={2} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

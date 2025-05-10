
import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
}) => {
  return (
    <div className={cn(
      "bg-card text-card-foreground rounded-lg p-6 shadow-sm",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          
          {trend && (
            <p className={cn(
              "text-sm font-medium flex items-center mt-2",
              trend.positive ? "text-green-500" : "text-red-500"
            )}>
              <span className="mr-1">
                {trend.positive ? '↑' : '↓'}
              </span>
              {trend.value}%
            </p>
          )}
        </div>
        
        <div className="p-3 bg-primary/10 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

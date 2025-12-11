
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface UserDistributionChartProps {
  users: User[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

const categoryDisplay: Record<string, string> = {
  'user': 'Users',
  'listing-property': 'Property Owners',
  'real-estate-agent': 'Real Estate Agents',
  'interior-designer': 'Interior Designers',
};

export function UserDistributionChart({ users }: UserDistributionChartProps) {
  const data = React.useMemo(() => {
    const categoryCounts = users.reduce((acc, user) => {
      const category = categoryDisplay[user.category] || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [users]);
  
  const totalUsers = users.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalUsers) * 100).toFixed(1);
      return (
        <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-md shadow-lg">
          <p className="font-semibold">{`${data.name}: ${data.value}`}</p>
          <p className="text-sm text-muted-foreground">{`(${percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={5}
            // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
           <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '12px' }}
          />
           <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-foreground">
             {totalUsers}
           </text>
           <text x="50%" y="50%" dy="1.5em" textAnchor="middle" className="text-sm fill-muted-foreground">
             Total Users
           </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

    

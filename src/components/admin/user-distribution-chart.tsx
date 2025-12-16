
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { User } from '@/types';

interface UserDistributionChartProps {
  users: User[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

const categoryDisplay: Record<string, string> = {
  'user': 'Buyers',
  'listing-property': 'Owners',
  'real-estate-agent': 'Agents',
  'interior-designer': 'Designers',
  'vendor': 'Vendors',
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
        <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-md shadow-lg text-sm">
          <p className="font-semibold">{`${data.name}: ${data.value}`}</p>
          <p className="text-xs text-muted-foreground">{`(${percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
           <Tooltip content={<CustomTooltip />} />
           <Legend 
            iconType="circle"
            iconSize={8}
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: '12px', lineHeight: '2' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


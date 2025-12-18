
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { User } from '@/types';

interface UserStatusChartProps {
  users: User[];
}

const COLORS = {
    Verified: '#3b82f6', // blue-500
    Active: '#22c55e',   // green-500
    Blocked: '#ef4444',  // red-500
};

export function UserStatusChart({ users }: UserStatusChartProps) {
  const data = React.useMemo(() => {
    let verified = 0;
    let active = 0;
    let blocked = 0;

    users.forEach(user => {
      if (user.isBlocked) {
        blocked++;
      } else if (user.isVerified && user.verifiedUntil && user.verifiedUntil.toDate() > new Date()) {
        verified++;
        active++; // Verified users are also active
      } else {
        active++;
      }
    });

    return [
      { name: 'Verified', value: verified },
      { name: 'Active', value: active - verified }, // Subtract verified to avoid double counting in the "Active" slice
      { name: 'Blocked', value: blocked },
    ].filter(item => item.value > 0);
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
    if (percent === 0) return null;
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
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
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

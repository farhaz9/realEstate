
'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Property } from '@/types';
import { format, subMonths } from 'date-fns';

interface PropertyListingsChartProps {
  properties: Property[];
}

export function PropertyListingsChart({ properties }: PropertyListingsChartProps) {
  const data = React.useMemo(() => {
    const now = new Date();
    const monthlyData: Record<string, { month: string; listings: number }> = {};

    // Initialize the last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthKey = format(month, 'MMM yyyy');
      monthlyData[monthKey] = { month: format(month, 'MMM'), listings: 0 };
    }

    // Populate with property data
    properties.forEach(property => {
      if (property.dateListed?.toDate) {
        const listingDate = property.dateListed.toDate();
        const monthKey = format(listingDate, 'MMM yyyy');
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].listings += 1;
        }
      }
    });

    return Object.values(monthlyData);
  }, [properties]);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="listings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

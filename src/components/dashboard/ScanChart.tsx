'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DailyScan } from '@/types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ScanChartProps {
  data: DailyScan[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
      <p className="text-text-secondary text-xs mb-1">
        {format(parseISO(label), 'EEEE dd MMM', { locale: fr })}
      </p>
      <p className="text-text-primary font-bold font-mono text-lg">
        {payload[0].value} scans
      </p>
    </div>
  );
}

export function ScanChart({ data }: ScanChartProps) {
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const avg = total / data.length;
  const last = data[data.length - 1]?.count ?? 0;
  const prev = data[data.length - 2]?.count ?? 0;
  const change = last - prev;
  const isUp = change >= 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-text-primary font-semibold">Activité des scans</h3>
          <p className="text-text-secondary text-xs mt-0.5">7 derniers jours</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-mono text-text-primary">{total}</p>
          <span className={`flex items-center gap-0.5 text-xs font-mono ${isUp ? 'text-primary' : 'text-danger'}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isUp ? '+' : ''}{change} aujourd'hui
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A36" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => format(parseISO(d), 'dd MMM', { locale: fr })}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#scanGradient)"
              dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#22C55E', stroke: '#0F0F12', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

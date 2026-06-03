import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
import { formatNumber } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  change?: { value: string; isPositive: boolean };
  limit?: number;
  className?: string;
}

export function StatsCard({ title, value, suffix = '', icon, change, limit, className = '' }: StatsCardProps) {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <Card className={`${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {change && (
          <span
            className={`flex items-center gap-0.5 text-xs font-mono ${
              change.isPositive ? 'text-primary' : 'text-danger'
            }`}
          >
            {change.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change.value}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-bold font-mono text-text-primary">
          {displayValue}
          {suffix && <span className="text-sm text-text-secondary font-sans ml-1">{suffix}</span>}
        </span>
        <span className="text-xs text-text-secondary">{title}</span>
        {limit !== undefined && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>{value}/{limit}</span>
              <span>{Math.round((value / limit) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-deep overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min((value / limit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

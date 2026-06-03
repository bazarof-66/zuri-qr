import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toLocaleString('fr-FR');
}

export function formatDate(date: string): string {
  return format(new Date(date), 'dd MMM yyyy', { locale: fr });
}

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatPercentChange(current: number, previous: number): { value: string; isPositive: boolean } {
  if (previous === 0) return { value: '+100%', isPositive: true };
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return { value: `${sign}${change.toFixed(1)}%`, isPositive: change >= 0 };
}

export function getPlanLimit(plan: string): number {
  return plan === 'pro' ? Infinity : 5;
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

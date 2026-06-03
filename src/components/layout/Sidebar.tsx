'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, QrCode, BarChart3, Settings, Link2, Zap, X
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { LogOut } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mes QR Codes', href: '/qrcodes', icon: QrCode },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Studio', href: '/studio', icon: Link2 },
  { label: 'Paramètres', href: '/settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const displayName = profile?.displayName || profile?.email?.split('@')[0] || 'Utilisateur';
  const initials = getInitials(displayName);
  const userPlan = profile?.plan ?? 'free';

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64
          bg-deep border-r border-border
          flex flex-col
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap size={18} className="text-deep" />
            </div>
            <span className="font-bold text-lg text-text-primary tracking-tight">ZURI QR</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-transparent'
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold font-mono">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-text-primary text-sm font-medium truncate">{displayName}</div>
              <Badge variant={userPlan === 'pro' ? 'success' : 'warning'}>
                {userPlan === 'pro' ? 'PRO' : 'GRATUIT'}
              </Badge>
            </div>
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10 transition-all w-full"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}

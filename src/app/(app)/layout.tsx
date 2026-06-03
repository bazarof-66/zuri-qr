'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Menu, Bell, Plus } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useAuth();
  const displayName = profile?.displayName || profile?.email?.split('@')[0] || 'Utilisateur';

  return (
    <AuthGuard>
    <div className="flex h-screen overflow-hidden bg-deep">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-deep flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-text-secondary hover:text-text-primary transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-text-primary font-semibold text-sm hidden sm:block">
                Bonjour, {displayName.split(' ')[0]}
              </h1>
              <p className="text-text-muted text-xs font-mono">
                {format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/studio">
              <Button size="sm" className="gap-1.5">
                <Plus size={16} />
                <span className="hidden sm:inline">Nouveau QR</span>
              </Button>
            </Link>
            <ThemeToggle />
            <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}

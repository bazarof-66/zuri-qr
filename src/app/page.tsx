'use client';

import Link from 'next/link';
import { Zap, Menu, X, QrCode, BarChart3, ScanLine, Sparkles, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-deep text-text-primary">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-deep/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap size={18} className="text-deep" />
            </div>
            <span className="font-bold text-lg tracking-tight">ZURI QR</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-text-secondary hover:text-text-primary text-sm transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="text-text-secondary hover:text-text-primary text-sm transition-colors">Tarifs</a>
            <Link href="/login" className="text-text-secondary hover:text-text-primary text-sm transition-colors">Se connecter</Link>
          </nav>

          <div className="hidden md:block">
            <Link href="/dashboard">
              <Button size="sm">Commencer gratuitement</Button>
            </Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-text-secondary">
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-border p-4 space-y-3 bg-deep">
            <a href="#features" className="block text-text-secondary py-2">Fonctionnalités</a>
            <a href="#pricing" className="block text-text-secondary py-2">Tarifs</a>
            <Link href="/login" className="block text-text-secondary py-2">Se connecter</Link>
            <Link href="/dashboard">
              <Button className="w-full">Commencer gratuitement</Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <Sparkles size={14} />
              QR Codes Dynamiques
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              QR Codes qui
              <span className="text-primary"> s&apos;adaptent</span>.
              <br />
              <span className="text-secondary">Dynamiques</span>. Intelligents.
            </h1>
            <p className="text-text-secondary text-lg mb-8 max-w-lg">
              Générez, modifiez et trackez vos QR codes en temps réel — sans jamais les recréer.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  <Zap size={18} />
                  Générer mon QR code
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg">Voir la démo</Button>
              </a>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="w-72 h-72 rounded-2xl bg-surface border border-border flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10" />
              <div className="w-48 h-48 bg-deep rounded-xl flex items-center justify-center relative z-10">
                <QrCode size={96} className="text-primary opacity-80" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center z-10">
                <ScanLine size={32} className="text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '12 847', label: 'QR codes actifs' },
              { value: '99.9%', label: 'Uptime' },
              { value: '< 50ms', label: 'Redirection' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl lg:text-3xl font-bold font-mono text-primary">{stat.value}</p>
                <p className="text-text-secondary text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">
          Tout ce dont tu as besoin
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: ScanLine, title: 'QR Dynamiques', desc: 'Changez la destination sans refaire le QR. Mettez à jour en un clic.' },
            { icon: Sparkles, title: 'Brand-Match IA', desc: 'Notre IA analyse votre marque et génère la palette parfaite pour vos QR.' },
            { icon: BarChart3, title: 'Analytics Temps Réel', desc: 'Pays, appareil, heure de chaque scan — tout est tracké.' },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} hover className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 lg:px-8 py-20 border-t border-border">
        <h2 className="text-2xl font-bold text-center mb-4">Des tarifs simples</h2>
        <p className="text-text-secondary text-center mb-12">Commence gratuitement, upgrade quand tu veux</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card>
            <h3 className="font-semibold text-text-primary mb-2">Gratuit</h3>
            <p className="text-3xl font-bold font-mono text-text-primary mb-4">0 FCFA</p>
            <ul className="space-y-2 text-sm text-text-secondary mb-6">
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> 5 QR codes max</li>
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> Redirection dynamique</li>
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> Analytics 7 jours</li>
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> Export PNG</li>
            </ul>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Commencer</Button>
            </Link>
          </Card>

          <Card className="border-secondary/30 bg-secondary/5 relative">
            <div className="absolute -top-3 right-4">
              <Badge variant="warning">POPULAIRE</Badge>
            </div>
            <h3 className="font-semibold text-text-primary mb-2">PRO</h3>
            <p className="text-3xl font-bold font-mono text-text-primary mb-4">
              2 900 FCFA
              <span className="text-sm text-text-secondary font-sans font-normal">/mois</span>
            </p>
            <ul className="space-y-2 text-sm text-text-secondary mb-6">
              <li className="flex items-center gap-2"><span className="text-secondary">✓</span> QR codes illimités</li>
              <li className="flex items-center gap-2"><span className="text-secondary">✓</span> Brand-Match IA</li>
              <li className="flex items-center gap-2"><span className="text-secondary">✓</span> Analytics 90 jours</li>
              <li className="flex items-center gap-2"><span className="text-secondary">✓</span> Export SVG + PDF</li>
            </ul>
            <Link href="/dashboard">
              <Button variant="secondary" className="w-full gap-1.5">
                <Zap size={16} />
                Choisir PRO
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap size={12} className="text-deep" />
            </div>
            <span className="font-bold text-sm">ZURI QR</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <a href="#" className="hover:text-text-primary">Confidentialité</a>
            <a href="#" className="hover:text-text-primary">CGU</a>
            <a href="#" className="hover:text-text-primary">Contact</a>
          </div>
          <p className="text-xs text-text-muted">© 2026 Zuri QR</p>
        </div>
      </footer>
    </div>
  );
}

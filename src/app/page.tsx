'use client';

import Link from 'next/link';
import { Zap, Menu, X, QrCode, BarChart3, ScanLine, Sparkles, ChevronRight, Globe, Check } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A', color: '#E5E2E1' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50" style={{ background: '#0A0A0ACC', borderBottom: '1px solid #262626', backdropFilter: 'blur(20px)' }}>
        <div className="mx-auto flex items-center justify-between h-16 px-4 lg:px-16" style={{ maxWidth: 1280 }}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#D9FF00' }}>
              <Zap size={18} style={{ color: '#0A0A0A' }} />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>ZURI QR</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm transition-colors" style={{ color: '#A1A1A1' }} onMouseOver={e => e.currentTarget.style.color = '#E5E2E1'} onMouseOut={e => e.currentTarget.style.color = '#A1A1A1'}>Fonctionnalités</a>
            <a href="#pricing" className="text-sm transition-colors" style={{ color: '#A1A1A1' }} onMouseOver={e => e.currentTarget.style.color = '#E5E2E1'} onMouseOut={e => e.currentTarget.style.color = '#A1A1A1'}>Tarifs</a>
            <Link href="/login" className="text-sm transition-colors" style={{ color: '#A1A1A1' }} onMouseOver={e => e.currentTarget.style.color = '#E5E2E1'} onMouseOut={e => e.currentTarget.style.color = '#A1A1A1'}>Se connecter</Link>
          </nav>

          <div className="hidden md:block">
            <Link href="/dashboard">
              <button className="h-9 px-4 text-sm font-semibold transition-all" style={{ background: '#D9FF00', color: '#0A0A0A', border: 'none' }}>
                Commencer gratuitement
              </button>
            </Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden" style={{ color: '#A1A1A1' }}>
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden p-4 space-y-3" style={{ borderTop: '1px solid #262626', background: '#0A0A0A' }}>
            <a href="#features" className="block py-2 text-sm" style={{ color: '#A1A1A1' }}>Fonctionnalités</a>
            <a href="#pricing" className="block py-2 text-sm" style={{ color: '#A1A1A1' }}>Tarifs</a>
            <Link href="/login" className="block py-2 text-sm" style={{ color: '#A1A1A1' }}>Se connecter</Link>
            <Link href="/dashboard">
              <button className="w-full h-10 text-sm font-semibold" style={{ background: '#D9FF00', color: '#0A0A0A', border: 'none' }}>Commencer gratuitement</button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto px-4 lg:px-16 py-20 lg:py-32" style={{ maxWidth: 1280 }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold mb-6" style={{ background: 'rgba(217, 255, 0, 0.08)', border: '1px solid rgba(217, 255, 0, 0.2)', color: '#D9FF00', fontFamily: 'Geist, monospace', letterSpacing: '0.1em' }}>
              <Sparkles size={14} />
              QR CODES DYNAMIQUES
            </div>
            <h1 className="font-bold leading-tight mb-4" style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 64, letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              QR Codes qui<br />
              <span style={{ color: '#D9FF00' }}>s'adaptent</span>.
              <br />
              <span style={{ color: '#FFD700' }}>Dynamiques</span>. Intelligents.
            </h1>
            <p className="text-lg mb-8" style={{ color: '#A1A1A1', fontFamily: "'Hanken Grotesk', sans-serif", lineHeight: '1.6', maxWidth: 480 }}>
              Générez, modifiez et trackez vos QR codes en temps réel — sans jamais les recréer.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <button className="h-12 px-6 text-sm font-semibold flex items-center gap-2 transition-all" style={{ background: '#D9FF00', color: '#0A0A0A', border: 'none' }}>
                  <Zap size={18} />
                  Générer mon QR code
                </button>
              </Link>
              <a href="#features">
                <button className="h-12 px-6 text-sm font-semibold transition-all" style={{ background: 'transparent', color: '#E5E2E1', border: '1px solid #262626' }}>
                  Voir la démo
                </button>
              </a>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative flex items-center justify-center" style={{ width: 300, height: 300, background: '#161616', border: '1px solid #262626' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(217,255,0,0.08), rgba(255,215,0,0.08))' }} />
              <div className="flex items-center justify-center z-10" style={{ width: 200, height: 200, background: '#0A0A0A' }}>
                <QrCode size={80} style={{ color: '#D9FF00', opacity: 0.8 }} />
              </div>
              <div className="absolute -bottom-3 -right-3 flex items-center justify-center z-10" style={{ width: 80, height: 80, background: 'rgba(217,255,0,0.1)', border: '1px solid rgba(217,255,0,0.2)' }}>
                <ScanLine size={28} style={{ color: '#D9FF00' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid #262626', borderBottom: '1px solid #262626' }}>
        <div className="mx-auto px-4 lg:px-16 py-10" style={{ maxWidth: 1280 }}>
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '12 847', label: 'QR codes actifs' },
              { value: '99.9%', label: 'Uptime' },
              { value: '< 50ms', label: 'Redirection' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl lg:text-3xl font-bold font-mono" style={{ color: '#D9FF00', fontFamily: 'Geist, monospace' }}>{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: '#8F9378' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto px-4 lg:px-16 py-20" style={{ maxWidth: 1280 }}>
        <h2 className="text-center mb-12 font-semibold" style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 40, letterSpacing: '-0.01em' }}>
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
              <div key={feature.title} className="p-6 transition-all" style={{ background: '#161616', border: '1px solid #262626' }}
                onMouseOver={e => e.currentTarget.style.background = '#1C1C1C'}
                onMouseOut={e => e.currentTarget.style.background = '#161616'}
              >
                <div className="w-12 h-12 flex items-center justify-center mb-4" style={{ background: 'rgba(217,255,0,0.1)' }}>
                  <Icon size={24} style={{ color: '#D9FF00' }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#E5E2E1', fontFamily: "'Hanken Grotesk', sans-serif" }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: '#A1A1A1' }}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto px-4 lg:px-16 py-20" style={{ maxWidth: 1280, borderTop: '1px solid #262626' }}>
        <h2 className="text-center mb-4 font-semibold" style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 40, letterSpacing: '-0.01em' }}>
          Des tarifs simples
        </h2>
        <p className="text-center mb-12" style={{ color: '#A1A1A1', fontFamily: "'Hanken Grotesk', sans-serif" }}>Commence gratuitement, upgrade quand tu veux</p>
        <div className="grid md:grid-cols-2 gap-6 mx-auto" style={{ maxWidth: 640 }}>
          {/* Free */}
          <div className="p-8" style={{ background: '#161616', border: '1px solid #262626' }}>
            <h3 className="font-semibold mb-2" style={{ color: '#E5E2E1', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 24 }}>Gratuit</h3>
            <p className="mb-4 font-bold font-mono" style={{ fontSize: 36, fontFamily: 'Geist, monospace', color: '#E5E2E1' }}>
              0 FCFA
              <span className="text-sm font-sans font-normal" style={{ color: '#A1A1A1' }}>/mois</span>
            </p>
            <ul className="space-y-3 text-sm mb-8" style={{ color: '#C5C9AC' }}>
              <li className="flex items-center gap-2"><Check size={14} style={{ color: '#D9FF00' }} /> 5 QR codes max</li>
              <li className="flex items-center gap-2"><Check size={14} style={{ color: '#D9FF00' }} /> Redirection dynamique</li>
              <li className="flex items-center gap-2"><Check size={14} style={{ color: '#D9FF00' }} /> Analytics 7 jours</li>
              <li className="flex items-center gap-2"><Check size={14} style={{ color: '#D9FF00' }} /> Export PNG</li>
            </ul>
            <Link href="/dashboard">
              <button className="w-full h-11 text-sm font-semibold transition-all" style={{ background: '#1C1C1C', color: '#E5E2E1', border: '1px solid #262626' }}
                onMouseOver={e => e.currentTarget.style.background = '#2A2A2A'}
                onMouseOut={e => e.currentTarget.style.background = '#1C1C1C'}
              >
                Commencer
              </button>
            </Link>
          </div>

          {/* PRO */}
          <div className="p-8 relative" style={{ background: 'rgba(217,255,0,0.04)', border: '1px solid rgba(217,255,0,0.3)' }}>
            <div className="absolute -top-3 right-4 px-3 py-1 text-xs font-semibold" style={{ fontFamily: 'Geist, monospace', letterSpacing: '0.1em', background: '#D9FF00', color: '#0A0A0A' }}>
              POPULAIRE
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#E5E2E1', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 24 }}>PRO</h3>
            <p className="mb-4 font-bold font-mono" style={{ fontSize: 36, fontFamily: 'Geist, monospace', color: '#D9FF00' }}>
              2 900 FCFA
              <span className="text-sm font-sans font-normal" style={{ color: '#A1A1A1' }}>/mois</span>
            </p>
            <ul className="space-y-3 text-sm mb-8" style={{ color: '#C5C9AC' }}>
              <li className="flex items-center gap-2"><Check size={14} style={{ color: '#FFD700' }} /> QR codes illimités</li>
              <li className="flex items-center gap-2"><Check size={14} style={{ color: '#FFD700' }} /> Brand-Match IA</li>
              <li className="flex items-center gap-2"><Check size={14} style={{ color: '#FFD700' }} /> Analytics 90 jours</li>
              <li className="flex items-center gap-2"><Check size={14} style={{ color: '#FFD700' }} /> Export SVG + PDF</li>
              <li className="flex items-center gap-2"><Check size={14} style={{ color: '#FFD700' }} /> Priorité support</li>
            </ul>
            <Link href="/dashboard">
              <button className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all" style={{ background: '#D9FF00', color: '#0A0A0A', border: 'none', boxShadow: '0 0 20px rgba(217,255,0,0.15)' }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(217,255,0,0.3)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(217,255,0,0.15)'}
              >
                <Zap size={16} />
                Choisir PRO
              </button>
            </Link>
          </div>
        </div>

        {/* Enterprise note */}
        <p className="text-center mt-8 text-sm" style={{ color: '#8F9378', fontFamily: 'Geist, monospace', letterSpacing: '0.05em' }}>
          BESOIN DE PLUS ? CONTACTEZ-NOUS POUR UNE OFFRE PERSONNALISÉE
        </p>
      </section>

      {/* CTA Section */}
      <section className="mx-auto px-4 lg:px-16 py-20 text-center" style={{ maxWidth: 1280, borderTop: '1px solid #262626' }}>
        <h2 className="font-bold mb-4" style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 40, letterSpacing: '-0.01em' }}>
          Prêt à <span style={{ color: '#D9FF00' }}>digitaliser</span> vos QR codes ?
        </h2>
        <p className="mb-8" style={{ color: '#A1A1A1', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 18 }}>
          Rejoignez les entreprises qui font confiance à Zuri QR.
        </p>
        <Link href="/dashboard">
          <button className="h-12 px-8 text-sm font-semibold transition-all" style={{ background: '#D9FF00', color: '#0A0A0A', border: 'none' }}>
            Commencer gratuitement → 
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 lg:px-16" style={{ borderTop: '1px solid #262626', maxWidth: 1280, margin: '0 auto' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 flex items-center justify-center" style={{ background: '#D9FF00' }}>
              <Zap size={12} style={{ color: '#0A0A0A' }} />
            </div>
            <span className="font-bold text-sm" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>ZURI QR</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: '#A1A1A1' }}>
            <a href="#" className="hover:underline">Confidentialité</a>
            <a href="#" className="hover:underline">CGU</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
          <p className="text-xs" style={{ color: '#8F9378' }}>© 2026 Zuri QR</p>
        </div>
      </footer>
    </div>
  );
}

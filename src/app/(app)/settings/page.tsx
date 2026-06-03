'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { User, Shield, CreditCard, Bell, Zap } from 'lucide-react';

const settingsSections = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'billing', label: 'Plan & Facturation', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const { profile } = useAuth();
  const displayName = profile?.displayName || profile?.email?.split('@')[0] || 'Utilisateur';
  const userEmail = profile?.email ?? '';
  const userPlan = profile?.plan ?? 'free';
  const [name, setName] = useState(displayName);
  const [brand, setBrand] = useState('FlowMart');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Paramètres</h2>
        <p className="text-text-secondary text-sm">Gère ton compte et tes préférences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 !p-2">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'profile' && (
            <Card>
              <h3 className="text-text-primary font-semibold mb-4">Profil</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xl font-bold font-mono">
                    AK
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">{displayName}</p>
                    <p className="text-text-secondary text-sm">{userEmail}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Nom d&apos;affichage</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-deep border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Nom de la marque</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-deep border border-border text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <Button>Sauvegarder</Button>
              </div>
            </Card>
          )}

          {activeSection === 'billing' && (
            <Card>
              <h3 className="text-text-primary font-semibold mb-4">Plan & Facturation</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className={`border ${userPlan === 'free' ? 'border-border' : 'border-border'}`}>
                  <div className="mb-2">
                    <h4 className="font-semibold text-text-primary">Gratuit</h4>
                    {userPlan === 'free' && <Badge variant="success">Actuel</Badge>}
                  </div>
                  <p className="text-2xl font-bold font-mono text-text-primary mb-3">0 FCFA</p>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> 5 QR codes max</li>
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> Redirection dynamique</li>
                    <li className="flex items-center gap-2"><span className="text-primary">✓</span> Analytics 7 jours</li>
                  </ul>
                </Card>

                <Card className="border-secondary/30 bg-secondary/5 relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <Badge variant="warning">POPULAIRE</Badge>
                  </div>
                  <div className="mb-2">
                    <h4 className="font-semibold text-text-primary">PRO</h4>
                    {userPlan === 'pro' && <Badge variant="success">Actuel</Badge>}
                  </div>
                  <p className="text-2xl font-bold font-mono text-text-primary mb-3">
                    2 900 FCFA
                    <span className="text-sm text-text-secondary font-sans font-normal">/mois</span>
                  </p>
                  <ul className="space-y-2 text-sm text-text-secondary mb-4">
                    <li className="flex items-center gap-2"><span className="text-secondary">✓</span> QR codes illimités</li>
                    <li className="flex items-center gap-2"><span className="text-secondary">✓</span> Brand-Match IA</li>
                    <li className="flex items-center gap-2"><span className="text-secondary">✓</span> Analytics 90 jours</li>
                    <li className="flex items-center gap-2"><span className="text-secondary">✓</span> Export SVG + PDF</li>
                  </ul>
                  {userPlan === 'free' && (
                    <Button variant="secondary" className="w-full gap-1.5">
                      <Zap size={16} />
                      Passer à PRO
                    </Button>
                  )}
                </Card>
              </div>
            </Card>
          )}

          {(activeSection === 'security' || activeSection === 'notifications') && (
            <Card className="flex items-center justify-center min-h-[200px]">
              <p className="text-text-muted">Section en cours de développement</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

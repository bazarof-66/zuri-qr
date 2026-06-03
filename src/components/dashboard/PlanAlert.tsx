'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

interface PlanAlertProps {
  used: number;
  total: number;
}

export function PlanAlert({ used, total }: PlanAlertProps) {
  const percent = Math.round((used / total) * 100);
  const isFull = used >= total;

  return (
    <Card className="border-secondary/30 bg-secondary/5">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-secondary/15 text-secondary flex-shrink-0">
          <Sparkles size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-text-primary font-semibold text-sm">
            {isFull ? 'Tu as atteint la limite gratuite' : 'Plan Gratuit'}
          </h3>
          <p className="text-text-secondary text-xs mt-1">
            {isFull
              ? 'Passe à PRO pour créer des QR codes illimités avec des fonctionnalités avancées.'
              : `Tu as utilisé ${used}/${total} QR codes gratuits. Passe PRO pour en créer plus.`
            }
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>{used}/{total} QR codes</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-deep overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-secondary' : 'bg-primary'}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/settings">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Zap size={14} />
                Passer à PRO
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

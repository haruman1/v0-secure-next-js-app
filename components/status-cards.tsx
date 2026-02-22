'use client';

import { useLanguage } from '@/app/context/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle2, Edit2, Send, CheckSquare, FileX } from 'lucide-react';

interface StatusCardsProps {
  counts: {
    total: number;
    verification: number;
    revision: number;
    submitted: number;
    completed: number;
    draft: number;
  };
}

const statusConfig = [
  { key: 'total', label: 'nav.totalSubmissions', icon: FileText, color: 'bg-blue-100', iconColor: 'text-white bg-blue-500' },
  { key: 'verification', label: 'nav.verification', icon: CheckCircle2, color: 'bg-yellow-100', iconColor: 'text-white bg-yellow-500' },
  { key: 'revision', label: 'nav.revision', icon: Edit2, color: 'bg-orange-100', iconColor: 'text-white bg-orange-500' },
  { key: 'submitted', label: 'nav.submitted', icon: Send, color: 'bg-green-100', iconColor: 'text-white bg-green-500' },
  { key: 'completed', label: 'nav.completed', icon: CheckSquare, color: 'bg-teal-100', iconColor: 'text-white bg-teal-500' },
  { key: 'draft', label: 'nav.draft', icon: FileX, color: 'bg-gray-100', iconColor: 'text-white bg-gray-500' },
];

export function StatusCards({ counts }: StatusCardsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statusConfig.map((status) => {
        const Icon = status.icon;
        const count = counts[status.key as keyof typeof counts];

        return (
          <Card key={status.key} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t(status.label)}</p>
                  <p className="text-4xl font-bold text-foreground">{count}</p>
                </div>
                <div className={`p-3 rounded-lg ${status.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

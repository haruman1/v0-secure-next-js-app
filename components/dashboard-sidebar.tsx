'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/app/context/language-context';
import { LayoutGrid, FileText, CheckCircle2, Edit2, Send, CheckSquare, FileX, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { id: 'dashboard', key: 'nav.dashboard', icon: LayoutGrid, href: '/dashboard' },
  { id: 'form', key: 'nav.form', icon: FileText, href: '/dashboard/evacuation/new' },
  { id: 'verification', key: 'nav.verification', icon: CheckCircle2, href: '/dashboard/status/verification' },
  { id: 'revision', key: 'nav.revision', icon: Edit2, href: '/dashboard/status/revision' },
  { id: 'submitted', key: 'nav.submitted', icon: Send, href: '/dashboard/status/submitted' },
  { id: 'completed', key: 'nav.completed', icon: CheckSquare, href: '/dashboard/status/completed' },
  { id: 'draft', key: 'nav.draft', icon: FileX, href: '/dashboard/status/draft' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="w-72 bg-white border-r border-border min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">MEDIVAQ</h1>
            <p className="text-xs text-muted-foreground">Medical Evacuation Services</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
        <p>Medical Evacuation System v1.0</p>
      </div>
    </aside>
  );
}

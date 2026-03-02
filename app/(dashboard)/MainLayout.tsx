'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  CheckCircle,
  Edit,
  FileCheck,
  CheckSquare,
  FilePlus,
  LayoutDashboard,
  Plane,
  LogOut,
  BookPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/auth-context';

/**
 * MENU KHUSUS ADMIN
 */
const adminNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/verifikasi', label: 'Verifikasi', icon: CheckCircle },
  { path: '/dashboard/revisi', label: 'Revisi', icon: Edit },
  { path: '/dashboard/penerbitan', label: 'Penerbitan', icon: FileCheck },
  { path: '/dashboard/selesai', label: 'Selesai', icon: CheckSquare },
];

/**
 * MENU KHUSUS USER
 */
const userNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/permohonan', label: 'Permohonan', icon: BookPlus },
  { path: '/dashboard/draft', label: 'Draft', icon: FilePlus },
  { path: '/dashboard/verifikasi', label: 'Verifikasi', icon: CheckCircle },
  { path: '/dashboard/revisi', label: 'Revisi', icon: Edit },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return null;

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Plane className="size-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-xl text-gray-900">MEDIVAQ</h1>
              <p className="text-xs text-gray-500">
                Medical Evacuation Services
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout (dipisah dari menu) */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

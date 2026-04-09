'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  CheckCircle,
  Edit,
  FileCheck,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  BookPlus,
  PlaneTakeoff,
  Activity,
  FolderOpen,
  Globe,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/auth-context';
import { useLanguage } from '../context/language-context';


export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (isLoading) return null;

  const navGroups = user?.role === 'admin' 
    ? [
        {
          title: t('dashboard.overview'),
          items: [{ path: '/dashboard', label: t('dashboard.overview'), icon: LayoutDashboard }],
        },
        {
          title: t('evacuation.documents') || 'Documents',
          items: [
            { path: '/dashboard/verifikasi', label: t('evacuation.pending'), icon: CheckCircle },
            { path: '/dashboard/revisi', label: t('evacuation.reviewed'), icon: Edit },
            { path: '/dashboard/penerbitan', label: t('evacuation.valid'), icon: FileCheck },
            { path: '/dashboard/selesai', label: t('dashboard.completedRequests'), icon: CheckSquare },
          ],
        },
      ]
    : [
        {
          title: t('dashboard.overview'),
          items: [{ path: '/dashboard', label: t('dashboard.overview'), icon: LayoutDashboard }],
        },
        {
          title: t('dashboard.createNew'),
          items: [{ path: '/dashboard/permohonan', label: t('evacuation.createNew'), icon: BookPlus }],
        },
        {
          title: t('evacuation.status'),
          items: [
            { path: '/dashboard/verifikasi', label: t('evacuation.pending'), icon: Activity },
            { path: '/dashboard/revisi', label: t('evacuation.reviewed'), icon: Edit },
            { path: '/dashboard/selesai', label: t('dashboard.completedRequests'), icon: FolderOpen },
          ],
        },
      ];

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  // Inline style to hide scrollbar across all browsers
  const noScrollbar: React.CSSProperties = {
    scrollbarWidth: 'none',       // Firefox
    msOverflowStyle: 'none',      // IE/Edge
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* SIDEBAR */}
      <aside 
        className={cn(
          "bg-white border-r border-slate-200/60 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-[290px]" : "w-[100px]"
        )}
      >
        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 size-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-[#1A62FF] hover:border-[#1A62FF] shadow-sm z-30 transition-all duration-300 group/toggle active:scale-90"
        >
          <ChevronLeft 
            className={cn(
              "size-4 transition-transform duration-500", 
              !isSidebarOpen && "rotate-180",
              "group-hover/toggle:scale-110"
            )} 
          />
        </button>
        
        {/* LOGO AREA */}
        <div className={cn(
          "h-[104px] flex items-center border-b border-slate-100/80 shrink-0 transition-all duration-300",
          isSidebarOpen ? "px-8" : "px-0 justify-center"
        )}>
          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative flex items-center justify-center size-[82px] rounded-2xl bg-white shadow-lg overflow-hidden shrink-0 transition-transform duration-500 group-hover:rotate-3">
              <img
                  src="/BKK.png"
                  alt="Medivaq Logo"
                  className="w-25 h-15 object-contain"
                />
            </div>

            {isSidebarOpen && (
              <div className="flex flex-col pt-1 whitespace-nowrap opacity-100 transition-opacity duration-300">
                <h1 className="font-extrabold text-[24px] tracking-tight text-slate-900 leading-none">MEDIVAC</h1>
                <p className="text-[10px] font-bold text-[#1A62FF]/80 uppercase tracking-[0.2em] mt-1.5">
                  {language === 'id' ? 'Evakuasi Medis' : 'Medical Evacuation'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION AREA — scrollbar hidden via inline style + class */}
        <div
          className="flex-1 overflow-y-auto py-8 px-5 space-y-9 scrollbar-hide pb-32"
          style={noScrollbar}
        >
          {/* webkit scrollbar hidden via global CSS or inline pseudo-element workaround */}
          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
          `}</style>

          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-3">
              {isSidebarOpen ? (
                <h3 className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest transition-opacity duration-300">
                  {group.title}
                </h3>
              ) : (
                <div className="h-4 border-b border-slate-100 mx-2" />
              )}
              
              <nav className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link 
                      key={item.path} 
                      href={item.path} 
                      className={cn(
                        'flex items-center rounded-2xl transition-all duration-300 ease-in-out group relative overflow-hidden',
                        isSidebarOpen ? 'gap-4 px-3 py-2.5' : 'justify-center p-2.5',
                        isActive ? 'bg-[#1A62FF] text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      )}
                      title={!isSidebarOpen ? item.label : ""}
                    >
                      {isActive && isSidebarOpen && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />}
                      <div className={cn(
                        'flex items-center justify-center size-[38px] rounded-xl transition-all duration-300 shrink-0',
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100/80 text-slate-400 group-hover:bg-white group-hover:text-[#1A62FF] group-hover:shadow-sm'
                      )}>
                        <Icon className={cn('size-5', !isActive && 'group-hover:scale-110')} />
                      </div>
                      {isSidebarOpen && (
                        <span className={cn('text-[14px] transition-all duration-300 whitespace-nowrap', isActive ? 'font-semibold tracking-wide' : 'font-medium')}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* LOGOUT AREA */}
        <div className={cn("p-6 border-t border-slate-100/80 bg-slate-50/30 shrink-0", !isSidebarOpen && "px-2")}>
          <button 
            onClick={handleLogout} 
            className={cn(
              "w-full flex items-center rounded-2xl font-semibold text-[14px] text-slate-600 hover:bg-blue-50 hover:text-[#1A62FF] transition-all duration-300 group",
              isSidebarOpen ? "justify-start gap-3.5 px-6 py-4" : "justify-center p-3"
            )}
          >
            <div className="flex items-center justify-center size-9 rounded-lg bg-white border border-slate-200 text-slate-400 group-hover:bg-white group-hover:text-[#1A62FF] group-hover:border-blue-200 transition-colors duration-300 shrink-0">
              <LogOut className="size-4.5 transition-transform group-hover:-translate-x-1" />
            </div>
            {isSidebarOpen && <span className="transition-opacity duration-300">{t('common.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* FLOATING LANGUAGE SWITCHER */}
      <div className="fixed top-8 right-8 z-50 flex items-center justify-end">
        <div className={cn(
            "flex items-center bg-white rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100/80 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden",
            isLangOpen ? "p-1.5 pr-2.5" : "p-1.5"
          )}
        >
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center justify-center h-10 px-4 rounded-full bg-[#1A62FF] text-white shadow-sm shrink-0 hover:scale-105 transition-transform"
          >
            <Globe className="size-4 mr-2" />
            <span className="text-[13px] font-bold tracking-wide">
              {language === 'id' ? 'Bahasa' : 'Language'}
            </span>
          </button>

          <div className={cn(
              "flex items-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden",
              isLangOpen ? "max-w-[120px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0 pointer-events-none"
            )}
          >
            <div className="flex items-center gap-1 w-[90px]">
              <button
                onClick={() => { setLanguage('id'); setIsLangOpen(false); }}
                className={cn(
                  'flex-1 py-1.5 text-[12px] font-bold rounded-full transition-all duration-300',
                  language === 'id' ? 'bg-[#1A62FF] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                )}
              >ID</button>
              <button
                onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                className={cn(
                  'flex-1 py-1.5 text-[12px] font-bold rounded-full transition-all duration-300',
                  language === 'en' ? 'bg-[#1A62FF] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                )}
              >EN</button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA — scrollbar hidden */}
      <main
        className="flex-1 overflow-y-auto relative bg-[#F8FAFC]"
        style={noScrollbar}
      >
        <style>{`
          main::-webkit-scrollbar { display: none; }
        `}</style>
        {children}
      </main>
    </div>
  );
}

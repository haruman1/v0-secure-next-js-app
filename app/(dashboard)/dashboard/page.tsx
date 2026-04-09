'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CheckCircle,
  Edit,
  FileCheck,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  UserCircle2,
  FilePlus,
  Clock,
  FolderCheck,
  Activity,
  History
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/auth-context';
import { useLanguage } from '@/app/context/language-context';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { language, t } = useLanguage();

  const [pendingCount, setPendingCount] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [validCount, setValidCount] = useState(0);
  const [selesaiCount, setSelesaiCount] = useState(0);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  const isAdmin = user?.role === 'admin';

  // 1. UPDATE JAM WIB & TANGGAL DINAMIS
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const locale = language === 'id' ? 'id-ID' : 'en-US';
      
      const formattedDate = new Intl.DateTimeFormat(locale, { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        timeZone: 'Asia/Jakarta' 
      }).format(now);
      
      setCurrentDate(formattedDate);
      
      const optionsTime: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      
      const formattedTime = new Intl.DateTimeFormat(locale, optionsTime).format(now);
      setCurrentTime(`${formattedTime.replace(/\./g, ':')} WIB`);

      const wibHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false }).format(now), 10);
      
      if (language === 'id') {
        if (wibHour < 11) setGreeting('Selamat Pagi');
        else if (wibHour < 15) setGreeting('Selamat Siang');
        else if (wibHour < 18) setGreeting('Selamat Sore');
        else setGreeting('Selamat Malam');
      } else {
        if (wibHour < 12) setGreeting('Good Morning');
        else if (wibHour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
      }
    };

    updateTime(); 
    const timeInterval = setInterval(updateTime, 1000); 

    return () => clearInterval(timeInterval);
  }, [language]);

  // 2. FETCH DATA 
  useEffect(() => {
    if (isLoading || !user) return;

    fetchDashboardStats(true);
    if (isAdmin) {
      fetchAdminData();
    }

    const dataInterval = setInterval(() => {
      fetchDashboardStats(false);
      if (isAdmin) fetchAdminData();
    }, 15000); 

    return () => clearInterval(dataInterval);
  }, [isLoading, user?.role]);

  async function fetchDashboardStats(showLoading = true) {
    if (showLoading) setLoadingStats(true);
    
    try {
      const [pendingRes, reviewedRes, validRes, selesaiRes] = await Promise.all([
        fetch('/api/evacuations?status=pending', { credentials: 'include' }),
        fetch('/api/evacuations?status=reviewed', { credentials: 'include' }),
        fetch('/api/evacuations?status=valid', { credentials: 'include' }),
        fetch('/api/publications?status=valid&publishedOnly=true', { credentials: 'include' }),
      ]);

      const [pendingResult, reviewedResult, validResult, selesaiResult] = await Promise.all([
        pendingRes.json(), reviewedRes.json(), validRes.json(), selesaiRes.json(),
      ]);

      setPendingCount(pendingRes.ok ? (pendingResult.data || []).length : 0);
      setReviewedCount(reviewedRes.ok ? (reviewedResult.data || []).length : 0);
      setValidCount(validRes.ok ? (validResult.data || []).length : 0);
      setSelesaiCount(selesaiRes.ok ? (selesaiResult.data || []).length : 0);
    } catch (error) {
      console.error('Gagal mengambil statistik dashboard:', error);
    } finally {
      if (showLoading) setLoadingStats(false);
    }
  }

  // FUNGSI UNTUK MENGAMBIL DATA GRAFIK DAN DAFTAR TERBARU (KHUSUS ADMIN)
  async function fetchAdminData() {
    try {
      const res = await fetch('/api/evacuations', { credentials: 'include' });
      const result = await res.json();
      
      if (res.ok && result.data) {
        const allData: any[] = result.data;
        const currentYear = new Date().getFullYear();

        const monthNames = language === 'id' 
          ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const monthlyData = monthNames.map((name) => ({
          name,
          Total: 0
        }));

        // Grafik: Ambil SEMUA data tahun ini
        const thisYearData = allData.filter(item => {
          const dateString = item.created_at || item.createdAt; 
          if (!dateString) return false;

          const safeDateString = dateString.replace(' ', 'T'); 
          const date = new Date(safeDateString);
          
          return date.getFullYear() === currentYear;
        });

        thisYearData.forEach(item => {
          const dateString = item.created_at || item.createdAt;
          const safeDateString = dateString.replace(' ', 'T');
          const date = new Date(safeDateString);
          
          const monthIndex = date.getMonth(); 
          if(monthIndex >= 0 && monthIndex <= 11) {
            monthlyData[monthIndex].Total += 1;
          }
        });

        setChartData(monthlyData);

        // ✅ PERBAIKAN: Filter hanya permohonan yang belum Valid/Selesai
        const activeApplications = allData.filter(app => {
          const status = app.status?.toLowerCase() || '';
          return status !== 'valid' && status !== 'selesai';
        });

        // Urutkan berdasarkan yang paling baru
        const sortedData = [...activeApplications].sort((a, b) => {
          const dateA = a.created_at || a.createdAt;
          const dateB = b.created_at || b.createdAt;
          const safeDateA = dateA ? dateA.replace(' ', 'T') : 0;
          const safeDateB = dateB ? dateB.replace(' ', 'T') : 0;
          return new Date(safeDateB).getTime() - new Date(safeDateA).getTime();
        });
        
        setRecentApplications(sortedData.slice(0, 5));
      }
    } catch (error) {
      console.error("Gagal mengambil data grafik/terbaru:", error);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-700">{t('evacuation.pending')}</span>;
      case 'reviewed': return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-700">{t('evacuation.reviewed')}</span>;
      case 'valid': return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">{t('evacuation.valid')}</span>;
      default: return <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  if (isLoading || loadingStats) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm h-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-slate-100 shadow-sm rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const adminVerifikasiCount = pendingCount;
  const penerbitanCount = Math.max(validCount - selesaiCount, 0);
  const userVerifikasiCount = validCount;

  const stats = [
    {
      label: t('evacuation.pending'),
      value: isAdmin ? adminVerifikasiCount.toString() : userVerifikasiCount.toString(),
      icon: CheckCircle, color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-700',
      description: isAdmin 
        ? (language === 'id' ? 'Menunggu verifikasi Anda' : 'Awaiting your verification') 
        : (language === 'id' ? 'Telah diverifikasi admin' : 'Verified by admin'),
      href: '/dashboard/verifikasi',
      show: !!user,
    },
    {
      label: t('evacuation.reviewed'),
      value: reviewedCount.toString(),
      icon: Edit, color: 'bg-rose-500', lightColor: 'bg-rose-50', textColor: 'text-rose-700',
      description: language === 'id' ? 'Perlu perbaikan dokumen' : 'Needs document revision',
      href: '/dashboard/revisi',
      show: !!user,
    },
    {
      label: t('evacuation.valid'),
      value: penerbitanCount.toString(),
      icon: FileCheck, color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-700',
      description: language === 'id' ? 'Siap untuk diterbitkan' : 'Ready to be issued',
      href: '/dashboard/penerbitan',
      show: isAdmin,
    },
    {
      label: t('dashboard.completedRequests'),
      value: selesaiCount.toString(),
      icon: CheckSquare, color: 'bg-blue-600', lightColor: 'bg-blue-50', textColor: 'text-blue-700',
      description: language === 'id' ? 'Surat telah diterbitkan' : 'Document has been issued',
      href: '/dashboard/selesai',
      show: !!user,
    },
  ].filter((s) => s.show);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* HERO HEADER */}
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          
          <div className="relative p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              
              <div className="space-y-5 text-white max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold backdrop-blur-md uppercase tracking-wider">
                    {isAdmin ? <ShieldCheck className="size-4 text-emerald-400" /> : <UserCircle2 className="size-4 text-blue-300" />}
                    <span>{isAdmin ? t('users.admin') : t('users.user')}</span>
                  </div>
                </div>

                <div>
                  {/* Perbaikan: user?.name, dan fallback disesuaikan dengan role */}
                  <h1 className="text-3xl font-bold mb-2">
                    {greeting}, {user?.name || (isAdmin ? 'Admin' : 'User')}
                  </h1>
                  
                  {/* Perbaikan: Teks deskripsi dibedakan antara Admin dan User biasa */}
                  <p className="text-base sm:text-lg text-blue-100/90 font-light leading-relaxed">
                    {isAdmin 
                      ? (language === 'id' 
                          ? 'Selamat Datang di Panel Admin Evakuasi Medis Udara.' 
                          : 'Welcome to the Air Medical Evacuation Admin Panel.')
                      : (language === 'id' 
                          ? 'Selamat Datang di Sistem Manajemen Evakuasi Medis Udara.' 
                          : 'Welcome to the Air Medical Evacuation Management System.')
                    }
                  </p>
                </div>
              </div>

              {/* Kanan: Widget Jam WIB & Tanggal Real-time (Pastikan ini tetap ada dari kode sebelumnya) */}
              {currentTime && currentDate && (
                <div className="flex-shrink-0 flex items-center lg:justify-end">
                  <div className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-6 py-4 backdrop-blur-md shadow-lg">
                    <div className="rounded-full bg-blue-500/20 p-3 border border-blue-400/30">
                      <Clock className="size-6 text-blue-300" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-blue-200 mb-0.5 capitalize">{currentDate}</span>
                      <span className="text-2xl font-bold tracking-widest text-white font-mono">{currentTime}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-slate-800">{t('dashboard.statistics')}</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE
            </div>
          </div>

          <div className={`grid gap-5 ${stats.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.label} href={stat.href}>
                  <Card className="group relative overflow-hidden rounded-2xl border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer h-full flex flex-col justify-between">
                    <div className={`absolute top-0 left-0 w-full h-1 ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <CardHeader className="pb-2 pt-6">
                      <div className="flex items-start justify-between">
                        <div className={`rounded-xl p-3 ${stat.lightColor} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`size-6 ${stat.textColor}`} />
                        </div>
                        <div className="text-slate-300 transition-colors group-hover:text-slate-600">
                          <ArrowRight className="size-5" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-6 pt-4">
                      <p className="text-4xl font-bold tracking-tight text-slate-900 mb-2 transition-all duration-500">
                        {stat.value}
                      </p>
                      <CardTitle className="text-sm font-semibold text-slate-700 mb-1">
                        {stat.label}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        {stat.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* USER SECTION */}
        {!isAdmin && (
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden rounded-3xl border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0 h-full">
                <div className="flex flex-col justify-between p-8 sm:p-10 gap-6 h-full">
                  <div className="flex flex-col text-left gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-4 rounded-2xl shrink-0">
                        <FilePlus className="size-8 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{t('dashboard.createNew')}</h3>
                    </div>
                    <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
                      {language === 'id' 
                        ? 'Lengkapi data pasien, informasi penerbangan, dan dokumen medis untuk memulai proses evakuasi dengan cepat dan aman.' 
                        : 'Complete patient data, flight information, and medical documents to start the evacuation process quickly and safely.'}
                    </p>
                  </div>
                  
                  <div className="mt-auto">
                    <Link href="/dashboard/permohonan" className="w-full block">
                      <Button 
                        size="lg" 
                        className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 h-16 px-8 text-lg font-semibold transition-all hover:scale-[1.02]"
                      >
                        <FilePlus className="mr-3 size-6" />
                        {t('evacuation.createNew')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-3xl border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow group">
              <Link href="/dashboard/selesai" className="h-full flex flex-col justify-between p-8 sm:p-10 gap-6">
                 <div className="flex flex-col text-left gap-4">
                   <div className="flex items-center gap-4">
                     <div className="bg-emerald-50 p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                       <FolderCheck className="size-8 text-emerald-600" />
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900">{t('dashboard.completedRequests')}</h3>
                   </div>
                   <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
                     {language === 'id' 
                       ? 'Akses dan unduh surat izin evakuasi medis udara Anda yang telah berhasil diterbitkan.' 
                       : 'Access and download your successfully issued air medical evacuation permits.'}
                   </p>
                 </div>
                 
                 <div className="flex items-center justify-center w-full rounded-2xl bg-emerald-50 text-emerald-600 h-16 font-semibold mt-auto border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {language === 'id' ? 'Lihat Arsip' : 'View Archive'} <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                 </div>
              </Link>
            </Card>
          </div>
        )}

        {/* ADMIN SECTION: GRAFIK & LIST TERBARU */}
        {isAdmin && (
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRAFIK BATANG (KIRI, LEBIH LEBAR) */}
            <Card className="lg:col-span-2 overflow-hidden rounded-3xl border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Activity className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {language === 'id' ? 'Aktivitas Permohonan Masuk' : 'Incoming Application Activity'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'id' ? `Tahun ${new Date().getFullYear()}` : `Year ${new Date().getFullYear()}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-2 px-2 sm:px-6 flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="Total" 
                      name={language === 'id' ? 'Total Permohonan' : 'Total Requests'} 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                      animationDuration={1500} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* DAFTAR PERMOHONAN TERBARU (KANAN) */}
            <Card className="overflow-hidden rounded-3xl border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                      <History className="size-5" />
                    </div>
                    <CardTitle className="text-xl">
                      {language === 'id' ? 'Terbaru Masuk' : 'Recent Entries'}
                    </CardTitle>
                  </div>
                  <Link href="/dashboard/verifikasi" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                    {language === 'id' ? 'Lihat Semua' : 'View All'}
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto max-h-[350px]">
                {recentApplications.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {recentApplications.map((app, index) => {
                      const dateStr = app.created_at || app.createdAt;
                      const displayDate = dateStr 
                        ? new Date(dateStr.replace(' ', 'T')).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short' })
                        : '-';

                      return (
                        <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm text-slate-900 truncate">
                              {app.namaPasien || 'No Name'}
                            </p>
                            {getStatusBadge(app.status)}
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="truncate">{app.namaMaskapai || '-'} ({app.noPenerbangan || '-'})</span>
                            <span className="shrink-0">{displayDate}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <History className="size-10 mb-3 opacity-20" />
                    <p className="text-sm">{language === 'id' ? 'Belum ada data' : 'No data yet'}</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        )}
        
      </div>
    </div>
  );
}
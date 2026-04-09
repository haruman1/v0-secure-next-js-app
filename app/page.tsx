'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useAuth } from './context/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import {
  Ambulance,
  Users,
  ShieldCheck,
  ArrowRight,
  Activity,
  type LucideIcon,
} from 'lucide-react';

// ================= TYPES =================
type FeatureItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

// ================= STATIC DATA =================
const features: FeatureItem[] = [
  {
    icon: Ambulance,
    title: 'Emergency Dispatch',
    desc: 'Pengiriman ambulans secara cepat dengan rute teroptimasi untuk evakuasi medis darurat.',
  },
  {
    icon: Users,
    title: 'Medical Coordination',
    desc: 'Satu sistem terpadu untuk menghubungkan dokter, operator lapangan, dan rumah sakit rujukan.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Patient Data',
    desc: 'Enkripsi end-to-end untuk menjamin kerahasiaan data medis dan rekam jejak evakuasi pasien.',
  },
];

// Diubah menjadi array agar animasi mengetiknya bergantian dan lebih hidup
const TYPING_TEXTS = ['Medical Evacuation'];

export default function Home() {
  const router = useRouter();
  const auth = useAuth();

  const user = auth?.user ?? null;
  const isLoading = auth?.isLoading ?? false;

  const [display, setDisplay] = useState('');
  const [textIndex, setTextIndex] = useState(0); // Tambahan state untuk melacak index array
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // ================= TYPING ANIMATION =================
  useEffect(() => {
    const currentText = TYPING_TEXTS[textIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIndex < currentText.length) {
      timeout = setTimeout(() => {
        setDisplay((prev) => prev + currentText[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 55);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplay((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      }, 30);
    } else if (!isDeleting && charIndex === currentText.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
    } else if (isDeleting && charIndex === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % TYPING_TEXTS.length);
      }, 250);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  // ================= REDIRECT LOGIN =================
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Activity className="animate-bounce w-8 h-8 text-[#2D7BFF]" />
        <p className="font-medium animate-pulse text-[#2D7BFF]">
          Memuat Medivac...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] relative overflow-hidden font-sans">
      {/* ================= BACKGROUND GLOWS ================= */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none bg-[rgba(45,123,255,0.08)]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none bg-[rgba(94,211,200,0.08)]" />

      {/* ================= NAVBAR ================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/icon.png"
                alt="Medivac Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain p-1"
                priority
              />
            </div>
            <div>
              <p className="font-bold text-xl leading-tight text-[#0B1F66]">
                Medivac
              </p>
              <p className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                Medical Evacution
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              className="hidden sm:flex font-medium hover:bg-slate-50 text-[#0B1F66]"
              onClick={() => router.push('/auth/login')}
            >
              Log in
            </Button>

            <Button
              className="text-white shadow-[0_10px_24px_rgba(45,123,255,0.22)] transition-all border-0 rounded-xl bg-gradient-to-br from-[#2D7BFF] to-[#2957D8] hover:scale-105"
              onClick={() => router.push('/auth/register')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative max-w-7xl mx-auto px-6 pt-40 pb-20 lg:pt-48 lg:pb-32 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center z-10">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 border bg-[#F0FAFF] border-[#CFE9FF] text-[#2957D8]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#5ED3C8]" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2957D8]" />
            </span>
            Sistem Medical Terintegrasi
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-[#0B1F66]">
            Medivac <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D7BFF] via-[#2957D8] to-[#33C7D9]">
              {display}
            </span>
            <span className="animate-pulse font-light ml-1 text-[#2D7BFF]">
              |
            </span>
          </h1>

          <p className="text-lg md:text-xl mt-8 max-w-2xl leading-relaxed text-[#36507A]">
            Medivac menghadirkan solusi digital untuk mendukung layanan evakuasi
            medis yang lebih responsif, aman, dan terkoordinasi dalam satu
            platform terintegrasi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Button
              size="lg"
              className="text-white shadow-[0_14px_30px_rgba(45,123,255,0.24)] text-base h-14 px-8 border-0 rounded-2xl bg-gradient-to-br from-[#2D7BFF] to-[#2957D8] hover:opacity-90 transition-opacity"
              onClick={() => router.push('/auth/login')}
            >
              Ajukan Evakuasi
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="relative"
        >
          {/* Decorative Glow */}
          <div className="absolute -inset-1 rounded-2xl blur-2xl opacity-25 bg-gradient-to-br from-[#33C7D9] via-[#2D7BFF] to-[#5ED3C8]" />

          <Card className="relative p-3 shadow-2xl bg-white border border-slate-200/50 rounded-[28px] overflow-hidden">
            <div className="absolute top-0 w-full h-10 bg-slate-100 border-b border-slate-100 flex items-center px-5 gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>

            <div className="relative mt-10 rounded-2xl aspect-video overflow-hidden bg-white flex items-center justify-center">
              <Image
                src="/icon.png"
                alt="Medivac Dashboard"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-10"
                priority
              />
            </div>
          </Card>
        </motion.div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-[#0B1F66]">
            Fitur Unggulan Medivac
          </h2>
          <p className="max-w-2xl mx-auto text-[#36507A]">
            Dirancang khusus untuk memenuhi standar respon cepat medis dengan
            keamanan tingkat tinggi.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Card className="p-8 h-full bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl group">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 bg-[#EEF8FF] text-[#2D7BFF] group-hover:bg-[#2D7BFF] group-hover:text-white transition-colors duration-300">
                    <Icon size={28} />
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-[#0B1F66]">
                    {feature.title}
                  </h3>

                  <p className="leading-relaxed text-[#36507A]">
                    {feature.desc}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-24 z-10 relative">
        <div className="rounded-[32px] p-10 md:p-16 text-center shadow-[0_25px_60px_rgba(45,123,255,0.18)] overflow-hidden relative bg-gradient-to-br from-[#33C7D9] via-[#2D7BFF] to-[#2957D8]">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
            Siap Menggunakan Medivac?
          </h2>

          <p className="text-cyan-50 text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Medivac hadir untuk membantu anda dalam proses evakuasi medis secara
            lebih cepat, aman, dan terintegrasi.
          </p>

          <div className="relative z-10">
            <Button
              size="lg"
              className="bg-white text-base h-14 px-10 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 hover:bg-slate-50 text-[#2D7BFF]"
              onClick={() => router.push('/auth/register')}
            >
              Mulai Gunakan Medivac
            </Button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-[#0B1F66]">
            <Image
              src="/Medivaq.png"
              alt="Medivac Logo"
              width={20}
              height={20}
              className="object-contain"
            />
            Medivac
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Medivac. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

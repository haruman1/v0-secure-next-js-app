'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./context/auth-context"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card"

import {
  Ambulance,
  HeartPulse,
  ShieldCheck,
  Clock3,
  Users,
  ArrowRight
} from "lucide-react"

const features = [
  {
    icon: HeartPulse,
    title: "Evakuasi Cepat",
    description:
      "Ajukan permintaan evakuasi medis hanya dalam beberapa menit."
  },
  {
    icon: ShieldCheck,
    title: "Sistem Aman",
    description:
      "Autentikasi aman dengan pencatatan aktivitas untuk setiap proses."
  },
  {
    icon: Users,
    title: "Kolaborasi Tim",
    description:
      "Dokter, operator, dan admin dapat memantau status evakuasi bersama."
  }
]

export default function Home() {

  const { user, isLoading } = useAuth()
  const router = useRouter()
  const typingText = "Medical Integrated Evacuation"
  const [text,setText] = useState("")
  const [index,setIndex] = useState(0)

  useEffect(()=>{
    if(index < typingText.length){
      const timeout = setTimeout(()=>{
        setText(prev => prev + typingText[index])
        setIndex(index + 1)
      },40)

      return ()=> clearTimeout(timeout)
    }
  },[index])

  useEffect(()=>{
    if(!isLoading && user){
      router.push("/dashboard")
    }
  },[user,isLoading])

  if(isLoading){
    return(
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat aplikasi...</p>
      </div>
    )
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/60 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center">
              <Ambulance className="h-5 w-5"/>
            </div>

            <div>
              <p className="font-semibold text-lg">Medivaq</p>
              <p className="text-xs text-muted-foreground">
                Medical Evacuation Platform
              </p>
            </div>

          </div>

          <div className="flex gap-3">

            <Button
              variant="ghost"
              onClick={()=>router.push("/auth/login")}
            >
              Login
            </Button>

            <Button
              className="bg-sky-500 hover:bg-sky-600 text-white"
              onClick={()=>router.push("/auth/register")}
            >
              Daftar
            </Button>

          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid lg:grid-cols-2 gap-14 items-center">
        <div className="space-y-6">
          <span className="bg-sky-100 text-sky-700 px-4 py-1 rounded-full text-sm">
            Sistem Evakuasi Medis Digital
          </span>

          <h1 className="text-5xl font-bold leading-tight">
            {text}
            <span className="animate-pulse text-sky-500">|</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl">
              Platform digital untuk mengelola permintaan evakuasi medis dengan 
              lebih cepat, transparan, dan terstruktur, sehingga proses penanganan 
              pasien dapat dilakukan secara lebih efektif.
          </p>

          <div className="flex gap-4">
            <Button
              size="lg"
              className="bg-sky-500 hover:bg-sky-600 text-white"
              onClick={()=>router.push("/auth/register")}
            >
              Ajukan Evakuasi
              <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={()=>router.push("/auth/login")}
            >
              Masuk Sistem
            </Button>
          </div>
        </div>

        {/* CARD INFO */}
        <Card className="border-sky-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-sky-500"/>
              Monitoring Evakuasi
            </CardTitle>

            <CardDescription>
              Pantau status evakuasi secara real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 text-center gap-4">

            <div>
              <p className="text-2xl font-bold text-sky-500">24/7</p>
              <p className="text-xs text-muted-foreground">Monitoring</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-emerald-500">10m</p>
              <p className="text-xs text-muted-foreground">Respon Admin</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-sky-500">3 Step</p>
              <p className="text-xs text-muted-foreground">Approval</p>
            </div>

          </CardContent>
        </Card>

      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {features.map((feature)=>(
          <Card
            key={feature.title}
            className="hover:shadow-xl transition duration-300"
          >

            <CardHeader>

              <div className="h-10 w-10 bg-sky-100 text-sky-500 rounded-lg flex items-center justify-center mb-2">
                <feature.icon className="h-5 w-5"/>
              </div>

              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}

      </section>

      {/* CTA */}
      <section className="bg-sky-500 text-white py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Siap Mengelola Evakuasi Medis?
        </h2>

        <p className="opacity-90 mb-6">
          Buat akun sekarang dan ajukan permintaan evakuasi pasien.
        </p>

        <Button
          size="lg"
          variant="secondary"
          onClick={()=>router.push("/auth/register")}
        >
          Mulai Sekarang
        </Button>
      </section>
    </div>
  )
}
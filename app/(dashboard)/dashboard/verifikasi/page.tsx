'use client'

import { useEffect, useState } from "react"
import { useApplications } from "@/app/context/ApplicationContext"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"


export default function VerifikasiPage() {

  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [detailStep, setDetailStep] = useState(1)
  const { moveToRevision } = useApplications()
  const router = useRouter();


  useEffect(() => {
    fetchApplications()
  }, [])


  async function fetchApplications() {
    try {
      const res = await fetch("/api/evacuations", {
        credentials: "include"
      })
      const result = await res.json()
      if (res.ok) {
        const pending = result.data.filter(
          (item: any) => item.status === "pending"
        )
        setApplications(pending)
      }

    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }


  async function openDetail(id: string) {

    try {
      const res = await fetch(`/api/evacuations/${id}`, {
        credentials: "include"
      })
      const result = await res.json()
      if (res.ok) {
        setSelectedApp(result.data)
        setDetailStep(1)
        setShowDetail(true)
      }
    } catch (error) {
      console.error("Detail error:", error)
    }

  }


  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/evacuations/${id}/approve`, {
        method: "POST"
      })
      if (res.ok) {
        alert("Permohonan disetujui")
        setApplications(prev =>
          prev.filter(app => app.id !== id)
        )
        setShowDetail(false)
      }
    } catch (error) {
      console.error(error)
    }
  }


  async function handleReject(id: string) {
    try {
      const res = await fetch(`/api/evacuations/${id}/reject`, {
        method: "POST"
      })
      if (res.ok) {
        alert("Permohonan dikembalikan untuk revisi")
        setApplications(prev =>
          prev.filter(app => app.id !== id)
        )
        setShowDetail(false)
        router.push("/revisi")
      }
    } catch (error) {
      console.error(error)
    }
  }

  function formatDate(date: string) {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  })
}


  function nextDetail() {
    setDetailStep((prev) => Math.min(prev + 1, 4))
  }

  function prevDetail() {
    setDetailStep((prev) => Math.max(prev - 1, 1))
  }


  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Verifikasi Permohonan
        </h1>
        <p className="text-gray-600">
          Daftar permohonan yang menunggu verifikasi
        </p>

      </div>


      <Card>
        <CardHeader>
          <CardTitle>
            Permohonan Pending
          </CardTitle>

          <CardDescription>
            {applications.length} permohonan menunggu verifikasi
          </CardDescription>
        </CardHeader>
        <CardContent>

          {loading ? (
            <div className="text-center py-10">
              Loading...
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Tidak ada permohonan
            </div>
          ) : (

            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold">
                      {app.namaPasien || "-"}
                    </div>

                    <div className="text-sm text-gray-500">
                      ID: {app.id}
                    </div>

                    <div className="text-sm text-gray-500">
                      {app.noPenerbangan || "-"}
                    </div>

                    <div className="text-sm text-gray-500">

                      {app.tanggalPerjalanan
                        ? new Date(app.tanggalPerjalanan)
                          .toLocaleDateString("id-ID")
                        : "-"
                      }
                    </div>
                  </div>


                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Pending
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetail(app.id)}
                    >
                      Detail
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleApprove(app.id)}
                    >
                      Setujui
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(app.id)}
                    >
                      Revisi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>



      {/* MODAL DETAIL */}

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detail Permohonan
            </DialogTitle>
            <DialogDescription>
              Informasi lengkap permohonan evakuasi
            </DialogDescription>
          </DialogHeader>


          {/* STEP INDICATOR */}
          <div className="flex justify-between mb-6 text-sm border-b pb-3">
            {[
              "Data Pribadi",
              "Data Pasien",
              "Kondisi Pasien",
              "Data Penumpang"
            ].map((label, index) => {
              const step = index + 1
              return (
                <div
                  key={step}
                  className={`flex-1 text-center ${
                    detailStep === step
                      ? "font-semibold text-black"
                      : "text-gray-400"
                  }`}
                >
                  {step}. {label}
                </div>
              )
            })}

          </div>


          {selectedApp && (
            <div className="space-y-4 text-sm">
              {/* STEP 1 */}
              {detailStep === 1 && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Jenis Layanan</p>
                    <p className="font-medium">{selectedApp.jenisLayanan || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Jenis Pesawat</p>
                    <p className="font-medium">{selectedApp.jenisPesawat || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Nama Petugas</p>
                    <p className="font-medium">{selectedApp.namaPetugas || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">No Telepon Kantor</p>
                    <p className="font-medium">{selectedApp.noTelepon || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Email Perusahaan</p>
                    <p className="font-medium">{selectedApp.emailPerusahaan || "-"}</p>
                  </div>
                  

                  <div>
                    <p className="text-xs text-gray-500">Nama Maskapai</p>
                    <p className="font-medium">{selectedApp.namaMaskapai || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">No Penerbangan</p>
                    <p className="font-medium">{selectedApp.noPenerbangan || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">No Kursi</p>
                    <p className="font-medium">{selectedApp.noKursi || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Tanggal Perjalanan</p>
                    <p className="font-medium">{formatDate(selectedApp.tanggalPerjalanan) || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Jam Perjalanan</p>
                    <p className="font-medium">{selectedApp.jamPerjalanan  || "-"}</p>
                  </div>
                </div>
              )}



              {/* STEP 2 */}
              {detailStep === 2 && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Nama Pasien</p>
                    <p className="font-medium">{selectedApp.namaPasien || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Jenis Kelamin</p>
                    <p className="font-medium">{selectedApp.jenisKelamin || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Tanggal Lahir</p>
                    <p className="font-medium">{formatDate(selectedApp.tanggalLahir) || "-"}</p>
                  </div>
                </div>
              )}



              {/* STEP 3 */}

              {detailStep === 3 && (
                <div className="grid grid-cols-2 gap-6">

                  <div>
                    <p className="text-xs text-gray-500">Memerlukan Oksigen</p>
                    <p className="font-medium">{selectedApp.memerlukanOksigen || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Posisi Pasien</p>
                    <p className="font-medium">{selectedApp.posisiPasien || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Tingkat Kesadaran</p>
                    <p className="font-medium">{selectedApp.tingkatKesadaran || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Tekanan Darah</p>
                    <p className="font-medium">{selectedApp.tekananDarah || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Nadi</p>
                    <p className="font-medium">{selectedApp.nadi || "-"}</p>
                  </div>

                   <div>
                    <p className="text-xs text-gray-500">Frekuensi Nafas</p>
                    <p className="font-medium">{selectedApp.frekuensiNafas || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Saturasi Oksigen</p>
                    <p className="font-medium">{selectedApp.saturasiOksigen || "-"}</p>
                  </div>
                </div>

              )}

              {/* STEP 4 */}

              {detailStep === 4 && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Jumlah Pendamping</p>
                    <p className="font-medium">{selectedApp.jumlahPendamping || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Hubungan dengan Pasien</p>
                    <p className="font-medium">{selectedApp.hubunganPasien || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Nama Pendamping</p>
                    <p className="font-medium">{selectedApp.namaPendamping || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">No Telepon Pendamping Medis</p>
                    <p className="font-medium">{selectedApp.nomorTeleponPendampingMedis || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">No Telepon Pendamping Medis</p>
                    <p className="font-medium">{selectedApp.nomorTeleponPendampingMedis || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">No Telepon Pendamping Keluarga</p>
                    <p className="font-medium">{selectedApp.nomorTeleponKeluarga || "-"}</p>
                  </div>

                   <div>
                    <p className="text-xs text-gray-500">No Surat Izin</p>
                    <p className="font-medium">{selectedApp.nomorTeleponKeluarga || "-"}</p>
                  </div>
                </div>
              )}
            </div>
          )}


          <DialogFooter>
            {detailStep > 1 && (
              <Button
                variant="outline"
                onClick={prevDetail}
              >
                Previous
              </Button>
            )}

            {detailStep < 4 ? (
              <Button onClick={nextDetail}>
                Next
              </Button>

            ) : (

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(selectedApp.id)}
                >
                  Setujui
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedApp.id)}
                >
                  Revisi
                </Button>

              </div>
            )}

          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

}
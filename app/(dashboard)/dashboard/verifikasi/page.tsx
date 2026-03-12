'use client'

import { useEffect, useState } from "react"
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

  const [showRevisiModal, setShowRevisiModal] = useState(false)
  const [revisiNote, setRevisiNote] = useState("")
  const [revisiId, setRevisiId] = useState<string | null>(null)

  const router = useRouter();

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      const res = await fetch("/api/evacuations?status=pending", {
        credentials: "include"
      })
      const result = await res.json()

      if (res.ok) {
        setApplications(result.data)
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
        method: "POST",
        credentials: "include"
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

  async function submitRevisi() {

    try {

      const res = await fetch(`/api/evacuations/${revisiId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          catatanRevisi: revisiNote
        })
      })

      if (res.ok) {

        alert("Permohonan dikembalikan untuk revisi")

        setApplications(prev =>
          prev.filter(app => app.id !== revisiId)
        )

        setShowRevisiModal(false)
        setShowDetail(false)
        setRevisiNote("")

        router.push("/dashboard/revisi")
      }

    } catch (error) {

      console.error("Reject error:", error)

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
          <CardTitle>Permohonan Pending</CardTitle>
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
                        ? new Date(app.tanggalPerjalanan).toLocaleDateString("id-ID")
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
                      onClick={() => {
                        setRevisiId(app.id)
                        setShowRevisiModal(true)
                      }}
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

          {selectedApp && (

            <div className="space-y-4 text-sm">

              <div>
                <p className="text-xs text-gray-500">Nama Pasien</p>
                <p className="font-medium">{selectedApp.namaPasien}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Tanggal Perjalanan</p>
                <p className="font-medium">
                  {formatDate(selectedApp.tanggalPerjalanan)}
                </p>
              </div>

            </div>
          )}

          <DialogFooter>

            <Button
              onClick={() => handleApprove(selectedApp.id)}
            >
              Setujui
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                setRevisiId(selectedApp.id)
                setShowRevisiModal(true)
              }}
            >
              Revisi
            </Button>

          </DialogFooter>

        </DialogContent>
      </Dialog>


      {/* MODAL CATATAN REVISI */}

      <Dialog
        open={showRevisiModal}
        onOpenChange={setShowRevisiModal}
      >

        <DialogContent className="max-w-md">

          <DialogHeader>
            <DialogTitle>
              Catatan Revisi
            </DialogTitle>

            <DialogDescription>
              Masukkan catatan revisi untuk pemohon
            </DialogDescription>
          </DialogHeader>

          <textarea
            className="w-full border rounded-md p-2 text-sm"
            rows={4}
            placeholder="Contoh: Mohon lengkapi nomor surat izin..."
            value={revisiNote}
            onChange={(e) => setRevisiNote(e.target.value)}
          />

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setShowRevisiModal(false)}
            >
              Batal
            </Button>

            <Button
              variant="destructive"
              onClick={submitRevisi}
            >
              Submit Revisi
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  )
}
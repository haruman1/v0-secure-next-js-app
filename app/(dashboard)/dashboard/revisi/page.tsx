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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

type EvacuationApplication = {
  id: string
  namaPasien: string | null
  jenisLayanan: string | null
  namaMaskapai: string | null
  noPenerbangan: string | null
  tanggalPerjalanan: string | null
  catatanRevisi?: string | null
   catatan_revisi?: string | null
  revisionNotes?: string | null
}

type EditableForm = {
  namaPasien: string
  jenisLayanan: string
  namaMaskapai: string
  noPenerbangan: string
  tanggalPerjalanan: string
}

const EMPTY_FORM: EditableForm = {
  namaPasien: "",
  jenisLayanan: "",
  namaMaskapai: "",
  noPenerbangan: "",
  tanggalPerjalanan: ""
}


function getRevisionNote(application: EvacuationApplication | null | undefined) {
  if (!application) return ""

  return application.catatanRevisi || application.catatan_revisi || application.revisionNotes || ""
}


function toDateInputValue(value: string | null | undefined) {
  if (!value) return ""

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return ""
  }

  return parsedDate.toISOString().slice(0, 10)
}


export default function RevisiPage() {

 const [applications, setApplications] = useState<EvacuationApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedApp, setSelectedApp] = useState<EvacuationApplication | null>(null)
  const [showDetail, setShowDetail] = useState(false)
   const [editForm, setEditForm] = useState<EditableForm>(EMPTY_FORM)

  useEffect(() => {
    fetchApplications()
  }, [])


  async function fetchApplications() {

    try {

      const res = await fetch("/api/evacuations?status=reviewed", {
        credentials: "include"
      })

      const result = await res.json()

      if (res.ok) {

        

        setApplications(result.data || [])

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
        const data = (result.data || result) as EvacuationApplication

        setSelectedApp(data)
        setEditForm({
          namaPasien: data.namaPasien || "",
          jenisLayanan: data.jenisLayanan || "",
          namaMaskapai: data.namaMaskapai || "",
          noPenerbangan: data.noPenerbangan || "",
          tanggalPerjalanan: toDateInputValue(data.tanggalPerjalanan)
        })

        setShowDetail(true)
      }

     } catch (error) {

      console.error("Detail error:", error)
      
  }

}

  async function submitRevisi() {
    if (!selectedApp) {
      return
    }
 try {
      setSubmitting(true)

      const res = await fetch(`/api/evacuations/${selectedApp.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(editForm)
      })
   const result = await res.json()
      if (!res.ok) {
        alert(result.error || "Gagal mengirim ulang revisi")
        return
      }

       alert("Data revisi berhasil disimpan dan dikirim ulang untuk verifikasi")

       setApplications((prev) => prev.filter((item) => item.id !== selectedApp.id))
      setShowDetail(false)
      setSelectedApp(null)
      setEditForm(EMPTY_FORM)

      } catch (error) {
      console.error("Submit revisi error:", error)
      alert("Terjadi kesalahan saat mengirim ulang untuk verifikasi")
    } finally {
      setSubmitting(false)
    }
  }
  
   function handleEditChange<K extends keyof EditableForm>(field: K, value: EditableForm[K]) {
    setEditForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }


 function formatDate(date: string | null | undefined) {

    if (!date) return "-"

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    })

  }




  return (

    <div className="p-8">

      <div className="mb-8">

        <h1 className="text-3xl font-bold mb-2">
          Permohonan Revisi
        </h1>

        <p className="text-gray-600">
          Daftar permohonan yang perlu diperbaiki
        </p>

      </div>



      <Card>

        <CardHeader>

          <CardTitle>
            Data Revisi
          </CardTitle>

          <CardDescription>
            {applications.length} permohonan perlu revisi
          </CardDescription>

        </CardHeader>



        <CardContent>

          {loading ? (

            <div className="text-center py-10">
              Loading...
            </div>

          ) : applications.length === 0 ? (

            <div className="text-center py-10 text-gray-500">
              Tidak ada permohonan revisi
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

                      {formatDate(app.tanggalPerjalanan)}

                    </div>

                  </div>



                  <div className="flex items-center gap-2">

                    <Badge variant="destructive">
                      Revisi
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetail(app.id)}
                    >
                      Detail
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

        <DialogContent className="max-w-xl">

          <DialogHeader>

            <DialogTitle>
              Detail Permohonan Revisi
            </DialogTitle>

            <DialogDescription>
              Data permohonan yang perlu diperbaiki
            </DialogDescription>

          </DialogHeader>



          {selectedApp && (

            <div className="space-y-4 text-sm">

             

          

              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Catatan dari Verifikasi</p>
                <p className="text-amber-900 whitespace-pre-wrap">
                   {getRevisionNote(selectedApp) || "Belum ada catatan revisi."}
                </p>

              </div>



              <div className="space-y-1">
                <Label htmlFor="namaPasien">Nama Pasien</Label>
                <Input
                  id="namaPasien"
                  value={editForm.namaPasien}
                  onChange={(e) => handleEditChange("namaPasien", e.target.value)}
                />
              </div>



              <div className="space-y-1">
                <Label htmlFor="jenisLayanan">Jenis Layanan</Label>
                <Input
                  id="jenisLayanan"
                  value={editForm.jenisLayanan}
                  onChange={(e) => handleEditChange("jenisLayanan", e.target.value)}
                />
              </div>



               <div className="space-y-1">
                <Label htmlFor="namaMaskapai">Nama Maskapai</Label>
                <Input
                  id="namaMaskapai"
                  value={editForm.namaMaskapai}
                  onChange={(e) => handleEditChange("namaMaskapai", e.target.value)}
                />

              </div>
              
              <div className="space-y-1">
                <Label htmlFor="noPenerbangan">No Penerbangan</Label>
                <Input
                  id="noPenerbangan"
                  value={editForm.noPenerbangan}
                  onChange={(e) => handleEditChange("noPenerbangan", e.target.value)}
                />
              </div>


              <div className="space-y-1">
                <Label htmlFor="tanggalPerjalanan">Tanggal Perjalanan</Label>
                <Input
                  id="tanggalPerjalanan"
                  type="date"
                  value={editForm.tanggalPerjalanan}
                  onChange={(e) => handleEditChange("tanggalPerjalanan", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="summary">Ringkasan Perbaikan</Label>
                <Textarea
                  id="summary"
                  value={`Data terakhir: ${selectedApp.namaPasien || "-"} (${formatDate(selectedApp.tanggalPerjalanan)})`}
                  readOnly
                />
              </div>

            </div>

          )}



          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setShowDetail(false)}
              disabled={submitting}
            >
              Tutup
            </Button>
             <Button onClick={submitRevisi} disabled={submitting || !selectedApp}>
              {submitting ? "Mengirim..." : "Kirim Ulang Verifikasi"}
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>

  )

}
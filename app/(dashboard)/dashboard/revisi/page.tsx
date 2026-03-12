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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"


export default function RevisiPage() {

  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)

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

    console.log("DETAIL DATA:", result)

    if (res.ok) {

      // ini yang penting
      setSelectedApp(result.data || result)

      setShowDetail(true)

    }

  } catch (error) {

    console.error("Detail error:", error)

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

                      {app.tanggalPerjalanan
                        ? new Date(app.tanggalPerjalanan)
                            .toLocaleDateString("id-ID")
                        : "-"
                      }

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

              <div>

                <p className="text-xs text-gray-500">
                  Nama Pasien
                </p>

                <p className="font-medium">
                  {selectedApp.namaPasien || "-"}
                </p>

              </div>



              <div>

                <p className="text-xs text-gray-500">
                  Jenis Layanan
                </p>

                <p className="font-medium">
                  {selectedApp.jenisLayanan || "-"}
                </p>

              </div>



              <div>

                <p className="text-xs text-gray-500">
                  Nama Maskapai
                </p>

                <p className="font-medium">
                  {selectedApp.namaMaskapai || "-"}
                </p>

              </div>



              <div>

                <p className="text-xs text-gray-500">
                  No Penerbangan
                </p>

                <p className="font-medium">
                  {selectedApp.noPenerbangan || "-"}
                </p>

              </div>



              <div>

                <p className="text-xs text-gray-500">
                  Tanggal Perjalanan
                </p>

                <p className="font-medium">
                  {formatDate(selectedApp.tanggalPerjalanan)}
                </p>

              </div>

            </div>

          )}



          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setShowDetail(false)}
            >
              Tutup
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>

  )

}
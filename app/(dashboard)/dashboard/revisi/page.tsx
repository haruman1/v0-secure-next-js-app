'use client'

import { useState } from "react"
import { useApplications, type Application } from "@/app/context/ApplicationContext"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function RevisiPage() {

  const {
    getApplicationsByStatus,
    updateApplication
  } = useApplications()

  const applications = getApplicationsByStatus("revision") || []

  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const [showEditDialog, setShowEditDialog] = useState(false)

  const [editData, setEditData] = useState<Application | null>(null)



  function handleEdit(app: Application) {

    setEditData(app)

    setShowEditDialog(true)

  }



  function handleSubmit() {

    if (!editData) return

    updateApplication(editData.id, {
      ...editData,
      status: "verification"
    })

    alert("Permohonan berhasil diperbaiki dan dikirim ulang")

    setShowEditDialog(false)

  }



  return (

    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Revisi Permohonan
        </h1>

        <p className="text-gray-600">
          Permohonan yang perlu diperbaiki
        </p>
      </div>



      <Card>

        <CardHeader>

          <CardTitle>
            Permohonan Revisi
          </CardTitle>

          <CardDescription>
            {applications.length} permohonan perlu diperbaiki
          </CardDescription>

        </CardHeader>



        <CardContent>

          {applications.length === 0 ? (

            <div className="text-center py-12 text-gray-500">
              Tidak ada permohonan revisi
            </div>

          ) : (

            <div className="space-y-4">

              {applications.map((app) => (

                <div
                  key={app.id}
                  className="border rounded-lg p-4"
                >

                  <div className="flex items-start justify-between mb-4">

                    <div>

                      <div className="font-medium mb-1">
                        {app.namaPasien || "Nama belum diisi"}
                      </div>

                      <div className="text-sm text-gray-600">
                        ID: {app.id} | {app.noPenerbangan || "-"}
                      </div>

                      <div className="text-sm text-gray-600">
                        Tanggal{" "}
                        {app.tanggalPerjalanan
                          ? new Date(app.tanggalPerjalanan).toLocaleDateString("id-ID")
                          : "-"
                        }
                      </div>

                    </div>


                    <Badge variant="destructive">
                      Revisi
                    </Badge>

                  </div>



                  {/* CATATAN REVISI */}

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm mb-3">

                    <span className="font-semibold text-red-600">
                      Catatan Revisi
                    </span>

                    <p className="text-gray-700 mt-1">
                      {app.revisionNotes || "Tidak ada catatan"}
                    </p>

                  </div>



                  <div className="flex gap-2">

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedApp(
                          selectedApp?.id === app.id ? null : app
                        )
                      }
                    >
                      {selectedApp?.id === app.id
                        ? "Sembunyikan"
                        : "Lihat Detail"}
                    </Button>


                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleEdit(app)}
                    >
                      Perbaiki Permohonan
                    </Button>

                  </div>



                  {/* DETAIL DATA */}

                  {selectedApp?.id === app.id && (

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">

                      <div className="grid grid-cols-2 gap-4">

                        <div>
                          <b>Maskapai:</b> {app.namaMaskapai || "-"}
                        </div>

                        <div>
                          <b>No Penerbangan:</b> {app.noPenerbangan || "-"}
                        </div>

                        <div>
                          <b>Groundhandling:</b> {app.namaGroundhandling || "-"}
                        </div>

                        <div>
                          <b>Petugas:</b> {app.namaPetugas || "-"}
                        </div>

                        <div>
                          <b>No Telepon:</b> {app.noTelepon || "-"}
                        </div>

                        <div>
                          <b>Email:</b> {app.emailPerusahaan || "-"}
                        </div>

                      </div>

                    </div>

                  )}

                </div>

              ))}

            </div>

          )}

        </CardContent>

      </Card>



      {/* MODAL EDIT */}

      <Dialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      >

        <DialogContent className="max-w-lg">

          <DialogHeader>

            <DialogTitle>
              Perbaiki Permohonan
            </DialogTitle>

            <DialogDescription>
              Silakan perbaiki data sesuai catatan revisi
            </DialogDescription>

          </DialogHeader>



          {editData && (

            <div className="space-y-4">

              <div>
                <Label>Nama Pasien</Label>

                <Input
                  value={editData.namaPasien || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      namaPasien: e.target.value
                    })
                  }
                />
              </div>


              <div>
                <Label>No Penerbangan</Label>

                <Input
                  value={editData.noPenerbangan || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      noPenerbangan: e.target.value
                    })
                  }
                />
              </div>


              <div>
                <Label>Nama Maskapai</Label>

                <Input
                  value={editData.namaMaskapai || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      namaMaskapai: e.target.value
                    })
                  }
                />
              </div>

            </div>

          )}



          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Batal
            </Button>


            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
            >
              Kirim Ulang
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>

  )

}
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AirMedicalEvacuationFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  isAdmin?: boolean;
  isLoading?: boolean;
}

export function EvacuationForm({
  initialData,
  onSubmit,
  isAdmin = false,
  isLoading = false,
}: AirMedicalEvacuationFormProps) {
  const [formData, setFormData] = useState({
    jenisLayanan: initialData?.jenisLayanan || '',
    jenisPesawat: initialData?.jenisPesawat || '',
    namaGroundhandling: initialData?.namaGroundhandling || '',
    namaPetugas: initialData?.namaPetugas || '',
    noTeleponKantor: initialData?.noTeleponKantor || '',
    emailPerusahaan: initialData?.emailPerusahaan || '',
    namaMaskapai: initialData?.namaMaskapai || '',
    noPenerbangan: initialData?.noPenerbangan || '',
    noKursi: initialData?.noKursi || '',
    tanggalPerjalanan: initialData?.tanggalPerjalanan || '',
    jamPerjalanan: initialData?.jamPerjalanan || '',
    namaPasien: initialData?.namaPasien || '',
    jenisKelamin: initialData?.jenisKelamin || '',
    tanggalLahir: initialData?.tanggalLahir || '',
    oksigen: initialData?.oksigen || '',
    posisiPasien: initialData?.posisiPasien || '',
    tingkatKesadaran: initialData?.tingkatKesadaran || '',
    tekananDarah: initialData?.tekananDarah || '',
    nadi: initialData?.nadi || '',
    frekuensiPernafasan: initialData?.frekuensiPernafasan || '',
    saturasiOksigen: initialData?.saturasiOksigen || '',
    jumlahPendamping: initialData?.jumlahPendamping || '',
    hubunganPasien: initialData?.hubunganPasien || '',
    namaPendamping: initialData?.namaPendamping || '',
    noTeleponPendamping: initialData?.noTeleponPendamping || '',
    noTeleponKeluarga: initialData?.noTeleponKeluarga || '',
    status: initialData?.status || 'pending',
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    fotoKondisiPasien: null,
    ktpPasien: null,
    manifetPrivateJet: null,
    rekamMedisPasien: null,
    suratRujukan: null,
    tiketPesawat: null,
    dokumentPetugasMedis: null,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    console.log('Submitting form with data:', formData);
    if (!formData.namaPasien) {
      setError('Patient name is required');
      return;
    }
    if (!formData.tanggalPerjalanan) {
      setError('Travel date is required');
      return;
    }
    try {
      const submitFormData = new FormData();

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, String(value || ''));
      });

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          submitFormData.append(key, file);
        }
      });

      await onSubmit(submitFormData);
      setSuccess(true);
      if (!initialData) {
        setFormData({
          jenisLayanan: '',
          jenisPesawat: '',
          namaGroundhandling: '',
          namaPetugas: '',
          noTeleponKantor: '',
          emailPerusahaan: '',
          namaMaskapai: '',
          noPenerbangan: '',
          noKursi: '',
          tanggalPerjalanan: '',
          jamPerjalanan: '',
          namaPasien: '',
          jenisKelamin: '',
          tanggalLahir: '',
          oksigen: '',
          posisiPasien: '',
          tingkatKesadaran: '',
          tekananDarah: '',
          nadi: '',
          frekuensiPernafasan: '',
          saturasiOksigen: '',
          jumlahPendamping: '',
          hubunganPasien: '',
          namaPendamping: '',
          noTeleponPendamping: '',
          noTeleponKeluarga: '',
          status: 'pending',
        });
        setFiles({
          fotoKondisiPasien: null,
          ktpPasien: null,
          manifetPrivateJet: null,
          rekamMedisPasien: null,
          suratRujukan: null,
          tiketPesawat: null,
          dokumentPetugasMedis: null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData
            ? 'Edit Air Medical Evacuation'
            : 'Create Air Medical Evacuation Request'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Evacuation request saved successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Service Type & Aircraft */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Jenis Layanan
              </label>
              <Select
                value={formData.jenisLayanan}
                onValueChange={(val) => handleSelectChange('jenisLayanan', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis layanan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Keberangkatan">
                    Keberangkatan (Departure)
                  </SelectItem>
                  <SelectItem value="Kedatangan">
                    Kedatangan (Arrival)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Jenis Pesawat
              </label>
              <Select
                value={formData.jenisPesawat}
                onValueChange={(val) => handleSelectChange('jenisPesawat', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis pesawat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Komersial">Komersial</SelectItem>
                  <SelectItem value="jetPribadi">Jet Pribadi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ground Handling & Company */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nama Ground Handling"
              name="namaGroundhandling"
              value={formData.namaGroundhandling}
              onChange={handleChange}
            />
            <Input
              placeholder="Nama Petugas"
              name="namaPetugas"
              value={formData.namaPetugas}
              onChange={handleChange}
            />
            <Input
              placeholder="No Telepon Kantor"
              name="noTeleponKantor"
              value={formData.noTeleponKantor}
              onChange={handleChange}
              type="tel"
            />
            <Input
              placeholder="Email Perusahaan"
              name="emailPerusahaan"
              value={formData.emailPerusahaan}
              onChange={handleChange}
              type="email"
            />
          </div>

          {/* Airlines & Flight */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Nama Maskapai"
              name="namaMaskapai"
              value={formData.namaMaskapai}
              onChange={handleChange}
            />
            <Input
              placeholder="No Penerbangan"
              name="noPenerbangan"
              value={formData.noPenerbangan}
              onChange={handleChange}
            />
            <Input
              placeholder="No Kursi"
              name="noKursi"
              value={formData.noKursi}
              onChange={handleChange}
            />
          </div>

          {/* Travel Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Perjalanan *
              </label>
              <Input
                type="date"
                name="tanggalPerjalanan"
                value={formData.tanggalPerjalanan}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              placeholder="Jam Perjalanan (HH:MM)"
              name="jamPerjalanan"
              value={formData.jamPerjalanan}
              onChange={handleChange}
              type="time"
            />
          </div>

          {/* Patient Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Informasi Pasien</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Pasien *
                </label>
                <Input
                  placeholder="Full Name"
                  name="namaPasien"
                  value={formData.namaPasien}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Jenis Kelamin
                </label>
                <Select
                  value={formData.jenisKelamin}
                  onValueChange={(val) =>
                    handleSelectChange('jenisKelamin', val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lakiLaki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="date"
                placeholder="Tanggal Lahir"
                name="tanggalLahir"
                value={formData.tanggalLahir}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Vital Signs */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Tanda-tanda Vital</h3>
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Tekanan Darah (mmHg)"
                name="tekananDarah"
                value={formData.tekananDarah}
                onChange={handleChange}
              />
              <Input
                placeholder="Nadi (bpm)"
                name="nadi"
                value={formData.nadi}
                onChange={handleChange}
              />
              <Input
                placeholder="Frekuensi Pernafasan (/min)"
                name="frekuensiPernafasan"
                value={formData.frekuensiPernafasan}
                onChange={handleChange}
              />
              <Input
                placeholder="Saturasi Oksigen (%)"
                name="saturasiOksigen"
                value={formData.saturasiOksigen}
                onChange={handleChange}
              />
              <Input
                placeholder="Tingkat Kesadaran"
                name="tingkatKesadaran"
                value={formData.tingkatKesadaran}
                onChange={handleChange}
              />
              <div>
                <Select
                  value={formData.oksigen}
                  onValueChange={(val) => handleSelectChange('oksigen', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Oksigen?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ya">Ya</SelectItem>
                    <SelectItem value="tidak">Tidak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={formData.posisiPasien}
                  onValueChange={(val) =>
                    handleSelectChange('posisiPasien', val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Posisi Pasien" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="duduk">Duduk</SelectItem>
                    <SelectItem value="berbaring">Berbaring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Companions */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Pendamping</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Jumlah Pendamping"
                name="jumlahPendamping"
                value={formData.jumlahPendamping}
                onChange={handleChange}
              />
              <div>
                <Select
                  value={formData.hubunganPasien}
                  onValueChange={(val) =>
                    handleSelectChange('hubunganPasien', val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hubungan dengan Pasien" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Keluarga">Keluarga</SelectItem>
                    <SelectItem value="Dokter">Dokter</SelectItem>
                    <SelectItem value="Perawat">Perawat</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Nama Pendamping"
                name="namaPendamping"
                value={formData.namaPendamping}
                onChange={handleChange}
              />
              <Input
                placeholder="No Telepon Pendamping"
                name="noTeleponPendamping"
                value={formData.noTeleponPendamping}
                onChange={handleChange}
                type="tel"
              />
              <Input
                placeholder="No Telepon Keluarga"
                name="noTeleponKeluarga"
                value={formData.noTeleponKeluarga}
                onChange={handleChange}
                type="tel"
              />
            </div>
          </div>

          {/* Documents Upload */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Dokumen</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(files).map((docType) => (
                <div key={docType}>
                  <label className="block text-sm font-medium mb-2 capitalize">
                    {docType.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.webp"
                      onChange={(e) =>
                        handleFileChange(docType, e.target.files?.[0] || null)
                      }
                      className="text-sm"
                    />
                    {files[docType as keyof typeof files] && (
                      <Upload className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          {isAdmin && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={formData.status}
                onValueChange={(val) => handleSelectChange('status', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Save Evacuation Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useApplications } from '@/app/context/ApplicationContext';
import { useRef } from 'react';
import { Eye } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function PermohonanPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { addApplication } = useApplications();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [currentStep, setCurrentStep] = useState(1);
  const [previewFiles, setPreviewFiles] = useState<any>({});
  const [previewModal, setPreviewModal] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewField, setPreviewField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewMimeType, setPreviewMimeType] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [formData, setFormData] = useState<any>({
    jenisLayanan: '',
    jenisPesawat: '',
    namaGroundhandling: '',
    namaPetugas: '',
    noTelepon: '',
    emailPerusahaan: '',
    namaMaskapai: '',
    noPenerbangan: '',
    noKursi: '',
    tanggalPerjalanan: '',
    jamPerjalanan: '',
    namaPasien: '',
    jenisKelamin: '',
    tanggalLahir: '',
    memerlukanOksigen: '',
    posisiPasien: '',
    tingkatKesadaran: '',
    tekananDarah: '',
    nadi: '',
    frekuensiNafas: '',
    jumlahPendamping: '',
    namaPendamping: '',
    hubunganPendamping: '',
    nomorTeleponPendampingMedis: '',
    nomorTeleponKeluarga: '',
    nosuratIzin: '',
    fotoKondisiPasien: null,
    ktpPasien: null,
    manifetPrivateJet: null,
    rekamMedisPasien: null,
    suratRujukan: null,
    tiketPesawat: null,
    dokumentPetugasMedis: null,
  });

  const t: any = {
    title: language === 'id' ? 'Form Permohonan' : 'Request Form',
    subtitle:
      language === 'id' ? 'Evakuasi Medis Udara' : 'Air Medical Evacuation',
    flightData: language === 'id' ? 'Data Penerbangan' : 'Flight Data',
    patientData: language === 'id' ? 'Data Pasien' : 'Patient Data',
    patientCondition:
      language === 'id' ? 'Kondisi Pasien' : 'Patient Condition',
    companionData: language === 'id' ? 'Data Pendamping' : 'Companion Data',
    uploadDocuments: language === 'id' ? 'Upload Dokumen' : 'Upload Documents',

    /* Data Penerbangan */
    serviceType: language === 'id' ? 'Jenis Layanan' : 'Service Type',
    aircraftType: language === 'id' ? 'Jenis Pesawat' : 'Aircraft Type',
    saveDraft: language === 'id' ? 'Simpan Draft' : 'Save Draft',
    previous: language === 'id' ? 'Sebelumnya' : 'Previous',
    next: language === 'id' ? 'Selanjutnya' : 'Next',
    submit: language === 'id' ? 'Submit' : 'Submit',
    serviceTypePlaceholder:
      language === 'id' ? 'Pilih jenis layanan' : 'Select service type',
    departure: language === 'id' ? 'Keberangkatan' : 'Departure',
    arrival: language === 'id' ? 'Kedatangan' : 'Arrival',
    aircraftTypePlaceholder:
      language === 'id' ? 'Pilih jenis pesawat' : 'Select aircraft type',
    commercial: language === 'id' ? 'Komersial' : 'Commercial',
    privateJet: language === 'id' ? 'Pribadi' : 'Private Jet',
    groundhandlingName:
      language === 'id' ? 'Nama Groundhandling' : 'Groundhandling Name',
    officerName: language === 'id' ? 'Nama Petugas' : 'Officer Name',
    officePhone: language === 'id' ? 'No Telepon Kantor' : 'Office Phone',
    companyEmail: language === 'id' ? 'Email Perusahaan' : 'Company Email',
    airlineName: language === 'id' ? 'Nama Maskapai' : 'Airline Name',
    airlineExample:
      language === 'id'
        ? 'Contoh: Garuda Indonesia - PK-GII'
        : 'Example: Garuda Indonesia - PK-GII',
    flightNumber: language === 'id' ? 'No Penerbangan' : 'Flight Number',
    flightExample:
      language === 'id'
        ? 'Contoh: GA 330 CGK to KNO'
        : 'Example: GA 330 CGK to KNO',
    seatNumber: language === 'id' ? 'No Kursi' : 'Seat Number',
    seatNote:
      language === 'id'
        ? 'Opsional, jika ingin menyertakan nomor kursi pasien'
        : "Optional, if you want to include patient's seat number",
    travelDate: language === 'id' ? 'TanggalPerjalanan' : 'Travel Date',
    travelTime: language === 'id' ? 'Jam Perjalanan' : 'Travel Time',

    /* Data Pasien */
    patientName: language === 'id' ? 'Nama Pasien' : 'Patient Name',
    gender: language === 'id' ? 'Jenis Kelamin' : 'Gender',
    tanggalLahir: language === 'id' ? 'Tanggal Lahir' : 'Date of Birth',

    /* Kondisi Pasien */
    memerlukanOksigen:
      language === 'id' ? 'Memerlukan Oksigen' : 'Requires Oxygen',
    posisiPasien: language === 'id' ? 'Posisi Pasien' : 'Patient Position',
    tingkatKesadaran:
      language === 'id' ? 'Tingkat Kesadaran' : 'Level of Consciousness',
    tekananDarah: language === 'id' ? 'Tekanan Darah' : 'Blood Pressure',
    tekananDarahExample:
      language === 'id' ? 'Contoh: 120/80 mmHg' : 'Example: 120/80 mmHg',
    nadiExample: language === 'id' ? 'Contoh: 80 bpm' : 'Example: 80 bpm',
    FrekuensiNafasExample:
      language === 'id' ? 'Contoh: 16 bpm' : 'Example: 16 bpm',
    saturasiOksigenExample: language === 'id' ? 'Contoh: 98%' : 'Example: 98%',
    tingkatKesadaranExample:
      language === 'id' ? 'Contoh: skor 3-15' : 'Example: score 3-15',
    nadi: language === 'id' ? 'Nadi' : 'Pulse',
    frekuensiNafas: language === 'id' ? 'Frekuensi Nafas' : 'Respiratory Rate',
    saturasiOksigen:
      language === 'id' ? 'Saturasi Oksigen' : 'Oxygen Saturation',

    /* Data Pendamping */
    jumlahPendamping:
      language === 'id' ? 'Jumlah Pendamping' : 'Number of Companions',
    hubungandenganPasien:
      language === 'id' ? 'Hubungan dengan Pasien' : 'Relationship to Patient',
    nomorTeleponPendampingMedis:
      language === 'id'
        ? 'Nomor Telepon Pendamping Medis'
        : 'Medical Companion Phone Number',
    nomorTeleponKeluarga:
      language === 'id' ? 'Nomor Telepon Keluarga' : 'Family Phone Number',
    nosuratIzin:
      language === 'id' ? 'No Surat Izin Praktik ' : 'Permit Letter Number',
    namaPendamping: language === 'id' ? 'Nama Pendamping' : 'Companion Name',
    nosuratIzinExample:
      language === 'id'
        ? 'Contoh: Nama Tenaga medis- No SIP'
        : 'Example: Medical Personnel Name - Permit Number',
    /* New Document Labels */
    practiceLicense:
      language === 'id'
        ? 'Surat Izin praktik pendamping medis yang berlaku valid (yang berlaku)'
        : 'Valid medical companion practice license',
    referralLetter:
      language === 'id'
        ? 'Surat Rujukan / Surat penerimaan dari rumah sakit tujuan'
        : 'Referral Letter / Acceptance letter from destination hospital',
    manifestTicket:
      language === 'id'
        ? 'Manifest / Tiket Pesawat untuk komersil  (Nomor pernerbangan dan rute perjalanan)'
        : 'Manifest / Flight Ticket for commercial (Flight number and route)',
    medicalOfficerDoc:
      language === 'id'
        ? 'Dokumen Petugas Medis (Sertifikat Pelatihan kegawat daruratan / Keahlian Medivac)'
        : 'Medical Officer Documents (Emergency Training Certificate / Medivac Expertise)',
  };

  /* ===============================
  STEPS
  =============================== */

  const steps: any = {
    id: [
      { id: 1, name: 'Data Penerbangan' },
      { id: 2, name: 'Data Pasien' },
      { id: 3, name: 'Kondisi Pasien' },
      { id: 4, name: 'Data Pendamping' },
      { id: 5, name: 'Upload Dokumen' },
    ],

    en: [
      { id: 1, name: 'Flight Data' },
      { id: 2, name: 'Patient Data' },
      { id: 3, name: 'Patient Condition' },
      { id: 4, name: 'Companion Data' },
      { id: 5, name: 'Upload Documents' },
    ],
  };

  /* ===============================
  FUNCTION
  =============================== */

  function toggleLanguage() {
    setLanguage(language === 'id' ? 'en' : 'id');
  }

  function updateField(field: string, value: any) {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }

  function nextStep() {
    const errors: string[] = [];

    if (currentStep === 1 && !formData.tanggalPerjalanan) {
      errors.push('Tanggal perjalanan wajib diisi');
    }
    if (currentStep === 1 && !formData.jamPerjalanan) {
      errors.push('Jam perjalanan wajib diisi');
    }
    if (currentStep === 2 && !formData.namaPasien) {
      errors.push('Nama pasien wajib diisi');
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      setShowErrorModal(true);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleSaveDraft() {
    console.log('SAVE DRAFT', formData);
    alert('Draft saved');
  }

  async function handleSubmit() {
    const errors: string[] = [];
    if (!formData.tanggalPerjalanan)
      errors.push('Tanggal perjalanan wajib diisi');
    if (!formData.namaPasien) errors.push('Nama pasien wajib diisi');

    if (errors.length > 0) {
      setErrorMessages(errors);
      setShowErrorModal(true);
      return;
    }

    try {
      setLoadingSubmit(true);
      const data = new FormData();

      /* DATA PENERBANGAN */
      data.append('jenisLayanan', formData.jenisLayanan || '');
      data.append('jenisPesawat', formData.jenisPesawat || '');
      data.append('namaGroundhandling', formData.namaGroundhandling || '');
      data.append('namaPetugas', formData.namaPetugas || '');
      data.append('noTeleponKantor', formData.noTelepon || '');
      data.append('emailPerusahaan', formData.emailPerusahaan || '');

      data.append('namaMaskapai', formData.namaMaskapai || '');
      data.append('noPenerbangan', formData.noPenerbangan || '');
      data.append('noKursi', formData.noKursi || '');

      data.append('tanggalPerjalanan', formData.tanggalPerjalanan || '');
      data.append('jamPerjalanan', formData.jamPerjalanan || '');

      /* DATA PASIEN */

      data.append('namaPasien', formData.namaPasien || '');
      data.append('jenisKelamin', formData.jenisKelamin || '');
      data.append('tanggalLahir', formData.tanggalLahir || '');

      /* KONDISI PASIEN */

      data.append('oksigen', formData.memerlukanOksigen || '');
      data.append('posisiPasien', formData.posisiPasien || '');
      data.append('tingkatKesadaran', formData.tingkatKesadaran || '');

      data.append('tekananDarah', formData.tekananDarah || '');
      data.append('nadi', formData.nadi || '');
      data.append('frekuensiPernafasan', formData.frekuensiNafas || '');
      data.append('saturasiOksigen', formData.saturasiOksigen || '');

      /* DATA PENDAMPING */

      data.append('jumlahPendamping', formData.jumlahPendamping || '');
      data.append('namaPendamping', formData.namaPendamping || '');
      data.append('hubunganPasien', formData.hubunganPendamping || '');

      data.append(
        'noTeleponPendamping',
        formData.nomorTeleponPendampingMedis || '',
      );
      data.append('noTeleponKeluarga', formData.nomorTeleponKeluarga || '');
      data.append('noTeleponKeluarga', formData.nosuratIzin || '');

      data.append('fotoKondisiPasien', formData.fotoKondisiPasien || '');
      data.append('ktpPasien', formData.ktpPasien || '');
      data.append('manifetPrivateJet', formData.manifetPrivateJet || '');
      data.append('rekamMedisPasien', formData.rekamMedisPasien || '');
      data.append('suratRujukan', formData.suratRujukan || '');
      data.append('tiketPesawat', formData.tiketPesawat || '');
      data.append('dokumentPetugasMedis', formData.dokumentPetugasMedis || '');

      const res = await fetch('/api/evacuations', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Submit gagal');
      }

      /* TAMPILKAN MODAL SUKSES */
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat submit');
    }
  }

  async function handleUpload(file: File, field: string) {
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('fileType', field);

      const res = await fetch('/api/upload/medical-document', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      const filePath = result.data.path;

      setFormData((prev: any) => ({
        ...prev,
        [field]: filePath,
      }));

      // simpan preview
      setPreviewFiles((prev: any) => ({
        ...prev,
        [field]: filePath,
      }));

      console.log('UPLOAD SUCCESS:', field, filePath);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }

  function resetForm() {
    setFormData({
      jenisLayanan: '',
      jenisPesawat: '',
      namaGroundhandling: '',
      namaPetugas: '',
      noTelepon: '',
      emailPerusahaan: '',
      namaMaskapai: '',
      noPenerbangan: '',
      noKursi: '',
      tanggalPerjalanan: '',
      jamPerjalanan: '',
      namaPasien: '',
      jenisKelamin: '',
      tanggalLahir: '',
      memerlukanOksigen: '',
      posisiPasien: '',
      tingkatKesadaran: '',
      tekananDarah: '',
      nadi: '',
      frekuensiNafas: '',
      saturasiOksigen: '',
      jumlahPendamping: '',
      namaPendamping: '',
      hubunganPendamping: '',
      nomorTeleponPendampingMedis: '',
      nomorTeleponKeluarga: '',
      nosuratIzin: '',
    });
    setCurrentStep(1);
  }

  function handlePreview(file: File, field: string) {
    const previewUrl = URL.createObjectURL(file);

    setPreviewFileUrl(previewUrl);
    setSelectedFile(file);
    setPreviewField(field);
    setPreviewMimeType(file.type || null);
    setPreviewModal(true);
  }

  async function confirmUpload() {
    if (!selectedFile || !previewField) return;

    try {
      const data = new FormData();

      data.append('file', selectedFile);
      data.append('fileType', previewField);

      const res = await fetch('/api/upload/medical-document', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      setFormData((prev: any) => ({
        ...prev,
        [previewField]: result.data.path,
      }));

      // hanya tutup modal
      setPreviewModal(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }

  function openUploadedPreview(fileUrl: string) {
    setPreviewFileUrl(fileUrl);
    setSelectedFile(null);
    setPreviewField(null);
    setPreviewMimeType(
      fileUrl.toLowerCase().includes('.pdf') ? 'application/pdf' : null,
    );
    setPreviewModal(true);
  }

  function resetPreview() {
    setPreviewModal(false);
    setPreviewFileUrl(null);
    setSelectedFile(null);
    setPreviewField(null);
    setPreviewMimeType(null);

    // RESET INPUT FILE
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const isPdfPreview =
    previewMimeType === 'application/pdf' ||
    (!!previewFileUrl && previewFileUrl.toLowerCase().includes('.pdf'));

  if (authLoading) return null;

  /* ===============================
  RETURN
  =============================== */

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Language */}
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={toggleLanguage}>
            <Globe className="size-4 mr-2" />
            {language === 'id' ? 'English' : 'Bahasa Indonesia'}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-center mb-10">
          {steps[language].map((step: any, index: number) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200',
                  )}
                >
                  {currentStep > step.id ? <Check size={18} /> : step.id}
                </div>
                <p className="text-xs mt-2">{step.name}</p>
              </div>
              {index !== 4 && (
                <div
                  className={cn(
                    'w-20 h-1 mx-2',
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200',
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* FORM */}
        <div className="bg-white p-8 rounded-lg shadow">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t.flightData}
              </h2>
              <div className="space-y-4">
                {/* Jenis Layanan */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="jenisLayanan"
                      className="text-sm text-gray-700"
                    >
                      {t.serviceType}
                    </Label>
                    <Select
                      value={formData.jenisLayanan || ''}
                      onValueChange={(value) =>
                        updateField('jenisLayanan', value)
                      }
                    >
                      <SelectTrigger
                        id="jenisLayanan"
                        className="mt-1.5 w-full"
                      >
                        <SelectValue placeholder={t.serviceTypePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keberangkatan">
                          Keberangkatan
                        </SelectItem>

                        <SelectItem value="kedatangan">Kedatangan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Jenis Pesawat */}
                <div>
                  <Label
                    htmlFor="jenisPesawat"
                    className="text-sm text-gray-700"
                  >
                    {t.aircraftType}
                  </Label>

                  <Select
                    value={formData.jenisPesawat}
                    onValueChange={(value) =>
                      updateField('jenisPesawat', value)
                    }
                  >
                    <SelectTrigger id="jenisPesawat" className="mt-1.5 w-full">
                      <SelectValue placeholder={t.aircraftTypePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="komersial">{t.commercial}</SelectItem>
                      <SelectItem value="jetPribadi">{t.privateJet}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Nama Groundhandling */}
                <div>
                  <Label
                    htmlFor="namaGroundhandling"
                    className="text-sm text-gray-700"
                  >
                    {t.groundhandlingName}
                  </Label>
                  <Input
                    id="namaGroundhandling"
                    value={formData.namaGroundhandling}
                    onChange={(e) =>
                      updateField('namaGroundhandling', e.target.value)
                    }
                    className="mt-1.5"
                  />
                </div>

                {/* Nama Petugas */}
                <div>
                  <Label
                    htmlFor="namaPetugas"
                    className="text-sm text-gray-700"
                  >
                    {t.officerName}
                  </Label>
                  <Input
                    id="namaPetugas"
                    value={formData.namaPetugas}
                    onChange={(e) => updateField('namaPetugas', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                {/* No Telepon */}
                <div>
                  <Label htmlFor="noTelepon" className="text-sm text-gray-700">
                    {t.officePhone}
                  </Label>
                  <Input
                    id="noTelepon"
                    type="tel"
                    value={formData.noTelepon}
                    onChange={(e) => updateField('noTelepon', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label
                    htmlFor="emailPerusahaan"
                    className="text-sm text-gray-700"
                  >
                    {t.companyEmail}
                  </Label>
                  <Input
                    id="emailPerusahaan"
                    type="email"
                    value={formData.emailPerusahaan}
                    onChange={(e) =>
                      updateField('emailPerusahaan', e.target.value)
                    }
                    className="mt-1.5"
                  />
                </div>

                {/* Maskapai */}
                <div>
                  <Label
                    htmlFor="namaMaskapai"
                    className="text-sm text-gray-700"
                  >
                    {t.airlineName}
                  </Label>
                  <Input
                    id="namaMaskapai"
                    value={formData.namaMaskapai}
                    onChange={(e) =>
                      updateField('namaMaskapai', e.target.value)
                    }
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t.airlineExample}
                  </p>
                </div>

                {/* No Penerbangan */}
                <div>
                  <Label
                    htmlFor="noPenerbangan"
                    className="text-sm text-gray-700"
                  >
                    {t.flightNumber}
                  </Label>
                  <Input
                    id="noPenerbangan"
                    value={formData.noPenerbangan}
                    onChange={(e) =>
                      updateField('noPenerbangan', e.target.value)
                    }
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t.flightExample}
                  </p>
                </div>

                {/* No Kursi */}
                <div>
                  <Label htmlFor="noKursi" className="text-sm text-gray-700">
                    {t.seatNumber}
                  </Label>
                  <Input
                    id="noKursi"
                    value={formData.noKursi}
                    onChange={(e) => updateField('noKursi', e.target.value)}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.seatNote}</p>
                </div>

                {/* Tanggal & Jam */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="tanggalPerjalanan"
                      className="text-sm text-gray-700"
                    >
                      {t.travelDate}{' '}
                      <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input
                      id="tanggalPerjalanan"
                      type="date"
                      value={formData.tanggalPerjalanan}
                      onChange={(e) =>
                        updateField('tanggalPerjalanan', e.target.value)
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="jamPerjalanan"
                      className="text-sm text-gray-700"
                    >
                      {t.travelTime}
                    </Label>
                    <Input
                      id="jamPerjalanan"
                      type="time"
                      value={formData.jamPerjalanan}
                      onChange={(e) =>
                        updateField('jamPerjalanan', e.target.value)
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t.patientData}
              </h2>
              {/* Nama Pasien */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="namaPasien" className="text-sm text-gray-700">
                    {t.patientName}{' '}
                    <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="namaPasien"
                    value={formData.namaPasien}
                    onChange={(e) => updateField('namaPasien', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <Label htmlFor="jenisKelamin">{t.gender}</Label>
                  <Select
                    value={formData.jenisKelamin}
                    onValueChange={(value) =>
                      updateField('jenisKelamin', value)
                    }
                  >
                    <SelectTrigger id="jenisKelamin" className="mt-1.5 w-full">
                      <SelectValue placeholder={t.gender} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LakiLaki">
                        {language === 'id' ? 'Laki-laki' : 'Male'}
                      </SelectItem>
                      <SelectItem value="Perempuan">
                        {language === 'id' ? 'Perempuan' : 'Female'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <Label htmlFor="tanggalLahir">{t.tanggalLahir}</Label>
                  <Input
                    id="tanggalLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) =>
                      updateField('tanggalLahir', e.target.value)
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t.patientCondition}
              </h2>

              {/* Memerlukan Oksigen */}
              <div>
                <Label
                  htmlFor="memerlukanOksigen"
                  className="text-sm text-gray-700"
                >
                  {t.memerlukanOksigen}
                </Label>
                <Select
                  value={formData.memerlukanOksigen}
                  onValueChange={(value) =>
                    updateField('memerlukanOksigen', value)
                  }
                >
                  <SelectTrigger
                    id="memerlukanOksigen"
                    className="mt-1.5 w-full"
                  >
                    <SelectValue placeholder={t.memerlukanOksigen} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ya">
                      {language === 'id' ? 'Ya' : 'Yes'}
                    </SelectItem>
                    <SelectItem value="tidak">
                      {language === 'id' ? 'Tidak' : 'No'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Posisi Pasien */}
              <div>
                <Label htmlFor="posisiPasien" className="text-sm text-gray-700">
                  {t.posisiPasien}
                </Label>
                <Select
                  value={formData.posisiPasien}
                  onValueChange={(value) => updateField('posisiPasien', value)}
                >
                  <SelectTrigger id="posisiPasien" className="mt-1.5 w-full">
                    <SelectValue placeholder={t.posisiPasien} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="duduk">
                      {language === 'id' ? 'Duduk' : 'Lie Down'}
                    </SelectItem>
                    <SelectItem value="berbaring">
                      {language === 'id' ? 'Berbaring' : 'Sitting'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tingkat Kesadaran */}
              <div>
                <Label
                  htmlFor="tingkatKesadaran"
                  className="text-sm text-gray-700"
                >
                  {t.tingkatKesadaran}
                </Label>
                <Input
                  id="tingkatKesadaran"
                  value={formData.tingkatKesadaran}
                  onChange={(e) =>
                    updateField('tingkatKesadaran', e.target.value)
                  }
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.tingkatKesadaranExample}
                </p>
              </div>

              {/* Tekanan Darah */}
              <div>
                <Label htmlFor="tekananDarah" className="text-sm text-gray-700">
                  {t.tekananDarah}
                </Label>
                <Input
                  id="tekananDarah"
                  value={formData.tekananDarah}
                  onChange={(e) => updateField('tekananDarah', e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.tekananDarahExample}
                </p>
              </div>

              {/* Nadi */}
              <div>
                <Label htmlFor="nadi" className="text-sm text-gray-700">
                  {t.nadi}
                </Label>
                <Input
                  id="nadi"
                  value={formData.nadi}
                  onChange={(e) => updateField('nadi', e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">{t.nadiExample}</p>
              </div>

              {/* Frekuensi Nafas */}
              <div>
                <Label
                  htmlFor="frekuensiNafas"
                  className="text-sm text-gray-700"
                >
                  {t.frekuensiNafas}
                </Label>
                <Input
                  id="frekuensiNafas"
                  value={formData.frekuensiNafas}
                  onChange={(e) =>
                    updateField('frekuensiNafas', e.target.value)
                  }
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.FrekuensiNafasExample}
                </p>
              </div>

              {/* Saturasi Oksigen */}
              <div>
                <Label
                  htmlFor="saturasiOksigen"
                  className="text-sm text-gray-700"
                >
                  {t.saturasiOksigen}
                </Label>
                <Input
                  id="saturasiOksigen"
                  value={formData.saturasiOksigen}
                  onChange={(e) =>
                    updateField('saturasiOksigen', e.target.value)
                  }
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.saturasiOksigenExample}
                </p>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t.companionData}
              </h2>

              {/* Jumlah Pendamping */}
              <div>
                <Label
                  htmlFor="jumlahPendamping"
                  className="text-sm text-gray-700"
                >
                  {t.jumlahPendamping}
                </Label>
                <Input
                  id="jumlahPendamping"
                  type="number"
                  value={formData.jumlahPendamping}
                  onChange={(e) =>
                    updateField('jumlahPendamping', e.target.value)
                  }
                  className="mt-1.5"
                />
              </div>

              {/* Hubungan dengan Pasien */}
              <div>
                <Label
                  htmlFor="hubunganPendamping"
                  className="text-sm text-gray-700"
                >
                  {t.hubungandenganPasien}
                </Label>
                <Select
                  value={formData.hubunganPendamping}
                  onValueChange={(value) =>
                    updateField('hubunganPendamping', value)
                  }
                >
                  <SelectTrigger
                    id="hubunganPendamping"
                    className="mt-1.5 w-full"
                  >
                    <SelectValue placeholder={t.hubungandenganPasien} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Keluarga">Keluarga</SelectItem>
                    <SelectItem value="Dokter">Dokter</SelectItem>
                    <SelectItem value="Perawat">Perawat</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nama Pendamping */}
              <div>
                <Label
                  htmlFor="namaPendamping"
                  className="text-sm text-gray-700"
                >
                  {t.namaPendamping}
                </Label>
                <Input
                  id="namaPendamping"
                  value={formData.namaPendamping}
                  onChange={(e) =>
                    updateField('namaPendamping', e.target.value)
                  }
                  className="mt-1.5"
                />
              </div>

              {/* Nomor Telepon Pendamping Medis */}
              <div>
                <Label
                  htmlFor="nomorTeleponPendampingMedis"
                  className="text-sm text-gray-700"
                >
                  {t.nomorTeleponPendampingMedis}
                </Label>
                <Input
                  id="nomorTeleponPendampingMedis"
                  type="number"
                  min={1}
                  value={formData.nomorTeleponPendampingMedis}
                  onChange={(e) =>
                    updateField('nomorTeleponPendampingMedis', e.target.value)
                  }
                  className="mt-1.5"
                />
              </div>

              {/* Nomor Telepon Keluarga */}
              <div>
                <Label
                  htmlFor="nomorTeleponKeluarga"
                  className="text-sm text-gray-700"
                >
                  {t.nomorTeleponKeluarga}
                </Label>
                <Input
                  id="nomorTeleponKeluarga"
                  type="number"
                  min={1}
                  value={formData.nomorTeleponKeluarga}
                  onChange={(e) =>
                    updateField('nomorTeleponKeluarga', e.target.value)
                  }
                  className="mt-1.5"
                />
              </div>
              {/* No Surat Izin Praktik */}
              <div>
                <Label htmlFor="nosuratIzin" className="text-sm text-gray-700">
                  {t.nosuratIzin}
                </Label>
                <Input
                  id="nosuratIzin"
                  value={formData.nosuratIzin}
                  onChange={(e) => updateField('nosuratIzin', e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.nosuratIzinExample}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">{t.uploadDocuments}</h2>

              {/* Surat Izin Praktik */}
              <div>
                <Label className="mb-1 block">{t.practiceLicense}</Label>
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Input
                      required
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="text-sm border-none p-0 file:mr-3 file:px-3 file:py-1 file:border file:rounded file:bg-gray-200 file:text-sm file:cursor-pointer hover:file:bg-gray-300"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // hanya upload
                        handlePreview(file, 'noSuratPraktik');
                      }}
                    />
                  </div>

                  {/* ICON PREVIEW */}
                  {formData.noSuratPraktik && (
                    <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        // modal hanya muncul dari sini
                        setPreviewFileUrl(formData.noSuratPraktik);
                        setPreviewModal(true);
                        openUploadedPreview(formData.noSuratPraktik);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Foto Kondisi Pasien */}
              <div>
                <Label className="mb-1 block">Foto Kondisi Pasien</Label>
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Input
                      required
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="text-sm border-none p-0 file:mr-3 file:px-3 file:py-1 file:border file:rounded file:bg-gray-200 file:text-sm file:cursor-pointer hover:file:bg-gray-300"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // hanya upload
                        handlePreview(file, 'fotoKondisiPasien');
                      }}
                    />
                  </div>

                  {/* ICON PREVIEW */}
                  {formData.fotoKondisiPasien && (
                    <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        // modal hanya muncul dari sini
                        setPreviewFileUrl(formData.fotoKondisiPasien);
                        setPreviewModal(true);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* KTP Pasien */}
              <div>
                <Label className="mb-1 block">KTP Pasien</Label>
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="text-sm border-none p-0 file:mr-3 file:px-3 file:py-1 file:border file:rounded file:bg-gray-200 file:text-sm file:cursor-pointer hover:file:bg-gray-300"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // hanya upload
                        handlePreview(file, 'ktpPasien');
                      }}
                    />
                  </div>

                  {/* ICON PREVIEW */}
                  {formData.ktpPasien && (
                    <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        // modal hanya muncul dari sini
                        setPreviewFileUrl(formData.ktpPasien);
                        setPreviewModal(true);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Manifest / Tiket Pesawat */}
              <div>
                <Label className="mb-1 block">{t.manifestTicket}</Label>
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="text-sm border-none p-0 file:mr-3 file:px-3 file:py-1 file:border file:rounded file:bg-gray-200 file:text-sm file:cursor-pointer hover:file:bg-gray-300"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // hanya upload
                        handlePreview(file, 'manifetPrivateJet');
                      }}
                    />
                  </div>

                  {/* ICON PREVIEW */}
                  {formData.manifetPrivateJet && (
                    <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        // modal hanya muncul dari sini
                        setPreviewFileUrl(formData.manifetPrivateJet);
                        setPreviewModal(true);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Rekam Medis Pasien */}
              <div>
                <Label className="mb-1 block">Rekam Medis Pasien</Label>
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="text-sm border-none p-0 file:mr-3 file:px-3 file:py-1 file:border file:rounded file:bg-gray-200 file:text-sm file:cursor-pointer hover:file:bg-gray-300"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // hanya upload
                        handlePreview(file, 'rekamMedisPasien');
                      }}
                    />
                  </div>

                  {/* ICON PREVIEW */}
                  {formData.rekamMedisPasien && (
                    <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        // modal hanya muncul dari sini
                        setPreviewFileUrl(formData.rekamMedisPasien);
                        setPreviewModal(true);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Surat Rujukan */}
              <div>
                <Label className="mb-1 block">{t.referralLetter}</Label>
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Input
                      ref={fileInputRef}
                      required
                      type="file"
                      accept="image/*,application/pdf"
                      className="text-sm border-none p-0 file:mr-3 file:px-3 file:py-1 file:border file:rounded file:bg-gray-200 file:text-sm file:cursor-pointer hover:file:bg-gray-300"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // hanya upload
                        handlePreview(file, 'suratRujukan');
                      }}
                    />
                  </div>

                  {/* ICON PREVIEW */}
                  {formData.suratRujukan && (
                    <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        // modal hanya muncul dari sini
                        setPreviewFileUrl(formData.suratRujukan);
                        setPreviewModal(true);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Dokumen Petugas Medis */}
              <div>
                <Label className="mb-1 block">{t.medicalOfficerDoc}</Label>
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="text-sm border-none p-0 file:mr-3 file:px-3 file:py-1 file:border file:rounded file:bg-gray-200 file:text-sm file:cursor-pointer hover:file:bg-gray-300"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // hanya upload
                        handlePreview(file, 'dokumentPetugasMedis');
                      }}
                    />
                  </div>

                  {/* ICON PREVIEW */}
                  {formData.dokumentPetugasMedis && (
                    <button
                      type="button"
                      className="p-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        // modal hanya muncul dari sini
                        setPreviewFileUrl(formData.dokumentPetugasMedis);
                        setPreviewModal(true);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleSaveDraft}>
              {t.saveDraft}
            </Button>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  {t.previous}
                </Button>
              )}

              {currentStep < 5 ? (
                <Button onClick={nextStep}>{t.next}</Button>
              ) : (
                <Button onClick={handleSubmit}>{t.submit}</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL BERHASIL SUBMIT */}

      <Dialog open={previewModal} onOpenChange={setPreviewModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Preview Dokumen</DialogTitle>
            <DialogDescription>
              Apakah anda yakin dengan file ini?
            </DialogDescription>
          </DialogHeader>

          {previewFileUrl && (
            <div className="flex justify-center">
              {isPdfPreview ? (
                <iframe
                  src={previewFileUrl}
                  className="w-full h-96 border rounded"
                />
              ) : (
                <img src={previewFileUrl} className="max-h-96 border rounded" />
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={resetPreview}>
              Upload Ulang
            </Button>

            <Button onClick={confirmUpload}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600 text-xl font-bold">
              Permohonan Berhasil
            </DialogTitle>

            <DialogDescription className="text-center">
              Permohonan berhasil dikirim. Silakan menunggu proses verifikasi
              dari admin.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center mt-6">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                resetForm();
              }}
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-red-600 text-xl font-bold">
              Data Belum Lengkap
            </DialogTitle>
            <DialogDescription className="text-center">
              Berikut adalah field yang wajib diisi:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            {errorMessages.map((msg, idx) => (
              <div
                key={idx}
                className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                <span className="text-red-700 text-sm font-medium">{msg}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button
              className="bg-red-600 hover:bg-red-700 font-bold"
              onClick={() => setShowErrorModal(false)}
            >
              Lengkapi Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

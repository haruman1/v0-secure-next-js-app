'use client';

import { useState, useRef } from 'react';
import {
  Check,
  Eye,
  UploadCloud,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save
} from 'lucide-react';
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

import { useLanguage } from '@/app/context/language-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useApplications } from '@/app/context/ApplicationContext';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function PermohonanPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { addApplication } = useApplications();

  const { language, setLanguage } = useLanguage();

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
    saturasiOksigen: '',

    jumlahPendamping: '',
    namaPendamping: '',
    hubunganPendamping: '',
    nomorTeleponPendampingMedis: '',
    nomorTeleponKeluarga: '',
    nosuratIzin: '',

    noSuratPraktik: null,
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
    subtitle: language === 'id' ? 'Evakuasi Medis Udara' : 'Air Medical Evacuation',

    flightData: language === 'id' ? 'Data Penerbangan' : 'Flight Data',
    patientData: language === 'id' ? 'Data Pasien' : 'Patient Data',
    patientCondition: language === 'id' ? 'Kondisi Pasien' : 'Patient Condition',
    companionData: language === 'id' ? 'Data Pendamping' : 'Companion Data',
    uploadDocuments: language === 'id' ? 'Upload Dokumen' : 'Upload Documents',

    serviceType: language === 'id' ? 'Jenis Layanan' : 'Service Type',
    aircraftType: language === 'id' ? 'Jenis Pesawat' : 'Aircraft Type',
    saveDraft: language === 'id' ? 'Simpan Draft' : 'Save Draft',
    previous: language === 'id' ? 'Kembali' : 'Previous',
    next: language === 'id' ? 'Lanjut' : 'Next',
    submit: language === 'id' ? 'Kirim Permohonan' : 'Submit Request',
    loading: language === 'id' ? 'Memproses...' : 'Processing...',
    serviceTypePlaceholder: language === 'id' ? 'Pilih jenis layanan' : 'Select service type',
    departure: language === 'id' ? 'Keberangkatan' : 'Departure',
    arrival: language === 'id' ? 'Kedatangan' : 'Arrival',
    aircraftTypePlaceholder: language === 'id' ? 'Pilih jenis pesawat' : 'Select aircraft type',
    commercial: language === 'id' ? 'Komersial' : 'Commercial',
    privateJet: language === 'id' ? 'Pribadi' : 'Private Jet',

    groundhandlingName: language === 'id' ? 'Nama Groundhandling' : 'Groundhandling Name',
    officerName: language === 'id' ? 'Nama Petugas' : 'Officer Name',
    officePhone: language === 'id' ? 'No Telepon Kantor' : 'Office Phone',
    companyEmail: language === 'id' ? 'Email Perusahaan' : 'Company Email',
    airlineName: language === 'id' ? 'Nama Maskapai' : 'Airline Name',
    airlineExample: language === 'id' ? 'Contoh: Garuda Indonesia' : 'Example: Garuda Indonesia',
    flightNumber: language === 'id' ? 'No Penerbangan' : 'Flight Number',
    flightExample: language === 'id' ? 'Contoh: GA 330' : 'Example: GA 330',
    seatNumber: language === 'id' ? 'No Kursi' : 'Seat Number',
    seatNote: language === 'id' ? 'Opsional' : 'Optional',
    travelDate: language === 'id' ? 'Tanggal Perjalanan' : 'Travel Date',
    travelTime: language === 'id' ? 'Jam Perjalanan' : 'Travel Time',

    patientName: language === 'id' ? 'Nama Pasien' : 'Patient Name',
    gender: language === 'id' ? 'Jenis Kelamin' : 'Gender',
    tanggalLahir: language === 'id' ? 'Tanggal Lahir' : 'Date of Birth',
    male: language === 'id' ? 'Laki-laki' : 'Male',
    female: language === 'id' ? 'Perempuan' : 'Female',

    memerlukanOksigen: language === 'id' ? 'Memerlukan Oksigen' : 'Requires Oxygen',
    posisiPasien: language === 'id' ? 'Posisi Pasien' : 'Patient Position',
    tingkatKesadaran: language === 'id' ? 'Tingkat Kesadaran' : 'Level of Consciousness',
    tekananDarah: language === 'id' ? 'Tekanan Darah' : 'Blood Pressure',
    tekananDarahExample: language === 'id' ? '120/80 mmHg' : '120/80 mmHg',
    nadiExample: language === 'id' ? '80 bpm' : '80 bpm',
    frekuensiNafasExample: language === 'id' ? '16 bpm' : '16 bpm',
    saturasiOksigenExample: language === 'id' ? '98%' : '98%',
    tingkatKesadaranExample: language === 'id' ? 'Skor 3-15' : 'Score 3-15',
    nadi: language === 'id' ? 'Nadi' : 'Pulse',
    frekuensiNafas: language === 'id' ? 'Frekuensi Nafas' : 'Respiratory Rate',
    saturasiOksigen: language === 'id' ? 'Saturasi Oksigen' : 'Oxygen Saturation',
    yes: language === 'id' ? 'Ya' : 'Yes',
    no: language === 'id' ? 'Tidak' : 'No',
    sitting: language === 'id' ? 'Duduk' : 'Sitting',
    lying: language === 'id' ? 'Berbaring' : 'Lying Down',

    jumlahPendamping: language === 'id' ? 'Jumlah Pendamping' : 'Number of Companions',
    hubungandenganPasien: language === 'id' ? 'Hubungan dengan Pasien' : 'Relationship to Patient',
    nomorTeleponPendampingMedis: language === 'id' ? 'No. Telp Pendamping Medis' : 'Medical Companion Phone',
    nomorTeleponKeluarga: language === 'id' ? 'No. Telp Keluarga' : 'Family Phone Number',
    nosuratIzin: language === 'id' ? 'No Surat Izin Praktik' : 'Permit Letter Number',
    namaPendamping: language === 'id' ? 'Nama Pendamping' : 'Companion Name',
    nosuratIzinExample: language === 'id' ? 'Contoh: No SIP' : 'Example: Permit Number',

    family: language === 'id' ? 'Keluarga' : 'Family',
    doctor: language === 'id' ? 'Dokter' : 'Doctor',
    nurse: language === 'id' ? 'Perawat' : 'Nurse',
    other: language === 'id' ? 'Lainnya' : 'Other',

    practiceLicense: language === 'id' ? 'Surat Izin Praktik Pendamping' : 'Companion Practice License',
    referralLetter: language === 'id' ? 'Surat Rujukan / Penerimaan' : 'Referral / Acceptance Letter',
    manifestTicket: language === 'id' ? 'Manifest / Tiket Pesawat' : 'Manifest / Flight Ticket',
    medicalOfficerDoc: language === 'id' ? 'Dokumen Petugas Medis' : 'Medical Officer Documents',

    patientConditionPhoto: language === 'id' ? 'Foto Kondisi Pasien' : 'Patient Condition Photo',
    patientId: language === 'id' ? 'KTP Pasien' : 'Patient ID Card',
    medicalRecord: language === 'id' ? 'Rekam Medis Pasien' : 'Patient Medical Record',
    flightTicket: language === 'id' ? 'Tiket Pesawat' : 'Flight Ticket',

    fileUploaded: language === 'id' ? 'File terunggah' : 'File uploaded',
    chooseFile: language === 'id' ? 'Pilih PDF / Image...' : 'Choose PDF / Image...',
    previewDoc: language === 'id' ? 'Preview Dokumen' : 'Document Preview',
    confirmFile: language === 'id' ? 'Apakah Anda yakin ingin menggunakan file ini?' : 'Are you sure you want to use this file?',
    uploadAgain: language === 'id' ? 'Ganti File' : 'Change File',
    save: language === 'id' ? 'Simpan Dokumen' : 'Save Document',

    successTitle: language === 'id' ? 'Permohonan Berhasil' : 'Request Submitted',
    successDesc: language === 'id' ? 'Permohonan Anda berhasil dikirim dan sedang dalam antrean verifikasi admin.' : 'Your application was successfully submitted and is pending admin verification.',
    backDashboard: language === 'id' ? 'Kembali ke Dashboard' : 'Back to Dashboard',

    errorTitle: language === 'id' ? 'Data Belum Lengkap' : 'Incomplete Data',
    errorDesc: language === 'id' ? 'Harap lengkapi field wajib berikut sebelum melanjutkan:' : 'Please complete the following required fields before proceeding:',
    completeData: language === 'id' ? 'Lengkapi Sekarang' : 'Complete Now',

    flightSectionDesc: language === 'id' ? 'Informasi detail perjalanan dan armada pesawat.' : 'Flight travel and aircraft details.',
    patientSectionDesc: language === 'id' ? 'Identitas dan data biologis pasien yang dievakuasi.' : 'Patient identity and biological data.',
    uploadSectionDesc: language === 'id' ? 'Pastikan file yang diunggah jelas dan dapat dibaca (Maks. 5MB).' : 'Ensure uploaded files are clear and readable (Max 5MB).',

    draftSaved: language === 'id' ? 'Draft berhasil disimpan' : 'Draft saved successfully',
    uploadSuccess: language === 'id' ? 'Dokumen berhasil disimpan' : 'Document saved',
    uploadFailed: language === 'id' ? 'Upload gagal' : 'Upload failed',
    submitFailed: language === 'id' ? 'Terjadi kesalahan saat mengirim data' : 'An error occurred while submitting data',
  };

  const steps = [
    { id: 1, name: t.flightData },
    { id: 2, name: t.patientData },
    { id: 3, name: t.patientCondition },
    { id: 4, name: t.companionData },
    { id: 5, name: t.uploadDocuments },
  ];

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
      errors.push(language === 'id' ? 'Tanggal perjalanan wajib diisi' : 'Travel date is required');
    }

    if (currentStep === 1 && !formData.jamPerjalanan) {
      errors.push(language === 'id' ? 'Jam perjalanan wajib diisi' : 'Travel time is required');
    }

    if (currentStep === 2 && !formData.namaPasien) {
      errors.push(language === 'id' ? 'Nama pasien wajib diisi' : 'Patient name is required');
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      setShowErrorModal(true);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleSaveDraft() {
    toast.success(t.draftSaved);
  }

  async function handleSubmit() {
    const errors: string[] = [];

    if (!formData.tanggalPerjalanan) {
      errors.push(language === 'id' ? 'Tanggal perjalanan wajib diisi' : 'Travel date is required');
    }

    if (!formData.namaPasien) {
      errors.push(language === 'id' ? 'Nama pasien wajib diisi' : 'Patient name is required');
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      setShowErrorModal(true);
      return;
    }

    try {
      setLoadingSubmit(true);
      const data = new FormData();

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

      data.append('namaPasien', formData.namaPasien || '');
      data.append('jenisKelamin', formData.jenisKelamin || '');
      data.append('tanggalLahir', formData.tanggalLahir || '');

      data.append('oksigen', formData.memerlukanOksigen || '');
      data.append('posisiPasien', formData.posisiPasien || '');
      data.append('tingkatKesadaran', formData.tingkatKesadaran || '');
      data.append('tekananDarah', formData.tekananDarah || '');
      data.append('nadi', formData.nadi || '');
      data.append('frekuensiPernafasan', formData.frekuensiNafas || '');
      data.append('saturasiOksigen', formData.saturasiOksigen || '');

      data.append('jumlahPendamping', formData.jumlahPendamping || '');
      data.append('namaPendamping', formData.namaPendamping || '');
      data.append('hubunganPasien', formData.hubunganPendamping || '');
      data.append('noTeleponPendamping', formData.nomorTeleponPendampingMedis || '');
      data.append('noTeleponKeluarga', formData.nomorTeleponKeluarga || '');
      data.append('nosuratIzin', formData.nosuratIzin || '');

      data.append('noSuratPraktik', formData.noSuratPraktik || '');
      data.append('fotoKondisiPasien', formData.fotoKondisiPasien || '');
      data.append('ktpPasien', formData.ktpPasien || '');
      data.append('manifetPrivateJet', formData.manifetPrivateJet || '');
      data.append('rekamMedisPasien', formData.rekamMedisPasien || '');
      data.append('suratRujukan', formData.suratRujukan || '');
      data.append('tiketPesawat', formData.tiketPesawat || '');
      data.append('dokumentPetugasMedis', formData.dokumentPetugasMedis || '');

      // 👇 PERBAIKAN: Memaksa pengiriman status pending dari Frontend 👇
      data.append('status', 'pending');

      const res = await fetch('/api/evacuations', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Submit gagal');
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      toast.error(t.submitFailed);
    } finally {
      setLoadingSubmit(false);
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
      noSuratPraktik: null,
      fotoKondisiPasien: null,
      ktpPasien: null,
      manifetPrivateJet: null,
      rekamMedisPasien: null,
      suratRujukan: null,
      tiketPesawat: null,
      dokumentPetugasMedis: null,
    });
    setCurrentStep(1);
    router.push('/dashboard');
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

      resetPreview();
      toast.success(t.uploadSuccess);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t.uploadFailed);
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const isPdfPreview =
    previewMimeType === 'application/pdf' ||
    (!!previewFileUrl && previewFileUrl.toLowerCase().includes('.pdf'));

  if (authLoading) return null;

  // PREMIUM UI CLASSES
  const inputClass =
    'h-12 w-full rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/15 focus-visible:border-blue-500 hover:border-slate-300 transition-all duration-300 shadow-sm';

  const labelClass = 'text-sm font-semibold text-slate-700 tracking-tight mb-1 block';

  const renderUploadField = (
    label: string,
    field: string,
    required = false,
  ) => (
    <div className="space-y-2 w-full">
      <Label className={labelClass}>
        {label} {required && <span className="text-rose-500 ml-1">*</span>}
      </Label>

      <div
        className={cn(
          'relative flex items-center justify-between border-2 rounded-2xl px-4 py-3 transition-all duration-300 group',
          formData[field]
            ? 'border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-100'
            : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 cursor-pointer',
        )}
      >
        <div className="relative w-full flex items-center gap-4 overflow-hidden">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePreview(file, field);
            }}
          />

          <div
            className={cn(
              'p-3 rounded-xl flex-shrink-0 transition-colors',
              formData[field]
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'bg-white border shadow-sm text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200',
            )}
          >
            {formData[field] ? (
              <Check size={20} strokeWidth={2.5} />
            ) : (
              <UploadCloud size={20} />
            )}
          </div>

          <div className="flex flex-col truncate">
            <span
              className={cn(
                'text-sm font-semibold truncate',
                formData[field] ? 'text-emerald-800' : 'text-slate-700',
              )}
            >
              {formData[field] ? t.fileUploaded : t.chooseFile}
            </span>
          </div>
        </div>

        {formData[field] && (
          <button
            type="button"
            className="relative z-20 p-2.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-600 border border-emerald-100 shadow-sm transition-all ml-4 flex-shrink-0"
            onClick={() => openUploadedPreview(formData[field])}
          >
            <Eye size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 py-10 px-4 sm:px-6 lg:px-8">
      
  

      <div className="max-w-[52rem] mx-auto space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-4 pt-6">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl mb-2 shadow-lg shadow-blue-500/30">
            <FileText className="size-8" strokeWidth={2} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.title}
          </h1>
          <p className="text-slate-500 font-medium text-lg">{t.subtitle}</p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white relative overflow-visible">
          
          {/* STEPPER */}
          <div className="w-full max-w-3xl mx-auto mb-14 mt-2">
            <div className="flex items-start justify-between relative">
              <div className="absolute top-5 left-8 right-8 h-[3px] bg-slate-100 -z-10 rounded-full" />
              <div
                className="absolute top-5 left-8 h-[3px] bg-blue-600 -z-10 transition-all duration-700 ease-in-out rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                style={{
                  width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 4rem)`,
                }}
              />

              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center relative z-10 w-20 group cursor-default"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2',
                      currentStep > step.id
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : currentStep === step.id
                        ? 'bg-white border-blue-600 text-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.15)] scale-110'
                        : 'bg-white border-slate-200 text-slate-400',
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check size={18} strokeWidth={3} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="absolute top-14 w-28 text-center">
                    <span
                      className={cn(
                        'text-xs font-semibold leading-tight transition-colors duration-300',
                        currentStep >= step.id
                          ? 'text-slate-900'
                          : 'text-slate-400',
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FORM CONTENT */}
          <div className="mt-8">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {t.flightData}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1.5 font-medium">
                    {t.flightSectionDesc}
                  </p>
                </div>

                {/* Wrapper untuk input panjang kebawah */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>{t.serviceType}</Label>
                    <Select
                      value={formData.jenisLayanan}
                      onValueChange={(value) =>
                        updateField('jenisLayanan', value)
                      }
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t.serviceTypePlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-slate-100">
                        <SelectItem value="keberangkatan">{t.departure}</SelectItem>
                        <SelectItem value="kedatangan">{t.arrival}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.aircraftType}</Label>
                    <Select
                      value={formData.jenisPesawat}
                      onValueChange={(value) =>
                        updateField('jenisPesawat', value)
                      }
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t.aircraftTypePlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-slate-100">
                        <SelectItem value="komersial">{t.commercial}</SelectItem>
                        <SelectItem value="jetPribadi">{t.privateJet}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.groundhandlingName}</Label>
                    <Input
                      value={formData.namaGroundhandling}
                      onChange={(e) => updateField('namaGroundhandling', e.target.value)}
                      className={inputClass}
                      placeholder="Ex: PT Gapura Angkasa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.officerName}</Label>
                    <Input
                      value={formData.namaPetugas}
                      onChange={(e) => updateField('namaPetugas', e.target.value)}
                      className={inputClass}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.officePhone}</Label>
                    <Input
                      type="tel"
                      value={formData.noTelepon}
                      onChange={(e) => updateField('noTelepon', e.target.value)}
                      className={inputClass}
                      placeholder="+62 812..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.companyEmail}</Label>
                    <Input
                      type="email"
                      value={formData.emailPerusahaan}
                      onChange={(e) => updateField('emailPerusahaan', e.target.value)}
                      className={inputClass}
                      placeholder="contact@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.airlineName}</Label>
                    <Input
                      value={formData.namaMaskapai}
                      onChange={(e) => updateField('namaMaskapai', e.target.value)}
                      className={inputClass}
                      placeholder={t.airlineExample}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.flightNumber}</Label>
                    <Input
                      value={formData.noPenerbangan}
                      onChange={(e) => updateField('noPenerbangan', e.target.value)}
                      className={inputClass}
                      placeholder={t.flightExample}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.seatNumber} <span className="text-slate-400 font-normal text-xs ml-1">({t.seatNote})</span></Label>
                    <Input
                      value={formData.noKursi}
                      onChange={(e) => updateField('noKursi', e.target.value)}
                      className={inputClass}
                      placeholder="Ex: 12A"
                    />
                  </div>

                  {/* KHUSUS UNTUK TANGGAL & JAM: Membagi 2 kolom menggunakan Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <Label className={labelClass}>
                        {t.travelDate} <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.tanggalPerjalanan}
                        onChange={(e) => updateField('tanggalPerjalanan', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={labelClass}>
                        {t.travelTime} <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="time"
                        value={formData.jamPerjalanan}
                        onChange={(e) => updateField('jamPerjalanan', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {t.patientData}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1.5 font-medium">
                    {t.patientSectionDesc}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t.patientName} <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      value={formData.namaPasien}
                      onChange={(e) => updateField('namaPasien', e.target.value)}
                      className={inputClass}
                      placeholder="Jane Doe"
                    />
                  </div>

                  {/* KHUSUS GENDER & TANGGAL LAHIR: Membagi 2 kolom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <Label className={labelClass}>{t.gender}</Label>
                      <Select
                        value={formData.jenisKelamin}
                        onValueChange={(value) => updateField('jenisKelamin', value)}
                      >
                        <SelectTrigger className={inputClass}>
                          <SelectValue placeholder={t.gender} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-lg border-slate-100">
                          <SelectItem value="LakiLaki">{t.male}</SelectItem>
                          <SelectItem value="Perempuan">{t.female}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className={labelClass}>{t.tanggalLahir}</Label>
                      <Input
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={(e) => updateField('tanggalLahir', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {t.patientCondition}
                  </h2>
                </div>

                {/* Semua Form Full-Width */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>{t.memerlukanOksigen}</Label>
                    <Select
                      value={formData.memerlukanOksigen}
                      onValueChange={(value) => updateField('memerlukanOksigen', value)}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t.memerlukanOksigen} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-slate-100">
                        <SelectItem value="ya">{t.yes}</SelectItem>
                        <SelectItem value="tidak">{t.no}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.posisiPasien}</Label>
                    <Select
                      value={formData.posisiPasien}
                      onValueChange={(value) => updateField('posisiPasien', value)}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t.posisiPasien} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-slate-100">
                        <SelectItem value="duduk">{t.sitting}</SelectItem>
                        <SelectItem value="berbaring">{t.lying}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.tingkatKesadaran}</Label>
                    <Input
                      value={formData.tingkatKesadaran}
                      onChange={(e) => updateField('tingkatKesadaran', e.target.value)}
                      className={inputClass}
                      placeholder={t.tingkatKesadaranExample}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.tekananDarah}</Label>
                    <Input
                      value={formData.tekananDarah}
                      onChange={(e) => updateField('tekananDarah', e.target.value)}
                      className={inputClass}
                      placeholder={t.tekananDarahExample}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.nadi}</Label>
                    <Input
                      value={formData.nadi}
                      onChange={(e) => updateField('nadi', e.target.value)}
                      className={inputClass}
                      placeholder={t.nadiExample}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.frekuensiNafas}</Label>
                    <Input
                      value={formData.frekuensiNafas}
                      onChange={(e) => updateField('frekuensiNafas', e.target.value)}
                      className={inputClass}
                      placeholder={t.frekuensiNafasExample}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.saturasiOksigen}</Label>
                    <Input
                      value={formData.saturasiOksigen}
                      onChange={(e) => updateField('saturasiOksigen', e.target.value)}
                      className={inputClass}
                      placeholder={t.saturasiOksigenExample}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {t.companionData}
                  </h2>
                </div>

                {/* Semua Form Full-Width */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>{t.jumlahPendamping}</Label>
                    <Input
                      type="number"
                      value={formData.jumlahPendamping}
                      onChange={(e) => updateField('jumlahPendamping', e.target.value)}
                      className={inputClass}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t.hubungandenganPasien}
                    </Label>
                    <Select
                      value={formData.hubunganPendamping}
                      onValueChange={(value) => updateField('hubunganPendamping', value)}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t.hubungandenganPasien} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-slate-100">
                        <SelectItem value="Keluarga">{t.family}</SelectItem>
                        <SelectItem value="Dokter">{t.doctor}</SelectItem>
                        <SelectItem value="Perawat">{t.nurse}</SelectItem>
                        <SelectItem value="Lainnya">{t.other}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.namaPendamping}</Label>
                    <Input
                      value={formData.namaPendamping}
                      onChange={(e) => updateField('namaPendamping', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t.nomorTeleponPendampingMedis}
                    </Label>
                    <Input
                      type="text"
                      value={formData.nomorTeleponPendampingMedis}
                      onChange={(e) => updateField('nomorTeleponPendampingMedis', e.target.value)}
                      className={inputClass}
                      placeholder="+62..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t.nomorTeleponKeluarga}
                    </Label>
                    <Input
                      type="text"
                      value={formData.nomorTeleponKeluarga}
                      onChange={(e) => updateField('nomorTeleponKeluarga', e.target.value)}
                      className={inputClass}
                      placeholder="+62..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>{t.nosuratIzin}</Label>
                    <Input
                      value={formData.nosuratIzin}
                      onChange={(e) => updateField('nosuratIzin', e.target.value)}
                      className={inputClass}
                      placeholder={t.nosuratIzinExample}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {t.uploadDocuments}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1.5 font-medium">
                    {t.uploadSectionDesc}
                  </p>
                </div>

                {/* Semua Form Full-Width */}
                <div className="space-y-6">
                  {renderUploadField(t.practiceLicense, 'noSuratPraktik', true)}
                  {renderUploadField(t.patientConditionPhoto, 'fotoKondisiPasien')}
                  {renderUploadField(t.patientId, 'ktpPasien')}
                  {renderUploadField(t.manifestTicket, 'manifetPrivateJet')}
                  {renderUploadField(t.medicalRecord, 'rekamMedisPasien')}
                  {renderUploadField(t.referralLetter, 'suratRujukan', true)}
                  {renderUploadField(t.flightTicket, 'tiketPesawat')}
                  {renderUploadField(t.medicalOfficerDoc, 'dokumentPetugasMedis')}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-12 pt-8 border-t border-slate-100 gap-4">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group"
            >
              <Save className="size-4 mr-2 group-hover:scale-110 transition-transform" />
              {t.saveDraft}
            </Button>

            <div className="flex w-full sm:w-auto gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 sm:flex-none h-12 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  {t.previous}
                </Button>
              )}

              <Button
                className="flex-1 sm:flex-none h-12 px-8 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                onClick={currentStep === 5 ? handleSubmit : nextStep}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  t.loading
                ) : currentStep === 5 ? (
                  <>
                    {t.submit}
                    <Check className="size-4 ml-2" />
                  </>
                ) : (
                  <>
                    {t.next}
                    <ArrowRight className="size-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PREVIEW */}
      <Dialog open={previewModal} onOpenChange={setPreviewModal}>
        <DialogContent className="max-w-3xl rounded-[2rem] p-8 border-none shadow-2xl bg-white/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-900">
              {t.previewDoc}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">{t.confirmFile}</DialogDescription>
          </DialogHeader>

          {previewFileUrl && (
            <div className="mt-4 flex justify-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100 shadow-inner overflow-hidden">
              {isPdfPreview ? (
                <iframe
                  src={previewFileUrl}
                  className="w-full h-[60vh] rounded-xl border border-slate-200"
                />
              ) : (
                <img
                  src={previewFileUrl}
                  className="max-h-[60vh] rounded-xl object-contain drop-shadow-md"
                  alt="Preview"
                />
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="outline"
              onClick={resetPreview}
              className="rounded-xl h-12 px-8 font-bold text-slate-600 hover:bg-slate-50 border-slate-200"
            >
              {t.uploadAgain}
            </Button>

            {selectedFile && (
              <Button
                onClick={confirmUpload}
                className="rounded-xl h-12 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              >
                {t.save}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL SUCCESS */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10 text-center border-none shadow-2xl">
          <div className="mx-auto w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner shadow-emerald-200/50">
            <Check size={40} strokeWidth={3} />
          </div>

          <DialogTitle className="text-2xl font-extrabold mb-3 text-slate-900">
            {t.successTitle}
          </DialogTitle>

          <DialogDescription className="mb-8 text-base text-slate-500 font-medium">
            {t.successDesc}
          </DialogDescription>

          <Button
            className="w-full h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-lg"
            onClick={resetForm}
          >
            {t.backDashboard}
          </Button>
        </DialogContent>
      </Dialog>

      {/* MODAL ERROR */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md rounded-[2rem] p-8 border-none shadow-2xl text-center bg-white">
          <div className="mx-auto w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 ring-8 ring-rose-50">
            <AlertCircle size={32} strokeWidth={2.5} />
          </div>

          <DialogTitle className="text-2xl font-bold mb-2 text-slate-900">
            {t.errorTitle}
          </DialogTitle>

          <DialogDescription className="text-slate-500 font-medium">{t.errorDesc}</DialogDescription>

          <div className="space-y-2 mt-6 mb-8 text-left bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
            {errorMessages.map((msg, idx) => (
              <p
                key={idx}
                className="text-sm text-rose-700 font-semibold flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                {msg}
              </p>
            ))}
          </div>

          <Button
            className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20"
            onClick={() => setShowErrorModal(false)}
          >
            {t.completeData}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
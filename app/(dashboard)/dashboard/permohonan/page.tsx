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
  Save,
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
import { useTour } from '@/app/hooks/useTour';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useApplications } from '@/app/context/ApplicationContext';

import { compressImage, validateFileSize } from '@/lib/utils/file-compressor';

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

  const { language, setLanguage, t } = useLanguage();
  useTour(user?.role === 'admin');

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

  const steps = [
    { id: 1, name: t('pages.permohonan.stepper.flight') },
    { id: 2, name: t('pages.permohonan.stepper.patient') },
    { id: 3, name: t('pages.permohonan.stepper.condition') },
    { id: 4, name: t('pages.permohonan.stepper.companion') },
    { id: 5, name: t('pages.permohonan.stepper.documents') },
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
      errors.push(t('pages.permohonan.errors.travelDateRequired'));
    }

    if (currentStep === 1 && !formData.jamPerjalanan) {
      errors.push(t('pages.permohonan.errors.travelTimeRequired'));
    }

    // Validasi 24 Jam
    if (
      currentStep === 1 &&
      formData.tanggalPerjalanan &&
      formData.jamPerjalanan
    ) {
      const travelDateTime = new Date(
        `${formData.tanggalPerjalanan}T${formData.jamPerjalanan}:00`,
      );
      const now = new Date();
      if (travelDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
        errors.push(t('pages.permohonan.errors.tooClose'));
      }
    }

    if (currentStep === 2 && !formData.namaPasien) {
      errors.push(t('pages.permohonan.errors.patientNameRequired'));
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
    toast.success(t('pages.permohonan.draftSaved'));
  }

  async function handleSubmit() {
    const errors: string[] = [];

    if (!formData.tanggalPerjalanan) {
      errors.push(t('pages.permohonan.errors.travelDateRequired'));
    }

    if (!formData.namaPasien) {
      errors.push(t('pages.permohonan.errors.patientNameRequired'));
    }

    if (formData.tanggalPerjalanan && formData.jamPerjalanan) {
      const travelDateTime = new Date(
        `${formData.tanggalPerjalanan}T${formData.jamPerjalanan}:00`,
      );
      const now = new Date();
      if (travelDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
        errors.push(t('pages.permohonan.errors.tooClose'));
      }
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
      data.append(
        'noTeleponPendamping',
        formData.nomorTeleponPendampingMedis || '',
      );
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
      toast.error(t('pages.permohonan.submitFailed'));
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

    // Validate overall size before any processing (10MB limit)
    if (!validateFileSize(selectedFile, 10)) {
      toast.error(t('pages.permohonan.errors.fileTooLarge') || 'File too large (max 10MB)');
      return;
    }

    try {
      setLoadingSubmit(true);
      
      // Perform compression for images (returns original if not an image or already small)
      const fileToUpload = await compressImage(selectedFile, 1);

      const data = new FormData();
      data.append('file', fileToUpload);
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
      toast.success(t('pages.permohonan.uploadSuccess'));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('pages.permohonan.uploadFailed'));
    } finally {
      setLoadingSubmit(false);
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

  const labelClass =
    'text-sm font-semibold text-slate-700 tracking-tight mb-1 block';

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
              {formData[field]
                ? t('evacuation.fileUploaded')
                : t('evacuation.chooseFile')}
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
            {t('pages.permohonan.title')}
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            {t('pages.permohonan.subtitle')}
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white relative overflow-visible">
          {/* STEPPER */}
          <div id="tour-permohonan-stepper" className="w-full max-w-3xl mx-auto mb-14 mt-2">
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
          <div id="tour-permohonan-form" className="mt-8">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                <div className="border-b border-slate-100 pb-5">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {t('evacuation.flightInfo')}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1.5 font-medium">
                    {t('pages.permohonan.flightSectionDesc')}
                  </p>
                </div>

                {/* Wrapper untuk input panjang kebawah */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.serviceType')}
                    </Label>
                    <Select
                      value={formData.jenisLayanan}
                      onValueChange={(value) =>
                        updateField('jenisLayanan', value)
                      }
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue
                          placeholder={t('evacuation.serviceType')}
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-slate-100">
                        <SelectItem value="keberangkatan">
                          {t('evacuation.departure')}
                        </SelectItem>
                        <SelectItem value="kedatangan">
                          {t('evacuation.arrival')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.aircraftType')}
                    </Label>
                    <Select
                      value={formData.jenisPesawat}
                      onValueChange={(value) =>
                        updateField('jenisPesawat', value)
                      }
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue
                          placeholder={t('evacuation.aircraftType')}
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-slate-100">
                        <SelectItem value="komersial">
                          {t('evacuation.commercial')}
                        </SelectItem>
                        <SelectItem value="jetPribadi">
                          {t('evacuation.privateJet')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.groundHandlingName')}
                    </Label>
                    <Input
                      value={formData.namaGroundhandling}
                      onChange={(e) =>
                        updateField('namaGroundhandling', e.target.value)
                      }
                      className={inputClass}
                      placeholder="Ex: PT Gapura Angkasa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.officerName')}
                    </Label>
                    <Input
                      value={formData.namaPetugas}
                      onChange={(e) =>
                        updateField('namaPetugas', e.target.value)
                      }
                      className={inputClass}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.officePhone')}
                    </Label>
                    <Input
                      type="tel"
                      value={formData.noTelepon}
                      onChange={(e) => updateField('noTelepon', e.target.value)}
                      className={inputClass}
                      placeholder="+62 812..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.companyEmail')}
                    </Label>
                    <Input
                      type="email"
                      value={formData.emailPerusahaan}
                      onChange={(e) =>
                        updateField('emailPerusahaan', e.target.value)
                      }
                      className={inputClass}
                      placeholder="contact@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.airlineName')}
                    </Label>
                    <Input
                      value={formData.namaMaskapai}
                      onChange={(e) =>
                        updateField('namaMaskapai', e.target.value)
                      }
                      className={inputClass}
                      placeholder={t('pages.permohonan.fields.airlineExample')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.flightNumber')}
                    </Label>
                    <Input
                      value={formData.noPenerbangan}
                      onChange={(e) =>
                        updateField('noPenerbangan', e.target.value)
                      }
                      className={inputClass}
                      placeholder={t('pages.permohonan.fields.flightExample')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.seatNumber')}{' '}
                      <span className="text-slate-400 font-normal text-xs ml-1">
                        ({t('pages.permohonan.fields.seatNote')})
                      </span>
                    </Label>
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
                        {t('evacuation.travelDate')}{' '}
                        <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.tanggalPerjalanan}
                        onChange={(e) =>
                          updateField('tanggalPerjalanan', e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={labelClass}>
                        {t('evacuation.travelTime')}{' '}
                        <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="time"
                        value={formData.jamPerjalanan}
                        onChange={(e) =>
                          updateField('jamPerjalanan', e.target.value)
                        }
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
                    {t('evacuation.patientInfo')}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1.5 font-medium">
                    {t('pages.permohonan.patientSectionDesc')}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.patientName')}{' '}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      value={formData.namaPasien}
                      onChange={(e) =>
                        updateField('namaPasien', e.target.value)
                      }
                      className={inputClass}
                      placeholder="Jane Doe"
                    />
                  </div>

                  {/* KHUSUS GENDER & TANGGAL LAHIR: Membagi 2 kolom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <Label className={labelClass}>
                        {t('evacuation.gender')}
                      </Label>
                      <Select
                        value={formData.jenisKelamin}
                        onValueChange={(value) =>
                          updateField('jenisKelamin', value)
                        }
                      >
                        <SelectTrigger className={inputClass}>
                          <SelectValue placeholder={t('evacuation.gender')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-lg border-slate-100">
                          <SelectItem value="LakiLaki">
                            {t('evacuation.male')}
                          </SelectItem>
                          <SelectItem value="Perempuan">
                            {t('evacuation.female')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className={labelClass}>
                        {t('evacuation.dateOfBirth')}
                      </Label>
                      <Input
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={(e) =>
                          updateField('tanggalLahir', e.target.value)
                        }
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
                    {t('evacuation.vitalSigns')}
                  </h2>
                </div>

                {/* Semua Form Full-Width */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.oxygen')}
                    </Label>
                    <Select
                      value={formData.memerlukanOksigen}
                      onValueChange={(value) =>
                        updateField('memerlukanOksigen', value)
                      }
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t('evacuation.oxygen')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-slate-100">
                        <SelectItem value="ya">
                          {t('evacuation.yes')}
                        </SelectItem>
                        <SelectItem value="tidak">
                          {t('evacuation.no')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.position')}
                    </Label>
                    <Select
                      value={formData.posisiPasien}
                      onValueChange={(value) =>
                        updateField('posisiPasien', value)
                      }
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder={t('evacuation.position')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-slate-100">
                        <SelectItem value="duduk">
                          {t('evacuation.sitting')}
                        </SelectItem>
                        <SelectItem value="berbaring">
                          {t('evacuation.lying')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.consciousnessLevel')}
                    </Label>
                    <Input
                      value={formData.tingkatKesadaran}
                      onChange={(e) =>
                        updateField('tingkatKesadaran', e.target.value)
                      }
                      className={inputClass}
                      placeholder={t('evacuation.consciousnessLevel')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.bloodPressure')}
                    </Label>
                    <Input
                      value={formData.tekananDarah}
                      onChange={(e) =>
                        updateField('tekananDarah', e.target.value)
                      }
                      className={inputClass}
                      placeholder={t('evacuation.bloodPressure')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.heartRate')}
                    </Label>
                    <Input
                      value={formData.nadi}
                      onChange={(e) => updateField('nadi', e.target.value)}
                      className={inputClass}
                      placeholder={t('evacuation.heartRate')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.respiratoryRate')}
                    </Label>
                    <Input
                      value={formData.frekuensiNafas}
                      onChange={(e) =>
                        updateField('frekuensiNafas', e.target.value)
                      }
                      className={inputClass}
                      placeholder={t('evacuation.respiratoryRate')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.oxygenSaturation')}
                    </Label>
                    <Input
                      value={formData.saturasiOksigen}
                      onChange={(e) =>
                        updateField('saturasiOksigen', e.target.value)
                      }
                      className={inputClass}
                      placeholder={t('evacuation.oxygenSaturation')}
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
                    {t('evacuation.companionInfo')}
                  </h2>
                </div>

                {/* Semua Form Full-Width */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.numberOfCompanions')}
                    </Label>
                    <Input
                      type="number"
                      value={formData.jumlahPendamping}
                      onChange={(e) =>
                        updateField('jumlahPendamping', e.target.value)
                      }
                      className={inputClass}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.companionRelation')}
                    </Label>
                    <Select
                      value={formData.hubunganPendamping}
                      onValueChange={(value) =>
                        updateField('hubunganPendamping', value)
                      }
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue
                          placeholder={t('evacuation.companionRelation')}
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border-slate-100">
                        <SelectItem value="Keluarga">
                          {t('evacuation.family')}
                        </SelectItem>
                        <SelectItem value="Dokter">
                          {t('evacuation.doctor')}
                        </SelectItem>
                        <SelectItem value="Perawat">
                          {t('evacuation.nurse')}
                        </SelectItem>
                        <SelectItem value="Lainnya">
                          {t('evacuation.other')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.companionName')}
                    </Label>
                    <Input
                      value={formData.namaPendamping}
                      onChange={(e) =>
                        updateField('namaPendamping', e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.companionPhone')}
                    </Label>
                    <Input
                      type="text"
                      value={formData.nomorTeleponPendampingMedis}
                      onChange={(e) =>
                        updateField(
                          'nomorTeleponPendampingMedis',
                          e.target.value,
                        )
                      }
                      className={inputClass}
                      placeholder="+62..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.familyPhone')}
                    </Label>
                    <Input
                      type="text"
                      value={formData.nomorTeleponKeluarga}
                      onChange={(e) =>
                        updateField('nomorTeleponKeluarga', e.target.value)
                      }
                      className={inputClass}
                      placeholder="+62..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>
                      {t('evacuation.practiceNumber')}
                    </Label>
                    <Input
                      value={formData.nosuratIzin}
                      onChange={(e) =>
                        updateField('nosuratIzin', e.target.value)
                      }
                      className={inputClass}
                      placeholder={t('evacuation.practiceNumber')}
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
                    {t('evacuation.documents')}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1.5 font-medium">
                    {t('pages.permohonan.uploadSectionDesc')}
                  </p>
                </div>

                {/* Semua Form Full-Width */}
                <div id="tour-permohonan-upload" className="space-y-6">
                  {renderUploadField(
                    t('evacuation.practiceNumber'),
                    'noSuratPraktik',
                    true,
                  )}
                  {renderUploadField(
                    t('evacuation.patientPhoto'),
                    'fotoKondisiPasien',
                  )}
                  {renderUploadField(t('evacuation.patientID'), 'ktpPasien')}
                  {renderUploadField(
                    t('evacuation.manifestJet'),
                    'manifetPrivateJet',
                  )}
                  {renderUploadField(
                    t('evacuation.medicalRecord'),
                    'rekamMedisPasien',
                  )}
                  {renderUploadField(
                    t('evacuation.referralLetter'),
                    'suratRujukan',
                    true,
                  )}
                  {renderUploadField(t('evacuation.ticket'), 'tiketPesawat')}
                  {renderUploadField(
                    t('evacuation.medicalStaffDoc'),
                    'dokumentPetugasMedis',
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div id="tour-permohonan-nav" className="flex flex-col-reverse sm:flex-row justify-between items-center mt-12 pt-8 border-t border-slate-100 gap-4">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group"
            >
              <Save className="size-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('common.save')}
            </Button>

            <div className="flex w-full sm:w-auto gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 sm:flex-none h-12 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  {t('common.previous')}
                </Button>
              )}

              <Button
                className="flex-1 sm:flex-none h-12 px-8 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                onClick={currentStep === 5 ? handleSubmit : nextStep}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  t('common.loading')
                ) : currentStep === 5 ? (
                  <>
                    {t('common.submit')}
                    <Check className="size-4 ml-2" />
                  </>
                ) : (
                  <>
                    {t('common.next')}
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
              {t('pages.penerbitan.judulPreview')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              {t('pages.permohonan.confirmFile')}
            </DialogDescription>
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
              {t('pages.permohonan.uploadAgain')}
            </Button>

            {selectedFile && (
              <Button
                onClick={confirmUpload}
                className="rounded-xl h-12 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              >
                {t('pages.permohonan.save')}
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
            {t('pages.permohonan.successTitle')}
          </DialogTitle>

          <DialogDescription className="mb-8 text-base text-slate-500 font-medium">
            {t('pages.permohonan.successDesc')}
          </DialogDescription>

          <Button
            className="w-full h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-lg"
            onClick={resetForm}
          >
            {t('pages.permohonan.backDashboard')}
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
            {t('pages.permohonan.errorTitle')}
          </DialogTitle>

          <DialogDescription className="text-slate-500 font-medium">
            {t('pages.permohonan.errorDesc')}
          </DialogDescription>

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
            {t('pages.permohonan.completeData')}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from "react";

export interface Application {
  id: string;

  status: "draft" | "verification" | "revision" | "publication" | "completed";

  createdAt: string;
  updatedAt: string;

  /* DATA PENERBANGAN */
  jenisLayanan: string;
  jenisKeberangkatan: string;
  jenisPesawat: string;
  namaGroundhandling: string;
  namaPetugas: string;
  noTelepon: string;
  emailPerusahaan: string;
  namaMaskapai: string;
  noPenerbangan: string;
  noKursi: string;
  tanggalPerjalanan: string;
  jamPerjalanan: string;

  /* DATA PASIEN */
  namaPasien: string;
  jenisKelamin: string;
  tanggalLahir: string;

  /* KONDISI PASIEN */
  memerlukanOksigen: string;
  posisiPasien: string;
  tingkatKesadaran: string;
  tekananDarah: string;
  nadi: string;
  frekuensiPernafasan: string;
  saturasiOksigen: string;

  /* DATA PENDAMPING */
  jumlahPendamping: string;
  hubunganDenganPasien: string;
  namaPendamping: string;
  noTeleponPendamping: string;
  noTeleponKeluarga: string;
  noSuratIzinPraktik: string;

  /* DOKUMEN */
  fotoKondisi: string;
  ktpPaspor: string;
  manifest: string;
  rekamMedis: string;
  suratRujukan: string;
  tiketPesawat: string;
  dokumenMedis: string;

  revisionNotes?: string;
}

interface ApplicationContextType {

  applications: Application[];

  fetchApplications: () => Promise<void>;

  addApplication: (
    app: Omit<Application, "id" | "createdAt" | "updatedAt" | "status">
  ) => Promise<void>;

  updateApplication: (
    id: string,
    data: Partial<Application>
  ) => Promise<void>;

  deleteApplication: (id: string) => Promise<void>;
  moveToVerification: (id: string) => Promise<void>;
  moveToRevision: (id: string, notes: string) => Promise<void>;
  moveToPublication: (id: string) => Promise<void>;
  moveToCompleted: (id: string) => Promise<void>;
  saveDraft: (
    data: Omit<Application, "id" | "createdAt" | "updatedAt" | "status">
  ) => Promise<void>;

  getApplicationsByStatus: (status: Application["status"]) => Application[];
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(
  undefined
);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([]);

  /* ===============================
     FETCH DATA FROM DATABASE
  =============================== */

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/evacuations", {
        credentials: "include"
      });
      const result = await res.json();
      if (res.ok) {
        setApplications(result.data);
      }
    } catch (error) {
      console.error("Fetch applications error:", error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  /* ===============================
     ADD APPLICATION
  =============================== */

  const addApplication = async (
    appData: Omit<Application, "id" | "createdAt" | "updatedAt" | "status">
  ) => {
    try {
      const res = await fetch("/api/evacuations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appData),
        credentials: "include"
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error);
      }
      setApplications(prev => [...prev, result.data]);
    } catch (error) {
      console.error("Add application error:", error);
    }
  };

  /* ===============================
     UPDATE APPLICATION
  =============================== */

  const updateApplication = async (
    id: string,
    data: Partial<Application>
  ) => {

    try {
      const res = await fetch(`/api/evacuations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include"
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error);
      }
      setApplications(prev =>
        prev.map(app =>
          app.id === id
            ? { ...app, ...data, updatedAt: new Date().toISOString() }
            : app
        )
      );

    } catch (error) {
      console.error("Update application error:", error);
    }
  };

  /* ===============================
     DELETE APPLICATION
  =============================== */

  const deleteApplication = async (id: string) => {
    try {
      await fetch(`/api/evacuations/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      setApplications(prev =>
        prev.filter(app => app.id !== id)
      );
    } catch (error) {
      console.error("Delete application error:", error);
    }
  };

  /* ===============================
     STATUS MANAGEMENT
  =============================== */

  const moveToVerification = async (id: string) => {
    await updateApplication(id, {
      status: "verification",
      revisionNotes: undefined
    });
  };

  const moveToRevision = async (id: string, notes: string) => {
    await updateApplication(id, {
      status: "revision",
      revisionNotes: notes
    });
  };

  const moveToPublication = async (id: string) => {
    await updateApplication(id, {
      status: "publication"
    });
  };

  const moveToCompleted = async (id: string) => {
    await updateApplication(id, {
      status: "completed"
    });
  };

  /* ===============================
     SAVE DRAFT
  =============================== */

  const saveDraft = async (
    data: Omit<Application, "id" | "createdAt" | "updatedAt" | "status">
  ) => {
    try {
      const res = await fetch("/api/evacuations/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include"
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error);
      }
      setApplications(prev => [...prev, result.data]);
    } catch (error) {
      console.error("Save draft error:", error);
    }
  };

  /* ===============================
     FILTER STATUS
  =============================== */

  const getApplicationsByStatus = (status: Application["status"]) => {
    return applications.filter(app => app.status === status);
  };

  return (

    <ApplicationContext.Provider
      value={{
        applications,
        fetchApplications,
        addApplication,
        updateApplication,

        deleteApplication,
        moveToVerification,
        moveToRevision,
        moveToPublication,
        moveToCompleted,
        saveDraft,
        getApplicationsByStatus
      }}
    >

      {children}

    </ApplicationContext.Provider>

  );
}

/* ===============================
   HOOK
=============================== */

export function useApplications() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error(
      "useApplications must be used within ApplicationProvider"
    );
  }
  return context;
  
}
# Air Medical Evacuation System - Schema Migration

This document outlines the migration from a generic medical evacuation system to the specialized Indonesian Air Medical Evacuation (Pembidangan Medis Udara) system.

## What Changed

### 1. Database Schema

**Old Schema**: `evacuation_requests` table with generic fields
```sql
- patient_name
- patient_age
- patient_condition
- location
- destination
- priority_level
- status (pending, approved, rejected, in_transit, completed)
- medical_notes
```

**New Schema**: `air_medical_evacuation` table with comprehensive Indonesian air medical fields
```sql
-- Flight Information
- jenisLayanan (Keberangkatan/Kedatangan)
- jenisPesawat (Komersial/jetPribadi)
- namaMaskapai
- noPenerbangan
- noKursi
- tanggalPerjalanan
- jamPerjalanan

-- Ground Handling
- namaGroundhandling
- namaPetugas
- noTeleponKantor
- emailPerusahaan

-- Patient Information
- namaPasien
- jenisKelamin (lakiLaki/Perempuan)
- tanggalLahir

-- Vital Signs
- tekananDarah (Blood Pressure)
- nadi (Heart Rate)
- frekuensiPernafasan (Respiratory Rate)
- saturasiOksigen (Oxygen Saturation)
- tingkatKesadaran (Consciousness Level)
- oksigen (yes/no)
- posisiPasien (duduk/berbaring)

-- Companions
- jumlahPendamping (Number of Companions)
- hubunganPasien (Keluarga/Dokter/Perawat/Lainnya)
- namaPendamping
- noTeleponPendamping
- noTeleponKeluarga

-- Documents (NEW - File Upload Support)
- fotoKondisiPasien
- ktpPasien
- manifetPrivateJet
- rekamMedisPasien
- suratRujukan
- tiketPesawat
- dokumentPetugasMedis

-- Status (Updated Values)
- status (pending/valid/canceled/reviewed)
```

### 2. File Upload Infrastructure

**New Files Created**:
- `/lib/file-upload.ts` - File upload utilities with validation
- `/app/api/upload/medical-document/route.ts` - File upload API endpoint

**Features**:
- Automatic directory creation
- File type validation (JPEG, PNG, WebP, PDF)
- File size validation (10MB limit)
- Secure filename generation with timestamps and random hashes
- Directory traversal attack prevention

### 3. API Updates

#### GET `/api/evacuations`
- Updated to query `air_medical_evacuation` table
- Returns complete air medical evacuation records
- Admin sees all records with user details, users see only their own

#### POST `/api/evacuations`
- Now accepts FormData with file uploads
- Automatically uploads medical documents to `/public/uploads/medical-documents/`
- Stores file paths in database
- Enhanced audit logging with uploaded file tracking

#### GET `/api/evacuations/[id]`
- Updated to use new table and field names
- Returns complete air medical evacuation record

#### PUT `/api/evacuations/[id]`
- Updated allowed fields for air medical evacuation
- Admins can modify any field including status
- Users can only modify patient medical information

#### DELETE `/api/evacuations/[id]`
- Remains the same, now deletes from new table

### 4. UI Components

#### Evacuation Form (`/app/dashboard/evacuation/form.tsx`)
**Major Rewrite** with new sections:

1. **Service Type & Aircraft**
   - Jenis Layanan dropdown (Keberangkatan/Kedatangan)
   - Jenis Pesawat dropdown (Komersial/jetPribadi)

2. **Ground Handling & Company**
   - Nama Ground Handling
   - Nama Petugas
   - No Telepon Kantor
   - Email Perusahaan

3. **Airlines & Flight**
   - Nama Maskapai
   - No Penerbangan
   - No Kursi

4. **Travel Date & Time**
   - Tanggal Perjalanan (required)
   - Jam Perjalanan

5. **Patient Information** (NEW Section)
   - Nama Pasien (required)
   - Jenis Kelamin dropdown
   - Tanggal Lahir

6. **Vital Signs** (NEW Section with proper medical fields)
   - Tekanan Darah
   - Nadi
   - Frekuensi Pernafasan
   - Saturasi Oksigen
   - Tingkat Kesadaran
   - Oksigen required (yes/no)
   - Posisi Pasien (duduk/berbaring)

7. **Companions** (NEW Section)
   - Jumlah Pendamping
   - Hubungan Pasien dropdown
   - Nama Pendamping
   - No Telepon Pendamping
   - No Telepon Keluarga

8. **Documents** (NEW - File Upload Section)
   - Foto Kondisi Pasien
   - KTP Pasien
   - Manfet Private Jet
   - Rekam Medis Pasien
   - Surat Rujukan
   - Tiket Pesawat
   - Dokumen Petugas Medis

9. **Status** (Admin Only)
   - Status dropdown with new values

### 5. Database Migration Script

**File**: `/scripts/setup-mysql.sql`

Changes:
- Replaced `evacuation_requests` table with `air_medical_evacuation`
- Updated column names to match Indonesian field names
- Changed ID from INT AUTO_INCREMENT to VARCHAR(36) UUID
- Added proper charset and collation (utf8mb4_general_ci)
- Updated foreign keys and indexes
- All document fields now VARCHAR(500) to store full paths

### 6. Documentation

**New Files**:
- `/SCHEMA.md` - Comprehensive database schema documentation
- `/MIGRATION.md` - This file, documenting the changes
- Updated `/SETUP.md` - Now references air medical system

---

## Data Migration Guide

If you have existing evacuation data, here's how to migrate:

```sql
-- Create backup of old data
CREATE TABLE evacuation_requests_backup AS SELECT * FROM evacuation_requests;

-- Map old fields to new schema where applicable
INSERT INTO air_medical_evacuation (
  user_id,
  namaPasien,
  tanggalPerjalanan,
  status,
  created_at,
  updated_at
)
SELECT
  user_id,
  patient_name,
  DATE(request_date),
  CASE status
    WHEN 'pending' THEN 'pending'
    WHEN 'approved' THEN 'valid'
    WHEN 'rejected' THEN 'canceled'
    WHEN 'completed' THEN 'reviewed'
    ELSE 'pending'
  END,
  created_at,
  updated_at
FROM evacuation_requests_backup;

-- Drop old table after verification
-- DROP TABLE evacuation_requests;
```

---

## Installation & Setup

### 1. Database Setup
```bash
mysql -u root -p < scripts/setup-mysql.sql
```

### 2. Environment Variables
Ensure these are set in `.env.local`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medical_evacuation
DB_PORT=3306
```

### 3. Create Upload Directory
```bash
mkdir -p public/uploads/medical-documents
chmod 755 public/uploads/medical-documents
```

### 4. Run Application
```bash
npm install
npm run dev
```

---

## Breaking Changes

1. **Table Name**: `evacuation_requests` → `air_medical_evacuation`
2. **ID Type**: INT → VARCHAR(36) UUID
3. **Status Values**: Different enums
   - Old: pending, approved, rejected, in_transit, completed
   - New: pending, valid, canceled, reviewed
4. **API Request Format**: JSON → FormData (to support file uploads)
5. **Field Names**: Camel case Indonesian names (e.g., `namaPasien` instead of `patient_name`)

---

## Testing Checklist

- [ ] Database migration runs without errors
- [ ] Demo admin account created successfully
- [ ] File upload functionality works for all document types
- [ ] File size validation working (>10MB rejected)
- [ ] File type validation working (non-image/PDF rejected)
- [ ] Form submits with and without documents
- [ ] Admin can view all evacuations
- [ ] Users see only their own evacuations
- [ ] Status can be changed by admin
- [ ] Audit logs record all actions with file uploads
- [ ] Old data migrated correctly (if applicable)

---

## Performance Considerations

- Added indexes on `user_id`, `status`, and `tanggalPerjalanan` for query optimization
- File uploads stored in `/public/uploads/` with UUID-based naming to prevent collisions
- Consider implementing CDN for file serving in production
- Database queries now more specific due to expanded schema

---

## Security Notes

- All file uploads validated for type and size before storage
- Filenames regenerated with crypto-random component to prevent enumeration
- Directory traversal protection implemented
- All user actions logged in audit trail
- Session-based authentication remains unchanged
- File access currently public (consider implementing access control in production)

---

## Future Enhancements

1. Implement file access control (only user and admin can view)
2. Add file download with audit logging
3. Implement virus scanning for uploaded files
4. Add file expiration/cleanup policies
5. Implement cloud storage (S3, etc.) for scalability
6. Add batch import capability
7. Implement report generation (PDF export of records)
8. Add email notifications for status changes

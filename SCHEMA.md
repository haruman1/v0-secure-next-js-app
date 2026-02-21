# Air Medical Evacuation System - Database Schema

This document describes the complete database schema for the Air Medical Evacuation (Pembidangan Medis Udara) system.

## Tables

### users
Stores system users with role-based access control.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment primary key |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| full_name | VARCHAR(255) | User's full name |
| phone | VARCHAR(20) | Contact phone number |
| role | ENUM('admin', 'user') | User role (admin or user) |
| is_active | BOOLEAN | Account status |
| created_at | TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
| last_login | TIMESTAMP | Last login timestamp |

**Indexes**: idx_email, idx_role

---

### air_medical_evacuation
Main table for air medical evacuation records with complete patient and flight information.

#### Flight Information
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) (PK) | UUID primary key |
| user_id | INT | FK to users table |
| jenisLayanan | ENUM('Keberangkatan','Kedatangan') | Service type: Departure or Arrival |
| jenisPesawat | ENUM('Komersial','jetPribadi') | Aircraft type: Commercial or Private Jet |
| tanggalPerjalanan | DATE | Travel date |
| jamPerjalanan | TIME | Travel time |
| namaMaskapai | VARCHAR(255) | Airline name |
| noPenerbangan | VARCHAR(255) | Flight number |
| noKursi | VARCHAR(20) | Seat number |

#### Ground Handling & Company
| Column | Type | Description |
|--------|------|-------------|
| namaGroundhandling | VARCHAR(255) | Ground handling company name |
| namaPetugas | VARCHAR(255) | Officer/staff name |
| noTeleponKantor | VARCHAR(50) | Office phone number |
| emailPerusahaan | VARCHAR(255) | Company email |

#### Patient Information
| Column | Type | Description |
|--------|------|-------------|
| namaPasien | VARCHAR(255) | Patient's full name |
| jenisKelamin | ENUM('lakiLaki','Perempuan') | Gender: Male or Female |
| tanggalLahir | DATE | Date of birth |

#### Vital Signs & Medical Status
| Column | Type | Description |
|--------|------|-------------|
| tekananDarah | VARCHAR(50) | Blood pressure (mmHg) |
| nadi | VARCHAR(10) | Heart rate (bpm) |
| frekuensiPernafasan | VARCHAR(10) | Respiratory rate (/min) |
| saturasiOksigen | VARCHAR(10) | Oxygen saturation (%) |
| tingkatKesadaran | VARCHAR(100) | Level of consciousness |
| oksigen | ENUM('ya','tidak') | Oxygen requirement |
| posisiPasien | ENUM('duduk','berbaring') | Patient position: Sitting or Lying |

#### Companion Information
| Column | Type | Description |
|--------|------|-------------|
| jumlahPendamping | INT | Number of companions |
| hubunganPasien | ENUM('Keluarga','Dokter','Perawat','Lainnya') | Relationship: Family, Doctor, Nurse, Other |
| namaPendamping | VARCHAR(255) | Companion's name |
| noTeleponPendamping | VARCHAR(50) | Companion's phone |
| noTeleponKeluarga | VARCHAR(50) | Family contact phone |

#### Status & Documents
| Column | Type | Description |
|--------|------|-------------|
| status | ENUM('pending','valid','canceled','reviewed') | Request status |
| noSuratPraktik | VARCHAR(255) | License/practice document number |
| fotoKondisiPasien | VARCHAR(500) | Patient condition photo path |
| ktpPasien | VARCHAR(500) | Patient ID copy path |
| manifetPrivateJet | VARCHAR(500) | Private jet manifest path |
| rekamMedisPasien | VARCHAR(500) | Patient medical record path |
| suratRujukan | VARCHAR(500) | Referral letter path |
| tiketPesawat | VARCHAR(500) | Ticket path |
| dokumentPetugasMedis | VARCHAR(500) | Medical officer documentation path |

#### Metadata
| Column | Type | Description |
|--------|------|-------------|
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes**: idx_user_id, idx_status, idx_tanggal_perjalanan

---

### password_reset_tokens
Stores password reset tokens for email recovery and OTP-based reset.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment primary key |
| user_id | INT (FK) | Reference to users table |
| token | VARCHAR(255) | Unique reset token |
| token_type | ENUM('email_verification', 'otp') | Token type |
| otp_code | VARCHAR(6) | 6-digit OTP if token_type='otp' |
| expires_at | TIMESTAMP | Token expiration time |
| used | BOOLEAN | Whether token has been used |
| created_at | TIMESTAMP | Token creation time |

**Indexes**: idx_user_id, idx_token, idx_expires_at

---

### sessions
Stores active user sessions for session-based authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) (PK) | Session ID |
| user_id | INT (FK) | Reference to users table |
| expires_at | TIMESTAMP | Session expiration time |
| created_at | TIMESTAMP | Session creation time |

**Indexes**: idx_user_id, idx_expires_at

---

### audit_logs
Tracks all system actions for security and audit purposes.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment primary key |
| user_id | INT (FK) | User performing action |
| action | VARCHAR(255) | Action performed (e.g., EVACUATION_REQUEST_CREATED) |
| entity_type | VARCHAR(100) | Entity type (e.g., air_medical_evacuation) |
| entity_id | VARCHAR(36) | ID of the affected entity |
| details | JSON | Additional action details |
| ip_address | VARCHAR(45) | IP address of request |
| user_agent | TEXT | User agent string |
| created_at | TIMESTAMP | Action timestamp |

**Indexes**: idx_user_id, idx_action, idx_created_at

---

## Relationships

```
users (1) ──────── (M) air_medical_evacuation
users (1) ──────── (M) password_reset_tokens
users (1) ──────── (M) sessions
users (1) ──────── (M) audit_logs
```

## Field Mappings - Indonesian to English

| Indonesian | English |
|------------|---------|
| jenisLayanan | Service Type |
| Keberangkatan | Departure |
| Kedatangan | Arrival |
| jenisPesawat | Aircraft Type |
| jetPribadi | Private Jet |
| namaGroundhandling | Ground Handling Name |
| namaPetugas | Officer/Staff Name |
| noTeleponKantor | Office Phone |
| emailPerusahaan | Company Email |
| namaMaskapai | Airline Name |
| noPenerbangan | Flight Number |
| noKursi | Seat Number |
| tanggalPerjalanan | Travel Date |
| jamPerjalanan | Travel Time |
| namaPasien | Patient Name |
| jenisKelamin | Gender |
| lakiLaki | Male |
| Perempuan | Female |
| tanggalLahir | Date of Birth |
| oksigen | Oxygen Required |
| posisiPasien | Patient Position |
| duduk | Sitting |
| berbaring | Lying Down |
| tingkatKesadaran | Consciousness Level |
| tekananDarah | Blood Pressure |
| nadi | Heart Rate |
| frekuensiPernafasan | Respiratory Rate |
| saturasiOksigen | Oxygen Saturation |
| jumlahPendamping | Number of Companions |
| hubunganPasien | Relationship to Patient |
| namaPendamping | Companion Name |
| noTeleponPendamping | Companion Phone |
| noTeleponKeluarga | Family Phone |
| noSuratPraktik | Practice License Number |
| fotoKondisiPasien | Patient Condition Photo |
| ktpPasien | Patient ID Copy |
| manifetPrivateJet | Private Jet Manifest |
| rekamMedisPasien | Patient Medical Record |
| suratRujukan | Referral Letter |
| tiketPesawat | Airline Ticket |
| dokumentPetugasMedis | Medical Officer Documentation |

## Status Values

- **pending**: Initial state, awaiting review
- **valid**: Request validated and approved
- **reviewed**: Request has been reviewed
- **canceled**: Request was canceled

## File Upload Fields

The following fields store file paths for uploaded medical documents:

1. **fotoKondisiPasien** - Patient condition photo (JPG, PNG, WebP, PDF)
2. **ktpPasien** - Patient ID copy (JPG, PNG, WebP, PDF)
3. **manifetPrivateJet** - Private jet manifest (JPG, PNG, WebP, PDF)
4. **rekamMedisPasien** - Patient medical records (JPG, PNG, WebP, PDF)
5. **suratRujukan** - Referral letter (JPG, PNG, WebP, PDF)
6. **tiketPesawat** - Airline ticket (JPG, PNG, WebP, PDF)
7. **dokumentPetugasMedis** - Medical officer documentation (JPG, PNG, WebP, PDF)

All files are uploaded to `/public/uploads/medical-documents/` with unique filenames.

## Default Demo Data

A default admin user is created during database initialization:

- **Email**: admin@example.com
- **Password**: admin123
- **Role**: admin
- **Status**: active

## Constraints

- All IDs use UUID (v4) format for air_medical_evacuation table
- User IDs use auto-increment integers
- Email addresses must be unique
- File paths are stored as VARCHAR(500) to accommodate long paths
- All timestamps use UTC timezone
- Foreign key constraints cascade on user deletion

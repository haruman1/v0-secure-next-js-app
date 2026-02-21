-- Air Medical Evacuation System - MySQL Database Setup
-- Sistem Pembidangan Medis Udara

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Air Medical Evacuation table (Pembidangan Medis Udara)
CREATE TABLE IF NOT EXISTS air_medical_evacuation (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  jenisLayanan ENUM('Keberangkatan','Kedatangan'),
  jenisPesawat ENUM('Komersial','jetPribadi'),
  namaGroundhandling VARCHAR(255),
  namaPetugas VARCHAR(255),
  noTeleponKantor VARCHAR(50),
  emailPerusahaan VARCHAR(255),
  namaMaskapai VARCHAR(255),
  noPenerbangan VARCHAR(255),
  noKursi VARCHAR(20),
  tanggalPerjalanan DATE,
  jamPerjalanan TIME,
  namaPasien VARCHAR(255),
  jenisKelamin ENUM('lakiLaki','Perempuan'),
  tanggalLahir DATE,
  oksigen ENUM('ya','tidak'),
  posisiPasien ENUM('duduk','berbaring'),
  tingkatKesadaran VARCHAR(100),
  tekananDarah VARCHAR(50),
  nadi VARCHAR(10),
  frekuensiPernafasan VARCHAR(10),
  saturasiOksigen VARCHAR(10),
  jumlahPendamping INT,
  hubunganPasien ENUM('Keluarga','Dokter','Perawat','Lainnya'),
  namaPendamping VARCHAR(255),
  noTeleponPendamping VARCHAR(50),
  noTeleponKeluarga VARCHAR(50),
  status ENUM('pending','valid','canceled','reviewed') DEFAULT 'pending',
  noSuratPraktik VARCHAR(255),
  fotoKondisiPasien VARCHAR(500),
  ktpPasien VARCHAR(500),
  manifetPrivateJet VARCHAR(500),
  rekamMedisPasien VARCHAR(500),
  suratRujukan VARCHAR(500),
  tiketPesawat VARCHAR(500),
  dokumentPetugasMedis VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_tanggal_perjalanan (tanggalPerjalanan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  token_type ENUM('email_verification', 'otp') NOT NULL,
  otp_code VARCHAR(6),
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(36),
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES ('admin@example.com', '$2b$10$YIjlrKpJE5WjNzKUWCLLu.5DWLvk0K6LzKJ9V3U0R3lJqLhm.QHfG', 'System Admin', 'admin', TRUE)
ON DUPLICATE KEY UPDATE id=id;

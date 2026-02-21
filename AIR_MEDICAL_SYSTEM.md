# Air Medical Evacuation System - Complete Implementation Guide

## Overview

This is a comprehensive Indonesian Air Medical Evacuation (Pembidangan Medis Udara) management system built with Next.js 16, MySQL, and TypeScript. The system handles complete medical flight evacuation records with patient information, vital signs, flight details, companion tracking, and medical document uploads.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  - Authentication Pages (Login, Register, Password Recovery) │
│  - Admin Dashboard (System Overview & User Management)       │
│  - User Dashboard (Personal Evacuation Records)              │
│  - Air Medical Evacuation Form with File Upload              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   API Routes (Next.js)                       │
│  - Auth Routes (login, register, password recovery)          │
│  - Evacuation CRUD (Create, Read, Update, Delete)           │
│  - File Upload Endpoints                                     │
│  - Audit Logging                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Backend Services                            │
│  - Session Management (HTTP-only cookies)                    │
│  - Password Hashing (bcrypt)                                 │
│  - File Upload Handler (with validation)                     │
│  - Database Query Layer                                      │
│  - Audit Trail Logging                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   MySQL Database                             │
│  - users: User accounts with roles                           │
│  - air_medical_evacuation: Main evacuation records           │
│  - password_reset_tokens: Password recovery tokens           │
│  - sessions: Active user sessions                            │
│  - audit_logs: Complete action history                       │
└──────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 File Storage                                 │
│  - /public/uploads/medical-documents/ - Uploaded files       │
│  - Secure filename generation with UUID                      │
│  - Type and size validation                                  │
└──────────────────────────────────────────────────────────────┘
```

## Features

### 1. Authentication & Authorization
- **Session-Based Auth**: Secure HTTP-only cookies with 24-hour expiration
- **Password Security**: Bcrypt hashing with 10 salt rounds
- **Password Recovery**: Dual method (email links + OTP codes)
  - Email verification: 60-minute expiry
  - OTP: 5-minute expiry with max 3 attempts
- **Role-Based Access**: Admin (full access) and User (own records only)

### 2. Air Medical Evacuation Management

#### Flight Information
- Service type: Keberangkatan (Departure) / Kedatangan (Arrival)
- Aircraft type: Komersial (Commercial) / jetPribadi (Private Jet)
- Airline and flight number tracking
- Travel date and time
- Seat assignment
- Ground handling company coordination

#### Patient Information
- Complete patient demographics
- Date of birth tracking
- Gender (Laki-laki/Perempuan)

#### Vital Signs Monitoring
- Blood Pressure (Tekanan Darah)
- Heart Rate (Nadi)
- Respiratory Rate (Frekuensi Pernafasan)
- Oxygen Saturation (Saturasi Oksigen)
- Consciousness Level (Tingkat Kesadaran)
- Oxygen requirement (yes/no)
- Patient position: duduk (sitting) or berbaring (lying)

#### Companion Tracking
- Number of companions
- Relationship to patient (Keluarga/Dokter/Perawat/Lainnya)
- Companion contact information
- Family emergency contact

#### Document Management
- 7 document types supported:
  1. Patient condition photo (fotoKondisiPasien)
  2. Patient ID copy (ktpPasien)
  3. Private jet manifest (manifetPrivateJet)
  4. Patient medical record (rekamMedisPasien)
  5. Referral letter (suratRujukan)
  6. Airline ticket (tiketPesawat)
  7. Medical officer documentation (dokumentPetugasMedis)

- Supported formats: JPEG, PNG, WebP, PDF
- File size limit: 10MB per file
- Secure upload with UUID-based naming

### 3. Dashboards

#### Admin Dashboard
- System-wide evacuation overview
- Filter by status, date range, airline
- Sort by patient name, date, status
- User statistics
- Audit trail viewer
- Status management (pending → valid → reviewed → canceled)

#### User Dashboard
- Personal evacuation records
- Create new evacuation requests
- View request status and history
- Edit own patient information (not status)
- Document upload and review
- Request details with all information

### 4. Security

- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: React's built-in escaping
- **CSRF Protection**: Secure session tokens
- **File Upload Security**:
  - Type validation (whitelist: JPEG, PNG, WebP, PDF)
  - Size validation (max 10MB)
  - Filename randomization
  - Directory traversal prevention
- **Access Control**: Role-based authorization on all endpoints
- **Audit Logging**: All actions tracked with user, timestamp, and details

### 5. Database

**5 Tables**:
1. **users** - User accounts with roles (admin/user)
2. **air_medical_evacuation** - Main evacuation records with 30+ fields
3. **password_reset_tokens** - Email/OTP recovery tokens
4. **sessions** - Active user sessions
5. **audit_logs** - Complete action history

**Relationships**:
- users (1) → (M) air_medical_evacuation
- users (1) → (M) password_reset_tokens
- users (1) → (M) sessions
- users (1) → (M) audit_logs

## Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or pnpm

### Step 1: Install Dependencies
```bash
npm install
# or
pnpm install
```

### Step 2: Setup Database
```bash
# Create database and tables
mysql -u root -p < scripts/setup-mysql.sql
```

### Step 3: Environment Variables
Create `.env.local`:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medical_evacuation
DB_PORT=3306

# Session
SESSION_SECRET=your_random_secret_key_here

# Email (for password recovery)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@medicalevasion.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Run Application
```bash
npm run dev
# or
pnpm dev
```

Visit http://localhost:3000

### Step 5: Login
**Demo Admin Account**:
- Email: admin@example.com
- Password: admin123

## Usage Guide

### For Users

1. **Register**: Create a new account (requires admin approval)
2. **Create Evacuation**: Fill out air medical evacuation form
   - Complete flight information
   - Enter patient details
   - Record vital signs
   - Add companion information
   - Upload medical documents
3. **Track Status**: View your evacuation requests
4. **Update Information**: Edit patient details before approval
5. **View History**: Access past evacuation records

### For Admins

1. **Dashboard**: View all evacuations in system
2. **Filter & Sort**: Find specific records
3. **Approve Records**: Change status to 'valid' or 'reviewed'
4. **Cancel Records**: Mark as 'canceled' if needed
5. **View Audit Log**: See all system actions
6. **Manage Users**: (Future feature) Approve/reject new users

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/request-password-reset` - Request reset
- `POST /api/auth/reset-password` - Confirm password reset

### Evacuations
- `GET /api/evacuations` - List evacuations (user's or all for admin)
- `POST /api/evacuations` - Create new evacuation with files
- `GET /api/evacuations/[id]` - Get evacuation details
- `PUT /api/evacuations/[id]` - Update evacuation
- `DELETE /api/evacuations/[id]` - Delete evacuation

### Files
- `POST /api/upload/medical-document` - Upload medical document

## File Structure

```
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   ├── evacuations/        # Evacuation CRUD endpoints
│   │   └── upload/             # File upload endpoints
│   ├── auth/                   # Auth pages (login, register, etc)
│   ├── dashboard/
│   │   ├── admin/              # Admin dashboard
│   │   ├── user/               # User dashboard
│   │   └── evacuation/         # Evacuation pages and form
│   ├── context/                # React contexts
│   ├── globals.css             # Global styles
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── [custom components]
├── lib/
│   ├── db.ts                   # Database connection
│   ├── auth.ts                 # Auth utilities
│   ├── session.ts              # Session management
│   ├── file-upload.ts          # File upload utilities
│   └── utils.ts                # Helper functions
├── public/
│   └── uploads/
│       └── medical-documents/  # Uploaded files
├── scripts/
│   └── setup-mysql.sql         # Database schema
├── SCHEMA.md                   # Database documentation
├── MIGRATION.md                # Schema migration guide
├── SETUP.md                    # Setup guide
└── AIR_MEDICAL_SYSTEM.md       # This file
```

## Field Reference (Indonesian → English)

See `SCHEMA.md` for complete field mapping.

## Status Workflow

```
pending (Initial)
   ↓
valid (Approved - ready for evacuation)
   ↓
reviewed (Completed - evacuation done)

OR

canceled (Rejected/Canceled anytime)
```

## Database Backup & Restore

### Backup
```bash
mysqldump -u root -p medical_evacuation > backup.sql
```

### Restore
```bash
mysql -u root -p medical_evacuation < backup.sql
```

## Troubleshooting

### Database Connection Issues
- Check DB_HOST, DB_USER, DB_PASSWORD in .env.local
- Verify MySQL server is running
- Ensure database name is correct

### File Upload Issues
- Check `/public/uploads/medical-documents/` directory exists
- Verify directory permissions (chmod 755)
- Check file size (max 10MB)
- Verify file format (JPEG, PNG, WebP, PDF)

### Session Issues
- Clear browser cookies
- Verify SESSION_SECRET is set
- Check session expiration (24 hours)

### Email Recovery Issues
- Verify email credentials in .env.local
- Check SMTP settings (Gmail requires app-specific password)
- Verify EMAIL_FROM address

## Security Considerations

1. **Production Deployment**:
   - Use environment-specific .env files
   - Enable HTTPS
   - Set secure SESSION_SECRET
   - Use strong database password
   - Consider implementing rate limiting

2. **File Storage**:
   - Consider cloud storage (S3, etc.) for production
   - Implement file access control
   - Add virus scanning for uploads
   - Set file expiration policies

3. **Database**:
   - Regular backups
   - Database encryption
   - User-level permissions
   - Query logging for audit

## Performance Tips

- Database indexes on frequently queried fields (user_id, status, date)
- File uploads to local storage fast for development
- Consider CDN for file delivery in production
- Implement pagination for large result sets
- Add query caching for frequently accessed data

## Future Enhancements

- [ ] Batch import capability
- [ ] PDF report generation
- [ ] Email notifications for status changes
- [ ] SMS alerts for critical cases
- [ ] Integration with medical systems
- [ ] Real-time tracking
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Advanced analytics and reporting

## Support & Documentation

- **Schema**: See `SCHEMA.md`
- **Migration**: See `MIGRATION.md`
- **Setup**: See `SETUP.md`
- **API**: Check route files in `/app/api/`
- **Components**: Check React components in `/app/` and `/components/`

## License

This project is for medical evacuation management use only.

## Version History

- **v1.0** - Initial release with Indonesian Air Medical Evacuation schema
  - Complete CRUD operations
  - File upload support
  - Admin and user dashboards
  - Authentication and authorization
  - Audit logging

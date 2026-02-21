# Air Medical Evacuation System - Setup Guide

This is a secure air medical evacuation (Pembidangan Medis Udara) management CRUD application built with Next.js, MySQL, and comprehensive authentication/authorization features. Designed for managing medical flight evacuations with complete patient, crew, and document tracking.

## Features

✅ **Authentication System**
- Session-based authentication with bcrypt password hashing
- Secure session management with HTTP-only cookies
- Email-based password recovery with both verification links (60-min expiry) and OTP codes (5-min expiry)
- Audit logging for all authentication events

✅ **Role-Based Access Control**
- Admin role: Full system access, user management, system-wide evacuation overview, audit logs
- User role: Can create and manage their own evacuation requests

✅ **Air Medical Evacuation Management**
- Complete Indonesian air medical evacuation schema (Pembidangan Medis Udara)
- Full CRUD operations on evacuation records
- Service type tracking: Departure (Keberangkatan) or Arrival (Kedatangan)
- Aircraft types: Commercial or Private Jet
- Patient health monitoring: Vital signs, oxygen requirements, consciousness level
- Companion/family tracking with contact details
- Status tracking: Pending, Valid, Canceled, Reviewed

✅ **File Upload & Document Management**
- Upload and store medical documents (photos, ID copies, medical records, referral letters, tickets)
- File size limits and type validation
- Secure file storage in public/uploads directory
- Supported formats: JPEG, PNG, WebP, PDF

✅ **Security Features**
- Parameterized SQL queries to prevent SQL injection
- Input validation and sanitization
- CSRF protection with secure session tokens
- XSS prevention with proper escaping
- File upload security with type/size validation
- Rate limiting ready (needs external implementation)
- Audit trail logging for all actions

✅ **User Dashboards**
- Admin dashboard: System-wide evacuation overview, filtering, sorting
- User dashboard: Personal evacuation tracking, request history

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or pnpm

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medical_evacuation

# Email Configuration (for password recovery)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@medical-evacuation.com

# Application URL
APP_URL=http://localhost:3000
NODE_ENV=development
```

### Email Setup

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password as `EMAIL_PASSWORD`

For other providers, update `EMAIL_HOST`, `EMAIL_PORT`, and `EMAIL_SECURE` accordingly.

## Installation & Setup

1. **Install dependencies:**
```bash
pnpm install
```

2. **Create MySQL database:**
```bash
mysql -u root -p
```

```sql
CREATE DATABASE medical_evacuation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Run database migration:**
```bash
mysql -u root -p medical_evacuation < scripts/setup-mysql.sql
```

4. **Start development server:**
```bash
pnpm dev
```

5. **Access the application:**
- Navigate to `http://localhost:3000`
- Login with demo account:
  - Email: `admin@example.com`
  - Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token/OTP

### Evacuations (Protected)
- `GET /api/evacuations` - Get evacuations (admin sees all, users see theirs)
- `POST /api/evacuations` - Create new evacuation request
- `GET /api/evacuations/:id` - Get evacuation details
- `PUT /api/evacuations/:id` - Update evacuation (admin can change status)
- `DELETE /api/evacuations/:id` - Delete evacuation request

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `full_name` - User's full name
- `phone` - Phone number
- `role` - 'admin' or 'user'
- `is_active` - Account status
- `last_login` - Last login timestamp
- `created_at`, `updated_at` - Timestamps

### Evacuation Requests Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `patient_name` - Patient's full name
- `patient_age` - Patient's age
- `patient_condition` - Medical condition description
- `location` - Current location
- `destination` - Target hospital
- `priority_level` - low, medium, high, critical
- `status` - pending, approved, in_transit, completed, cancelled
- `medical_notes` - Additional medical information
- `contact_person` - Contact person name
- `contact_phone` - Contact phone number
- `request_date`, `approval_date`, `completed_date` - Timestamps
- `created_at`, `updated_at` - Timestamps

### Password Reset Tokens Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `token` - Unique reset token
- `token_type` - email_verification or otp
- `otp_code` - 6-digit OTP (if applicable)
- `expires_at` - Expiration timestamp
- `used` - Whether token has been used
- `created_at` - Created timestamp

### Sessions Table
- `id` - Session ID
- `user_id` - Foreign key to users
- `expires_at` - Session expiration
- `created_at` - Created timestamp

### Audit Logs Table
- `id` - Primary key
- `user_id` - Foreign key to users (nullable)
- `action` - Action type
- `entity_type` - Type of entity affected
- `entity_id` - ID of entity affected
- `details` - JSON details
- `ip_address` - Client IP
- `user_agent` - Client user agent
- `created_at` - Timestamp

## Project Structure

```
/app
  /api - API routes
    /auth - Authentication endpoints
    /evacuations - Evacuation CRUD endpoints
  /auth - Authentication pages
    /login
    /register
    /forgot-password
    /reset-password
  /dashboard - Dashboard pages
    /admin - Admin dashboard
    /user - User dashboard
    /evacuation - Evacuation management
  /context - React contexts
    auth-context.tsx - Authentication state management
/lib
  /db.ts - Database connection
  /auth.ts - Authentication utilities
  /session.ts - Session management
/scripts
  /setup-mysql.sql - Database migration
```

## Security Best Practices Implemented

1. **Password Security**
   - Bcrypt hashing with 10 rounds
   - Minimum 8 characters with complexity requirements
   - Secure password reset flow

2. **Session Management**
   - Cryptographically secure session IDs
   - HTTP-only cookies to prevent XSS attacks
   - 24-hour session expiration
   - Automatic cleanup of expired sessions

3. **Data Protection**
   - Parameterized queries to prevent SQL injection
   - Input validation on all forms
   - Proper error handling without exposing sensitive info
   - Encryption-ready for production deployment

4. **Audit & Compliance**
   - Comprehensive audit logging
   - Tracks user actions, IPs, and user agents
   - Failed login attempt logging
   - Password reset event logging

5. **Access Control**
   - Role-based access control (RBAC)
   - Users can only access their own data
   - Admins can access and manage all evacuations
   - Authorization checks on all API endpoints

## Deployment Checklist

- [ ] Update environment variables for production
- [ ] Set `NODE_ENV=production`
- [ ] Configure email service (Gmail, SendGrid, etc.)
- [ ] Enable HTTPS and secure cookies
- [ ] Set strong database password
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up monitoring and alerting
- [ ] Review audit logs regularly
- [ ] Implement rate limiting (suggestion: use external service)

## Development Tips

- Check `/api/auth/me` to verify session status
- Audit logs are stored in `audit_logs` table
- All timestamps use UTC
- Session tokens are cryptographically secure UUIDs
- Password reset links are valid for 1 hour
- OTP codes are valid for 5 minutes

## Troubleshooting

**Database Connection Error**
- Verify MySQL is running
- Check credentials in `.env.local`
- Ensure database and tables exist

**Email Not Sending**
- Check email credentials in `.env.local`
- Enable 2FA for Gmail and use App Password
- Check SMTP port (usually 587 for TLS)

**Session Not Persisting**
- Ensure cookies are enabled in browser
- Check session table in database
- Verify SESSION_DURATION in `lib/session.ts`

## License

Proprietary - Medical Evacuation System

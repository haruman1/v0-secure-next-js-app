# Air Medical Evacuation System

A comprehensive Indonesian Air Medical Evacuation (Pembidangan Medis Udara) management system built with Next.js 16, MySQL, and TypeScript. This system streamlines the process of recording, tracking, and managing medical flight evacuations.

## 🚀 Overview

This application handles complete medical flight evacuation records, including patient demographics, vital signs monitoring, flight details, companion tracking, and secure medical document management.

## ✨ Key Features

- **Secure Authentication**: Role-based access control (Admin/User) with session-based auth and password recovery.
- **Evacuation Management**: Full CRUD operations for evacuation records with 30+ field mappings.
- **Vital Signs Monitoring**: Track BP, Heart Rate, Respiration, O2 Saturation, and consciousness levels.
- **Flight & Companion Tracking**: Coordinate flight details, aircraft types (Commercial/Private), and companion information.
- **Document Management**: Securely upload and manage 7 different types of medical documents (PDF/Images) with UUID-based naming.
- **Interactive Dashboards**: Role-specific dashboards for managing personal records or system-wide operations.
- **Audit Logging**: Comprehensive action history for security and accountability.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MySQL 8.0](https://www.mysql.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Authentication**: Custom Session-based Auth with `bcrypt`

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or pnpm

### 1. Installation

```bash
npm install
# or
pnpm install
```

### 2. Database Setup

Create the database and tables using the provided script:

```bash
mysql -u root -p < scripts/setup-mysql.sql
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

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
EMAIL_FROM=noreply@medicalevacuation.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Running the App

```bash
npm run dev
```

Visit [http://localhost:3009](http://localhost:3009) (Default port set in package.json).

## 📂 Project Structure

- `/app`: Next.js App Router (api/pages)
- `/components`: Reusable React components
- `/lib`: Database connection, auth, and utilities
- `/public`: Static assets and uploaded documents
- `/scripts`: SQL setup scripts

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

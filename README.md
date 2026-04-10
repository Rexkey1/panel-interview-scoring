# Panel Interview Scoring System

A robust, real-time interview evaluation platform built with **React** and **PHP**. Designed for panel-based scoring with administrative oversight and seamless data export.

## Technical Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, Lucide Icons.
- **Backend**: PHP 8 (REST API), PDO (MySQL), Session-based Auth.
- **Database**: MySQL.

## Features
- **Tutor Workstation**: Real-time evaluation interface with criteria scoring and qualitative feedback.
- **Admin Dashboard**: Comprehensive overview of applicants, tutors, and scoring progress.
- **Dynamic Configuration**: Adjust completion rules (all tutors or minimum threshold).
- **Data Portability**: Import applicants via CSV; export raw scoring data or panel summaries.
- **Mobile Friendly**: Fully responsive design for tablets and smartphones.

## Setup
1. **Database**: Import the SQL schema and configure `api/config.php`.
2. **Backend**: Host the `api/` directory on a PHP-enabled server (XAMPP/cPanel).
3. **Frontend**: Install dependencies (`npm install`) and start the dev server (`npm run dev`) or build for production (`npm run build`).

---
Developed for high-stakes interview processing.

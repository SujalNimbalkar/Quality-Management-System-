# Quality Management System - Employee Competency & Assessment Platform

## Overview

This project is an Employee Competency and Assessment Platform designed to manage employee roles, skills, competencies, and test results. It provides a web-based dashboard for employees and administrators to view performance, assign tests, and analyze skill gaps.

**Live Project:** [https://quality-management-system-ta3d.onrender.com](https://quality-management-system-ta3d.onrender.com)

The system consists of a React frontend and a Node.js/Express backend, with data stored in CSV/Excel files and optionally integrated with Google Sheets.

## Setup Instructions

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### 1. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ..
npm install
```

### 2. Environment Variables

- For Google Sheets integration, follow the instructions in `GOOGLE_SHEETS_SETUP.md`.
- Set the backend URL in a `.env` file or via `VITE_BACKEND_URL` for the frontend (see `src/utils/links.js`).

### 3. Running the Application

#### Start Backend

```bash
cd backend
npm start
```

#### Start Frontend (in project root)

```bash
npm run dev
```

- The frontend will be available at `http://localhost:5173` (default Vite port).
- The backend will be available at `http://localhost:5000` (or as configured).

---

## Screenshots & Key Features

- **Login Window (Firebase Authentication):**

  - Secure login for employees and admins using Firebase authentication.
  - ![Login Window](img1_login.png)

- **Admin Dashboard:**

  - View and analyze employee performance and answers.
  - Skill performance radar chart by role.
  - Score log with detailed breakdown of test results.
  - ![Admin Dashboard - Performance](img2_admin_dashboard.png)
  - ![Admin Dashboard - Score Log](img3_admin_scorelog.png)

- **Employee Dashboard:**
  - Personalized welcome with employee name and roles.
  - List of required skills/tests and submission status.
  - ![Employee Dashboard](img4_employee_dashboard.png)

---

## Features

- Employee dashboard with skill radar charts
- Performance logs and test results
- Role and competency mapping
- CSV/Excel data import/export
- Google Sheets integration (optional)

---

## Data Files

- All data is stored in the `excel_data/` directory as CSV/Excel files.
- Update these files to add employees, roles, skills, or test results.

---

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch and open a pull request

---

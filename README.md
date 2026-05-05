# 🚀 NexaWork — Multi-Tenant Business Management Platform.

![NexaWork Cover](https://via.placeholder.com/1200x400/0F111A/6366F1?text=NexaWork+-+Everything+in+one+place)

NexaWork is a premium, full-stack multi-tenant SaaS platform designed to centralize and automate business operations. It replaces disjointed tools by providing a unified workspace for **Projects, Tasks, HR, CRM, Finance, Files, and Team Chat**.

Built with a stunning, modern dark-themed UI and a highly scalable backend architecture.

---

## ✨ Core Features

### 🏢 Multi-Tenant Architecture
- Complete data isolation per workspace/company.
- Dedicated portals with role-based access control (RBAC).
- **3 Distinct Portals**: Admin Workspace, Employee Portal, Client Portal.

### 👥 HR & Team Management
- **Attendance Tracking**: One-click clock-in/out with automated daily work hours calculation.
- **Leave Management**: Employees can apply for leaves; Admins can review, approve, and track quotas.
- **Payroll**: Automated payslip generation with base pay, allowances, deductions, and tax calculations.
- **Directory**: Unified employee directory and department management.

### 💼 CRM (Customer Relationship Management)
- **Client Management**: Track company info, primary contacts, and business notes.
- **Deal Pipeline**: Visual Kanban board for managing deals and tracking revenue pipeline.
- **Activity Log**: Schedule and log calls, meetings, and emails with clients.

### 📊 Projects & Tasks (Kanban)
- **Project Tracking**: Manage budgets, timelines, and milestones.
- **Task Management**: Advanced Kanban boards with drag-and-drop, priority flags, and due dates.
- **Time Tracking**: Built-in task timers and manual time logging.

### 💰 Finance & Invoicing
- **Invoices**: Generate professional PDF invoices and send them directly to clients.
- **Expenses**: Track operational expenses by category.
- **Payments**: Integrated Stripe and Razorpay checkout experiences for clients.
- **Financial Reports**: Cashflow, revenue, and expense analytics.

### 💬 Unified Communications
- **Team Chat**: Real-time messaging with individual and group channels.
- **File Storage**: Cloud file storage, version history, and file previews.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: TailwindCSS (Modern Dark Mode UI, Glassmorphism, CSS Grid/Flexbox)
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: Node.js with Express.js
- **Authentication**: Firebase Admin SDK (JWT)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Payments**: Stripe & Razorpay (Integrations)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Project (for Auth)
- Supabase Project (for PostgreSQL Database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anuj16920/project-management.git
   cd project-management
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key
```

**Frontend (`frontend/.env`):**
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

VITE_API_BASE_URL=http://localhost:5000
```

### Running the App

Start the Backend (runs on port 5000):
```bash
cd backend
npm run dev
```

Start the Frontend (runs on port 3000):
```bash
cd frontend
npm run dev
```

---

## 🛡️ Authentication & Role Model

1. **Workspace Admin**: Signs up from the main website. Owns the tenant, handles billing, configures the platform, and invites employees/clients.
2. **Employee**: Credentials are created by the Admin. Logs into a restricted portal (Assigned Tasks, My HR, Chat, Files).
3. **Client**: Credentials are created by the Admin. Logs into a client portal (Track specific projects, view/pay invoices).

## 📄 License

This project is proprietary and confidential.

---
*Built with ❤️ for modern teams.*

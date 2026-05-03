# NexaWork - Project Structure

## 📁 Root Directory
```
project-management-system/
├── backend/              # Node.js/Express API server
├── frontend/             # React + Vite frontend
├── supabase/            # Database migrations & seeds
├── .gitignore
├── README.md
├── setup.ps1            # Windows setup script
└── PROJECT_STRUCTURE.md # This file
```

---

## 🔧 Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── firebase.admin.js      # Firebase Admin SDK config
│   │   └── supabase.admin.js      # Supabase client config
│   │
│   ├── controllers/               # Request handlers
│   │   ├── auth.controller.js
│   │   ├── crm.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── finance.controller.js
│   │   ├── hr.controller.js
│   │   ├── projects.controller.js
│   │   ├── reports.controller.js
│   │   ├── superadmin.controller.js
│   │   ├── tasks.controller.js
│   │   └── users.controller.js
│   │
│   ├── middleware/                # Express middleware
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── rateLimiter.js         # Rate limiting
│   │   ├── sanitize.js            # Input sanitization
│   │   └── tenantMiddleware.js    # Multi-tenancy
│   │
│   ├── routes/                    # API routes
│   │   ├── auth.routes.js
│   │   ├── crm.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── finance.routes.js
│   │   ├── hr.routes.js
│   │   ├── projects.routes.js
│   │   ├── superadmin.routes.js
│   │   ├── tasks.routes.js
│   │   ├── users.routes.js
│   │   └── index.js               # Main router
│   │
│   ├── services/                  # Business logic
│   │   ├── auth.service.js
│   │   ├── crm.service.js
│   │   ├── dashboard.service.js
│   │   ├── finance.service.js
│   │   ├── hr.service.js
│   │   ├── projects.service.js
│   │   ├── reports.service.js
│   │   ├── superadmin.service.js
│   │   ├── tasks.service.js
│   │   └── users.service.js
│   │
│   ├── utils/                     # Utility functions
│   │   ├── logger.js              # Winston logger
│   │   ├── pagination.js          # Pagination helper
│   │   ├── response.js            # Response formatter
│   │   └── validator.js           # Input validation
│   │
│   └── index.js                   # Server entry point
│
├── .env                           # Environment variables
├── package.json
└── package-lock.json
```

---

## ⚛️ Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── shared/                # Shared components
│   │   │   ├── CreateUserModal.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   └── UserMenu.jsx
│   │   │
│   │   └── ui/                    # Reusable UI components
│   │       ├── Avatar.jsx
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── EmptyState.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Skeleton.jsx
│   │       ├── Spinner.jsx
│   │       ├── Table.jsx
│   │       └── Tooltip.jsx
│   │
│   ├── context/                   # React Context
│   │   ├── AuthContext.jsx        # Authentication state
│   │   └── TenantContext.jsx      # Multi-tenancy state
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   ├── useRoleGuard.js
│   │   ├── useScrollAnimation.js
│   │   └── useTenant.js
│   │
│   ├── layouts/                   # Layout components
│   │   ├── AdminLayout.jsx
│   │   ├── ClientLayout.jsx
│   │   ├── EmployeeLayout.jsx
│   │   └── SuperAdminLayout.jsx
│   │
│   ├── lib/                       # API clients & utilities
│   │   ├── api.js                 # Axios instance
│   │   ├── constants.js           # App constants
│   │   ├── crmAPI.js
│   │   ├── firebase.js            # Firebase config
│   │   ├── hrAPI.js
│   │   ├── invoiceAPI.js
│   │   ├── projectAPI.js
│   │   ├── supabase.js            # Supabase config
│   │   ├── taskAPI.js
│   │   └── usersAPI.js
│   │
│   ├── pages/                     # Page components
│   │   ├── auth/                  # Authentication pages
│   │   │   ├── components/
│   │   │   │   ├── AuthLayout.jsx
│   │   │   │   ├── GoogleLoginBtn.jsx
│   │   │   │   └── OTPInput.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── Signup.jsx
│   │   │
│   │   ├── client/                # Client portal
│   │   │   ├── account/
│   │   │   │   └── ClientAccount.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── ClientDashboard.jsx
│   │   │   ├── projects/
│   │   │   │   └── ClientProjects.jsx
│   │   │   └── tasks/
│   │   │       └── ClientTasks.jsx
│   │   │
│   │   ├── crm/                   # CRM module
│   │   │   ├── components/
│   │   │   │   ├── ActivityTimeline.jsx
│   │   │   │   ├── ClientCard.jsx
│   │   │   │   ├── CreateClientModal.jsx
│   │   │   │   └── DealsPipeline.jsx
│   │   │   ├── ClientDetail.jsx
│   │   │   └── CRMPage.jsx
│   │   │
│   │   ├── dashboard/             # Dashboard components
│   │   │   ├── components/
│   │   │   │   ├── KPICard.jsx
│   │   │   │   ├── QuickActionsPanel.jsx
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── TaskProgressWidget.jsx
│   │   │   │   └── TeamActivityFeed.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ClientDashboard.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   └── SuperAdminDashboard.jsx
│   │   │
│   │   ├── employee/              # Employee portal
│   │   │   ├── dashboard/
│   │   │   │   └── EmployeeDashboard.jsx
│   │   │   └── projects/
│   │   │       └── EmployeeProjects.jsx
│   │   │
│   │   ├── projects/              # Projects module
│   │   │   ├── components/
│   │   │   │   ├── ActivityLog.jsx
│   │   │   │   ├── CreateProject.jsx
│   │   │   │   ├── MilestonePanel.jsx
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   └── ProjectFilters.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   └── ProjectsList.jsx
│   │   │
│   │   ├── superadmin/            # Super Admin portal
│   │   │   ├── dashboard/
│   │   │   │   └── SuperAdminDashboard.jsx
│   │   │   ├── tenants/
│   │   │   │   └── TenantsPage.jsx
│   │   │   └── PlatformAnalytics.jsx
│   │   │
│   │   ├── tasks/                 # Tasks module
│   │   │   ├── components/
│   │   │   │   ├── CreateTaskModal.jsx
│   │   │   │   ├── KanbanColumn.jsx
│   │   │   │   ├── TaskCard.jsx
│   │   │   │   └── TaskDetailDrawer.jsx
│   │   │   ├── EmployeeTasks.jsx
│   │   │   └── KanbanBoard.jsx
│   │   │
│   │   └── team/                  # Team Management
│   │       └── TeamManagement.jsx
│   │
│   ├── routes/                    # React Router config
│   │   ├── ProtectedRoutes.jsx
│   │   ├── PublicRoutes.jsx
│   │   └── index.jsx
│   │
│   ├── store/                     # State management (if needed)
│   │
│   ├── App.jsx                    # Root component
│   ├── index.css                  # Global styles
│   └── main.jsx                   # Entry point
│
├── .env                           # Environment variables
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 🗄️ Database Structure (Supabase)

```
supabase/
├── migrations/                    # SQL migrations
│   ├── 001_tenants.sql           # Multi-tenancy setup
│   ├── 002_profiles.sql          # User profiles
│   ├── 003_projects.sql          # Projects & tasks tables
│   ├── 004_tasks.sql             # Task extensions
│   ├── 005_crm.sql               # CRM tables
│   ├── 006_add_company_name.sql  # Profile updates
│   ├── 006_hr.sql                # HR tables
│   ├── 007_finance.sql           # Finance tables
│   ├── 008_chat.sql              # Chat tables
│   ├── 009_files.sql             # File storage
│   └── 010_rls_policies.sql      # Row Level Security
│
└── seed/                          # Seed data
    └── demo_data.sql
```

---

## 🔑 Key Features by Module

### 1. Authentication & Authorization
- Firebase Authentication
- Role-based access control (Admin, Employee, Client, Super Admin)
- JWT token verification
- Multi-tenancy support

### 2. Dashboard
- Role-specific dashboards
- KPI cards
- Charts & analytics
- Quick actions panel

### 3. Projects Management
- Project CRUD operations
- Milestones tracking
- Project members management
- Activity logs

### 4. Tasks Management
- Kanban board
- Task assignment
- Priority & status tracking
- Comments & attachments

### 5. CRM
- Client management
- Deals pipeline
- Activity timeline
- Communication logs

### 6. Team Management (NEW)
- Create employee accounts
- Create client accounts
- User listing & filtering
- User deletion

### 7. HR Module
- Employee profiles
- Attendance tracking
- Leave management
- Payroll

### 8. Finance Module
- Invoicing (stub)
- Expense tracking
- Revenue reports

---

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Admin SDK
- **Validation**: Express Validator
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State**: Context API + Zustand
- **HTTP Client**: Axios
- **UI Components**: Custom + Lucide Icons
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit

### Database
- **Platform**: Supabase
- **Type**: PostgreSQL
- **Features**: Row Level Security, Real-time subscriptions

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
FRONTEND_URL=http://localhost:3000
JWT_SECRET=
```

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users/employee` - Create employee
- `POST /api/users/client` - Create client
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Archive project

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### CRM
- `GET /api/crm/clients` - List clients
- `POST /api/crm/clients` - Create client
- `GET /api/crm/clients/:id` - Get client details
- `POST /api/crm/deals` - Create deal

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard stats

### Finance
- `GET /api/finance/invoices/my` - Get my invoices
- `GET /api/finance/invoices` - List all invoices (admin)

---

## 🔐 User Roles & Permissions

| Feature | Super Admin | Admin | Employee | Client |
|---------|------------|-------|----------|--------|
| Platform Management | ✅ | ❌ | ❌ | ❌ |
| Tenant Management | ✅ | ❌ | ❌ | ❌ |
| Create Users | ❌ | ✅ | ❌ | ❌ |
| Manage Projects | ❌ | ✅ | ✅ | ❌ |
| Manage Tasks | ❌ | ✅ | ✅ | ❌ |
| CRM Access | ❌ | ✅ | ❌ | ❌ |
| View Own Projects | ❌ | ✅ | ✅ | ✅ |
| View Own Tasks | ❌ | ✅ | ✅ | ✅ |
| View Invoices | ❌ | ✅ | ❌ | ✅ |

---

## 📦 Installation & Setup

See `setup.ps1` for automated setup or follow manual steps in `README.md`

---

## 🐛 Common Issues & Solutions

1. **Backend won't start**: Check if all environment variables are set
2. **Database errors**: Run all Supabase migrations
3. **Auth errors**: Verify Firebase credentials
4. **CORS errors**: Check FRONTEND_URL in backend .env

---

**Last Updated**: 2026-04-05
**Version**: 1.0.0

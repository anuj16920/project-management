# Multi-Tenant SaaS Project Management System

## Project Overview

A comprehensive, enterprise-grade multi-tenant SaaS platform for project management, built with modern web technologies. The system provides complete business management capabilities including project tracking, HR management, CRM, finance, real-time chat, file management, and analytics.

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: React Query (@tanstack/react-query)
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with Lucide icons
- **Charts**: Recharts for data visualization
- **Real-time**: Socket.io-client
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: JavaScript (ES Modules)
- **Authentication**: Firebase Admin SDK
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Rate Limiting
- **File Storage**: Supabase Storage
- **Export**: ExcelJS, json2csv

### Database & Infrastructure
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Firebase Authentication
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime + Socket.io

## Architecture

### Multi-Tenancy Model
- Tenant-based data isolation using `tenant_id` in all tables
- Row Level Security (RLS) policies for data access control
- Separate tenant contexts for each organization
- Firebase UID-based user identification across tenants

### Authentication Flow
1. Firebase handles user authentication (email/password, Google OAuth)
2. Backend verifies Firebase tokens
3. User profile linked to tenant via `profiles` table
4. Role-based access control (SuperAdmin, Admin, HR, Employee, Client)

## Core Features

### 1. Dashboard (Role-Based)
- **Admin Dashboard**: Revenue charts, project overview, team activity, KPIs
- **Employee Dashboard**: Assigned tasks, project status, personal metrics
- **Client Dashboard**: Project progress, invoices, communication
- **SuperAdmin Dashboard**: Platform analytics, tenant management, system health

### 2. Project Management
- Project creation with budget tracking
- Milestone management
- Task assignment and tracking
- Project status workflow (Active, On Hold, Completed, Cancelled)
- Activity logs and audit trails
- Client and manager assignment

### 3. Task Management
- Kanban board interface (Todo, In Progress, Review, Done)
- Task priorities (Low, Medium, High, Urgent)
- Drag-and-drop task organization
- Task assignment to team members
- Due date tracking
- Task comments and attachments
- Filtering and search capabilities

### 4. HR Management
- Employee directory with profiles
- Department management
- Leave request system
- Attendance tracking with calendar view
- Payroll management
- Employee performance metrics
- Role and permission management

### 5. CRM (Customer Relationship Management)
- Client database with contact information
- Deal pipeline management
- Activity timeline tracking
- Client communication history
- Deal stages and probability tracking
- Revenue forecasting

### 6. Finance Management
- **Invoicing System**:
  - Invoice creation with line items
  - Multiple status tracking (Draft, Sent, Viewed, Paid, Overdue, Cancelled)
  - Automatic invoice numbering
  - Tax and discount calculations
  - Project-linked invoicing
  
- **Expense Management**:
  - Expense submission by employees
  - Category-based organization
  - Approval workflow
  - Receipt attachment
  - Expense reporting

- **Payments**:
  - Payment recording
  - Multiple payment methods (Bank Transfer, UPI, Card, Cash, Cheque, Stripe, Razorpay)
  - Payment history tracking
  - Automatic invoice status updates

### 7. Real-Time Chat
- Direct messaging between users
- Group chat rooms
- Typing indicators
- Online/offline status
- Message history
- @mentions support
- Socket.io powered real-time updates

### 8. File Management
- Folder-based organization
- File upload with drag-and-drop
- File preview capabilities
- Storage quota tracking
- File sharing and permissions
- Search and filtering
- File type categorization (Images, PDFs, Documents, Videos)
- Star/favorite files

### 9. Reports & Analytics
- Revenue analysis with charts
- Project performance metrics
- Employee productivity reports
- Client revenue breakdown
- Expense analysis
- Task completion statistics
- Export to CSV/Excel
- Custom date range filtering
- Saved report templates

### 10. Team Management
- User invitation system
- Role assignment
- Team member profiles
- Activity tracking
- Permission management

### 11. AI Assistant (Planned)
- Voice command support
- Natural language queries
- Task automation suggestions

## Folder Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.admin.js      # Firebase Admin SDK setup
│   │   │   ├── supabase.admin.js      # Supabase client config
│   │   │   └── socket.js              # Socket.io configuration
│   │   ├── controllers/               # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── projects.controller.js
│   │   │   ├── tasks.controller.js
│   │   │   ├── hr.controller.js
│   │   │   ├── crm.controller.js
│   │   │   ├── finance.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── files.controller.js
│   │   │   ├── reports.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── users.controller.js
│   │   │   └── superadmin.controller.js
│   │   ├── services/                  # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── projects.service.js
│   │   │   ├── tasks.service.js
│   │   │   ├── hr.service.js
│   │   │   ├── crm.service.js
│   │   │   ├── finance.service.js
│   │   │   ├── chat.service.js
│   │   │   ├── files.service.js
│   │   │   ├── reports.service.js
│   │   │   ├── export.service.js
│   │   │   ├── dashboard.service.js
│   │   │   ├── users.service.js
│   │   │   ├── email.service.js
│   │   │   ├── storage.service.js
│   │   │   ├── stripe.service.js
│   │   │   ├── openai.service.js
│   │   │   └── superadmin.service.js
│   │   ├── routes/                    # API routes
│   │   │   ├── index.js               # Main router
│   │   │   ├── auth.routes.js
│   │   │   ├── projects.routes.js
│   │   │   ├── tasks.routes.js
│   │   │   ├── hr.routes.js
│   │   │   ├── crm.routes.js
│   │   │   ├── finance.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── files.routes.js
│   │   │   ├── reports.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── superadmin.routes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # JWT verification
│   │   │   ├── tenantMiddleware.js    # Tenant context
│   │   │   ├── rateLimiter.js         # Rate limiting
│   │   │   ├── errorHandler.js        # Global error handler
│   │   │   ├── sanitize.js            # Input sanitization
│   │   │   └── antiBotMiddleware.js   # Bot protection
│   │   ├── utils/
│   │   │   ├── logger.js              # Winston logger
│   │   │   ├── response.js            # Standard responses
│   │   │   ├── validator.js           # Input validation
│   │   │   └── pagination.js          # Pagination helper
│   │   └── index.js                   # Express app entry
│   ├── .env                           # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Tooltip.jsx
│   │   │   │   └── EmptyState.jsx
│   │   │   └── shared/                # Shared components
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Topbar.jsx
│   │   │       ├── PageHeader.jsx
│   │   │       ├── UserMenu.jsx
│   │   │       ├── NotificationBell.jsx
│   │   │       └── CreateUserModal.jsx
│   │   ├── pages/
│   │   │   ├── auth/                  # Authentication pages
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── ResetPassword.jsx
│   │   │   │   └── components/
│   │   │   ├── dashboard/             # Dashboard pages
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── EmployeeDashboard.jsx
│   │   │   │   ├── ClientDashboard.jsx
│   │   │   │   ├── SuperAdminDashboard.jsx
│   │   │   │   └── components/
│   │   │   ├── projects/              # Project management
│   │   │   │   ├── ProjectsList.jsx
│   │   │   │   ├── ProjectDetail.jsx
│   │   │   │   └── components/
│   │   │   ├── tasks/                 # Task management
│   │   │   │   ├── KanbanBoard.jsx
│   │   │   │   ├── EmployeeTasks.jsx
│   │   │   │   └── components/
│   │   │   ├── hr/                    # HR management
│   │   │   │   ├── EmployeesList.jsx
│   │   │   │   ├── EmployeeDetail.jsx
│   │   │   │   ├── EmployeeHRPage.jsx
│   │   │   │   └── components/
│   │   │   ├── crm/                   # CRM
│   │   │   │   ├── CRMPage.jsx
│   │   │   │   ├── ClientDetail.jsx
│   │   │   │   └── components/
│   │   │   ├── finance/               # Finance management
│   │   │   │   ├── FinancePage.jsx
│   │   │   │   └── components/
│   │   │   ├── chat/                  # Real-time chat
│   │   │   │   ├── ChatPage.jsx
│   │   │   │   └── components/
│   │   │   ├── files/                 # File management
│   │   │   │   ├── FilesPage.jsx
│   │   │   │   └── components/
│   │   │   ├── reports/               # Analytics & reports
│   │   │   │   ├── ReportsPage.jsx
│   │   │   │   └── components/
│   │   │   ├── team/                  # Team management
│   │   │   │   └── TeamManagement.jsx
│   │   │   ├── ai/                    # AI assistant
│   │   │   │   ├── AIPage.jsx
│   │   │   │   └── components/
│   │   │   ├── employee/              # Employee-specific views
│   │   │   ├── client/                # Client-specific views
│   │   │   └── superadmin/            # SuperAdmin views
│   │   ├── layouts/                   # Layout components
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── EmployeeLayout.jsx
│   │   │   ├── ClientLayout.jsx
│   │   │   └── SuperAdminLayout.jsx
│   │   ├── context/                   # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── TenantContext.jsx
│   │   ├── hooks/                     # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useTenant.js
│   │   │   ├── useRoleGuard.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useSocket.js
│   │   │   └── useScrollAnimation.js
│   │   ├── lib/                       # API clients
│   │   │   ├── api.js                 # Axios instance
│   │   │   ├── firebase.js            # Firebase config
│   │   │   ├── supabase.js            # Supabase client
│   │   │   ├── constants.js           # App constants
│   │   │   ├── projectAPI.js
│   │   │   ├── taskAPI.js
│   │   │   ├── hrAPI.js
│   │   │   ├── crmAPI.js
│   │   │   ├── invoiceAPI.js
│   │   │   ├── chatAPI.js
│   │   │   ├── filesAPI.js
│   │   │   ├── reportsAPI.js
│   │   │   └── usersAPI.js
│   │   ├── routes/                    # Route configuration
│   │   │   ├── index.jsx
│   │   │   └── ProtectedRoutes.jsx
│   │   ├── App.jsx                    # Root component
│   │   ├── main.jsx                   # Entry point
│   │   └── index.css                  # Global styles
│   ├── .env                           # Environment variables
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── supabase/
    └── migrations/                    # Database migrations
        ├── 001_initial.sql            # Tenants & profiles
        ├── 002_auth.sql               # Auth tables
        ├── 003_projects.sql           # Projects & tasks
        ├── 004_tasks.sql              # Task details
        ├── 006_hr.sql                 # HR tables
        ├── 007_finance.sql            # Finance tables
        ├── 008_chat.sql               # Chat tables
        ├── 009_files.sql              # File storage
        ├── 010_reports.sql            # Reports tables
        └── 010_rls_policies.sql       # Security policies
```

## Database Schema

### Core Tables

#### tenants
- Multi-tenant organization data
- Subscription management
- Settings and configuration

#### profiles
- User profiles linked to Firebase UID
- Role assignment (superadmin, admin, hr, employee, client)
- Tenant association
- Personal information

#### projects
- Project details and metadata
- Budget tracking
- Client and manager assignment
- Status workflow

#### tasks
- Task information
- Priority and status
- Assignment to users
- Due dates and completion tracking

#### invoices
- Invoice header information
- Client and project linking
- Tax and discount calculations
- Payment status tracking

#### invoice_items
- Line items for invoices
- Quantity and pricing
- Automatic amount calculation

#### expenses
- Expense submissions
- Category classification
- Approval workflow
- Receipt storage

#### payments
- Payment records
- Multiple payment methods
- Invoice linking
- Transaction tracking

#### chat_rooms
- Chat room metadata
- Room types (direct, group)
- Participant management

#### chat_messages
- Message content
- Sender information
- Timestamps
- Read status

#### files
- File metadata
- Storage path references
- Folder organization
- Access tracking

## UI/UX Design

### Design System
- **Color Palette**: Indigo primary (#6366F1), with semantic colors for success, warning, error
- **Typography**: System fonts with clear hierarchy
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable, accessible components
- **Icons**: Lucide React icons throughout

### Layout Structure
- **Sidebar Navigation**: Collapsible, role-based menu items
- **Top Bar**: User menu, notifications, search
- **Main Content**: Responsive grid layouts
- **Modals**: Centered overlays for forms and details
- **Toast Notifications**: Success/error feedback

### Key UI Features
- Responsive design (mobile, tablet, desktop)
- Dark mode support (planned)
- Loading states with skeletons
- Empty states with helpful messages
- Drag-and-drop interfaces
- Real-time updates
- Smooth animations and transitions

### Page Layouts

#### Dashboard
- KPI cards with metrics
- Charts for revenue and activity
- Quick action buttons
- Recent activity feed
- Task progress widgets

#### Kanban Board
- Drag-and-drop columns
- Task cards with priority badges
- Quick edit capabilities
- Filtering and search
- Column summaries

#### Finance
- Tabbed interface (Invoices, Expenses, Payments)
- List and grid views
- Status badges and filters
- Quick actions menu
- Detailed modals

#### Chat
- Split view (rooms list + chat window)
- Message bubbles
- Typing indicators
- Online status
- @mention autocomplete

## API Structure

### RESTful Endpoints

```
/api/auth
  POST   /signup
  POST   /login
  POST   /google
  POST   /forgot-password
  POST   /reset-password
  GET    /me
  POST   /logout

/api/projects
  GET    /
  POST   /
  GET    /:id
  PATCH  /:id
  DELETE /:id

/api/tasks
  GET    /
  POST   /
  GET    /:id
  PATCH  /:id
  DELETE /:id
  PATCH  /:id/status

/api/finance
  GET    /stats
  GET    /invoices
  POST   /invoices
  GET    /invoices/:id
  PATCH  /invoices/:id
  DELETE /invoices/:id
  GET    /expenses
  POST   /expenses
  GET    /payments
  POST   /payments

/api/chat
  GET    /rooms
  POST   /rooms
  GET    /rooms/:id/messages
  POST   /rooms/:id/messages

/api/files
  GET    /
  POST   /upload-url
  POST   /confirm-upload
  GET    /:id/download
  DELETE /:id

/api/reports
  GET    /overview
  GET    /revenue
  GET    /projects
  GET    /tasks
  GET    /employees
  GET    /export
```

## Security Features

1. **Authentication**: Firebase JWT tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Data Isolation**: Tenant-based RLS policies
4. **Input Validation**: Sanitization and validation middleware
5. **Rate Limiting**: API request throttling
6. **CORS**: Configured for frontend origin
7. **Helmet**: Security headers
8. **SQL Injection**: Parameterized queries via Supabase
9. **XSS Protection**: Input sanitization

## Real-Time Features

### Socket.io Events
- `connection`: User connects
- `join_room`: Join chat room
- `leave_room`: Leave chat room
- `typing_start`: User starts typing
- `typing_stop`: User stops typing
- `user_joined`: User joined room
- `disconnect`: User disconnects

### Real-Time Updates
- Chat messages
- Typing indicators
- Online/offline status
- Notifications
- Task updates (planned)

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# Optional
STRIPE_SECRET_KEY=
OPENAI_API_KEY=
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Known Issues & Fixes

### Recent Fixes
1. **Invoice FK Join Issue**: Fixed Supabase foreign key joins for profiles table (uses firebase_uid instead of UUID)
2. **Projects Join Error**: Removed broken FK joins, implemented separate queries
3. **Payments Error**: Fixed listPayments to fetch invoices and profiles separately
4. **Missing Exports**: Added verifyFirebaseToken export to firebase.admin.js
5. **File Controller**: Created missing files.controller.js
6. **Socket Initialization**: Fixed app initialization order in index.js

## Development Setup

1. Clone repository
2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Configure environment variables
4. Run Supabase migrations
5. Start backend: `npm run dev`
6. Start frontend: `npm run dev`

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Time tracking
- [ ] Gantt charts
- [ ] Advanced reporting
- [ ] API webhooks
- [ ] SSO integration
- [ ] Dark mode
- [ ] Multi-language support

## Performance Optimizations

- React Query for caching
- Lazy loading routes
- Image optimization
- Code splitting
- Database indexing
- Connection pooling
- CDN for static assets (planned)

## Testing Strategy

- Unit tests (planned)
- Integration tests (planned)
- E2E tests (planned)
- Manual QA testing

## Implementation Status

### ✅ COMPLETED & WORKING

#### Authentication & Authorization
- ✅ Firebase authentication (email/password, Google OAuth)
- ✅ JWT token verification in backend
- ✅ Role-based access control (SuperAdmin, Admin, HR, Employee, Client)
- ✅ Protected routes with role guards
- ✅ Tenant context middleware
- ✅ Login, Signup, Forgot Password, Reset Password pages

#### Core Infrastructure
- ✅ Multi-tenant architecture with tenant_id isolation
- ✅ Supabase PostgreSQL database with RLS policies
- ✅ Express.js REST API with proper routing
- ✅ React + Vite frontend with React Router
- ✅ Axios API client with interceptors
- ✅ React Query for data fetching and caching
- ✅ Socket.io for real-time features
- ✅ Error handling and logging (Winston)
- ✅ Rate limiting and security middleware

#### Dashboard
- ✅ Admin Dashboard with KPIs, charts, activity feed
- ✅ Employee Dashboard with assigned tasks
- ✅ Client Dashboard with project overview
- ✅ SuperAdmin Dashboard with platform analytics
- ✅ Role-based dashboard routing

#### Project Management
- ✅ Project CRUD operations
- ✅ Project list with filters
- ✅ Project detail page
- ✅ Budget tracking
- ✅ Client and manager assignment
- ✅ Status workflow (Active, On Hold, Completed, Cancelled)
- ✅ Milestone management
- ✅ Activity logs

#### Task Management
- ✅ Kanban board with drag-and-drop
- ✅ Task CRUD operations
- ✅ Task status workflow (Todo, In Progress, Review, Done)
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Task assignment to users
- ✅ Due date tracking
- ✅ Task detail drawer
- ✅ Filtering and search

#### HR Management
- ✅ Employee directory
- ✅ Employee profiles with details
- ✅ Department management
- ✅ Leave request system
- ✅ Attendance calendar
- ✅ Payroll panel
- ✅ Employee table with sorting/filtering

#### CRM
- ✅ Client database
- ✅ Client detail pages
- ✅ Deal pipeline management
- ✅ Activity timeline
- ✅ Client CRUD operations
- ✅ Deal stages tracking

#### Finance Management
- ✅ Invoice creation with line items
- ✅ Invoice list with status filters
- ✅ Invoice detail view
- ✅ Automatic invoice numbering
- ✅ Tax and discount calculations
- ✅ Expense submission and tracking
- ✅ Expense categories
- ✅ Expense approval workflow
- ✅ Payment recording
- ✅ Payment history
- ✅ Finance stats dashboard
- ✅ **FIXED**: Invoice/Payment FK joins (profiles use firebase_uid not UUID)

#### Chat System
- ✅ Real-time messaging with Socket.io
- ✅ Direct messages and group chats
- ✅ Chat room creation
- ✅ Message history
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ @mention support

#### File Management
- ✅ File upload with drag-and-drop
- ✅ Folder organization
- ✅ File preview
- ✅ Storage quota tracking
- ✅ File search and filtering
- ✅ Star/favorite files
- ✅ File download with signed URLs
- ✅ Storage stats display

#### Reports & Analytics
- ✅ Revenue charts
- ✅ Project performance metrics
- ✅ Task statistics
- ✅ Employee productivity reports
- ✅ Client revenue breakdown
- ✅ Expense analysis
- ✅ Date range filtering
- ✅ Export to CSV/Excel (service ready)

#### Team Management
- ✅ User invitation system
- ✅ Team member list
- ✅ Role assignment
- ✅ User profile management

#### UI Components
- ✅ Complete component library (Button, Input, Modal, Badge, Avatar, etc.)
- ✅ Responsive layouts for all roles
- ✅ Sidebar navigation with role-based menu
- ✅ Top bar with user menu and notifications
- ✅ Loading states with skeletons
- ✅ Empty states
- ✅ Toast notifications

### ⚠️ PARTIALLY WORKING / NEEDS FIXES

#### Database Issues
- ⚠️ Old invoices table from migration 003 conflicts with new one in 007
- ⚠️ Projects table FK relationship not recognized by Supabase (workaround: separate queries)
- ⚠️ Profiles table uses firebase_uid (text) not UUID - requires manual joins

#### Reports Module
- ⚠️ Backend routes working but CORS errors when accessed
- ⚠️ Reports service needs testing with real data
- ⚠️ Export functionality (puppeteer not installed)

#### AI Assistant
- ⚠️ UI components created but OpenAI service not integrated
- ⚠️ Voice command component exists but not functional

### ❌ NOT IMPLEMENTED / TODO

#### High Priority
- ❌ Email notifications (service exists but not configured)
- ❌ Stripe payment integration (service skeleton exists)
- ❌ File upload progress indicators
- ❌ Bulk operations (delete multiple, bulk assign)
- ❌ Advanced search across modules
- ❌ Notification system (bell icon exists but no backend)
- ❌ User settings page
- ❌ Tenant settings/configuration page

#### Medium Priority
- ❌ Calendar view for tasks/projects
- ❌ Gantt chart for project timeline
- ❌ Time tracking module
- ❌ Invoice PDF generation
- ❌ Recurring invoices
- ❌ Advanced reporting (custom reports)
- ❌ Webhooks for integrations
- ❌ API documentation
- ❌ Mobile responsive improvements

#### Low Priority
- ❌ Dark mode
- ❌ Multi-language support
- ❌ SSO integration
- ❌ Two-factor authentication
- ❌ Audit logs viewer
- ❌ Data export (full tenant data)
- ❌ Mobile app

## Critical Bugs Fixed (Session History)

### April 2026 - Finance Module FK Join Issues
**Problem**: GET /api/finance/invoices returned 500 error
- Supabase couldn't find FK relationship between invoices and projects
- Profiles table uses firebase_uid (text) not UUID, breaking automatic joins

**Solution Applied**:
1. Modified `listInvoices()` in finance.service.js:
   - Removed `projects(name)` from select
   - Fetch projects separately using `.in('id', projectIds)`
   - Fetch profiles separately using `.in('firebase_uid', clientUids)`
   - Manually merge data in response

2. Modified `getInvoice()`:
   - Removed FK joins
   - Fetch profile and project separately
   - Return merged object

3. Modified `listPayments()`:
   - Removed `invoices(...)` FK join
   - Fetch invoices separately
   - Fetch client profiles for those invoices
   - Return nested structure

4. Fixed `listExpenses()`:
   - Already correct, only joins expense_categories (proper UUID FK)

### Other Fixes
- Added `verifyFirebaseToken` export to firebase.admin.js
- Created missing files.controller.js
- Fixed app initialization order in index.js (app used before declaration)
- Fixed reports routes (removed non-existent roleMiddleware import)
- Commented out puppeteer import (not installed)
- Created missing TasksChart.jsx component
- Created missing StorageStats.jsx component

## Known Issues & Workarounds

### Database Schema Conflicts
**Issue**: Migration 003 creates old invoices table, migration 007 creates new one
**Workaround**: Using migration 007 structure, ignoring 003
**Proper Fix**: Clean up migrations, remove duplicate table definitions

### Supabase FK Joins
**Issue**: Profiles table uses firebase_uid (text) as identifier, not UUID
**Workaround**: Always fetch profiles separately, never use FK joins
**Pattern**: 
```javascript
// ❌ DON'T DO THIS
.select('*, profiles!fkey(full_name)')

// ✅ DO THIS
const { data } = await supabase.from('table').select('*')
const uids = data.map(d => d.user_uid)
const { data: profiles } = await supabase.from('profiles')
  .select('firebase_uid, full_name, email')
  .in('firebase_uid', uids)
```

### Missing Dependencies
- puppeteer (for PDF generation) - not installed
- Some npm packages may be missing

## Next Steps (Priority Order)

### Immediate (This Week)
1. **Test Finance Module**: Verify invoices, expenses, payments all work end-to-end
2. **Fix Reports CORS**: Ensure reports routes are properly registered
3. **Notification System**: Implement backend for notification bell
4. **User Settings**: Create settings page for profile updates

### Short Term (This Month)
1. **Email Notifications**: Configure email service (SendGrid/AWS SES)
2. **File Upload Progress**: Add progress bars for file uploads
3. **Bulk Operations**: Add multi-select and bulk actions
4. **Invoice PDF**: Generate PDF invoices (install puppeteer or use alternative)
5. **Search**: Implement global search across modules

### Medium Term (Next 2-3 Months)
1. **Stripe Integration**: Complete payment processing
2. **Calendar View**: Add calendar for tasks and projects
3. **Time Tracking**: Build time tracking module
4. **Advanced Reports**: Custom report builder
5. **Mobile Optimization**: Improve responsive design
6. **Testing**: Add unit and integration tests

### Long Term (3-6 Months)
1. **Mobile App**: React Native app
2. **AI Features**: Complete AI assistant integration
3. **SSO**: Add SSO providers
4. **Webhooks**: Build webhook system
5. **API Docs**: Generate API documentation
6. **Performance**: Optimize queries, add caching

## Development Guidelines for Claude

### When Working on This Project:

1. **Database Queries**: NEVER use FK joins for profiles table. Always fetch separately.

2. **New Features**: Follow existing patterns:
   - Service layer handles business logic
   - Controller handles request/response
   - Routes define endpoints
   - Frontend API client in lib/
   - Components in pages/[module]/components/

3. **Multi-tenancy**: ALWAYS filter by tenant_id in queries

4. **Authentication**: All routes except /auth need verifyToken + attachTenant middleware

5. **Error Handling**: Use try-catch in controllers, return standard response format

6. **File Structure**: Keep consistent with existing organization

7. **Testing Changes**: After changes, verify:
   - Backend starts without errors
   - Frontend compiles
   - API endpoints return expected data
   - No console errors in browser

### Common Patterns

**Service Function**:
```javascript
export const listItems = async (tenantId, filters = {}) => {
  let q = supabaseAdmin.from('table').select('*').eq('tenant_id', tenantId)
  if (filters.status) q = q.eq('status', filters.status)
  const { data, error } = await q
  if (error) throw error
  return data
}
```

**Controller**:
```javascript
export const listItems = async (req, res) => {
  try {
    return success(res, await Service.listItems(req.tenantId, req.query))
  } catch(err) {
    return error(res, err.message, 500)
  }
}
```

**Route**:
```javascript
router.get('/', verifyToken, attachTenant, controller.listItems)
```

---

**Last Updated**: April 2026
**Version**: 1.0.0
**Status**: Active Development
**Current Focus**: Finance module bug fixes, Reports module testing

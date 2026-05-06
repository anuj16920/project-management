export const APP_NAME = 'NexaWork'

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN:       'admin',
  EMPLOYEE:    'employee',
  CLIENT:      'client',
  HR:          'hr',
}

export const ROUTES = {
  HOME:          '/',
  LOGIN:         '/login',
  SIGNUP:        '/signup',
  FORGOT:        '/forgot-password',
  RESET:         '/reset-password',
  ADMIN_DASH:    '/admin/dashboard',
  EMPLOYEE_DASH: '/employee/dashboard',
  CLIENT_DASH:   '/client/dashboard',
  SUPER_DASH:    '/superadmin/dashboard',
  HR_DASH:       '/hr/dashboard',
}

export const NAV_LINKS = [
  { label: 'Features',      href: '#features'      },
  { label: 'How it Works',  href: '#how-it-works'  },
  { label: 'Modules',       href: '#modules'       },
  { label: 'Pricing',       href: '#pricing'       },
]

export const STATS = [
  { value: 12000, suffix: '+',  label: 'Active Companies'  },
  { value: 98,    suffix: '%',  label: 'Uptime SLA'        },
  { value: 4.9,   suffix: '/5', label: 'Customer Rating', decimals: 1 },
  { value: 150,   suffix: '+',  label: 'Countries'         },
]

export const FEATURES = [
  { icon: 'LayoutDashboard', title: 'Smart Dashboards',        desc: 'Real-time analytics and KPIs for every team — projects, revenue, HR, and CRM in one view.',                color: '#6366F1' },
  { icon: 'Kanban',          title: 'Project & Task Management',desc: 'Kanban boards, Gantt charts, milestones, and time tracking built for modern teams.',                      color: '#06B6D4' },
  { icon: 'Users',           title: 'CRM & Client Pipeline',   desc: 'Manage leads, deals, proposals and client communication all in one place.',                               color: '#10B981' },
  { icon: 'UserCheck',       title: 'HR & Payroll',            desc: 'Employee profiles, attendance, leave approvals and payroll management simplified.',                        color: '#F59E0B' },
  { icon: 'Receipt',         title: 'Finance & Invoicing',     desc: 'Create invoices, track expenses, manage subscriptions and integrate with Stripe.',                        color: '#EF4444' },
  { icon: 'MessageSquare',   title: 'Team Collaboration',      desc: 'Real-time chat, @mentions, file sharing and notifications — all inside your workspace.',                  color: '#8B5CF6' },
]

export const HOW_IT_WORKS = [
  { step: '01', icon: 'Building2', title: 'Create Your Workspace',  desc: 'Sign up in under 2 minutes. Set up your company, invite your team, and configure roles and permissions.' },
  { step: '02', icon: 'Puzzle',    title: 'Set Up Your Modules',    desc: 'Activate only the modules you need — Projects, CRM, HR, Finance or all. Fully customizable.'           },
  { step: '03', icon: 'Rocket',    title: 'Run Your Business',      desc: 'Manage everything from a single dashboard. Track performance, collaborate and grow faster.'             },
]

export const MODULES = [
  { icon: 'LayoutDashboard', label: 'Dashboard',   color: '#6366F1' },
  { icon: 'FolderKanban',    label: 'Projects',    color: '#06B6D4' },
  { icon: 'CheckSquare',     label: 'Tasks',       color: '#10B981' },
  { icon: 'Users',           label: 'CRM',         color: '#F59E0B' },
  { icon: 'UserCheck',       label: 'HR',          color: '#EF4444' },
  { icon: 'Receipt',         label: 'Finance',     color: '#8B5CF6' },
  { icon: 'MessageSquare',   label: 'Chat',        color: '#06B6D4' },
  { icon: 'FileText',        label: 'Documents',   color: '#10B981' },
  { icon: 'BarChart3',       label: 'Reports',     color: '#6366F1' },
  { icon: 'Shield',          label: 'Admin Panel', color: '#F59E0B' },
  { icon: 'Plug',            label: 'Integrations',color: '#EF4444' },
  { icon: 'Bot',             label: 'AI Assistant',color: '#8B5CF6' },
]

export const PRICING = [
  {
    name: 'Starter', price: 0, period: 'forever',
    desc: 'Perfect for freelancers and small teams.',
    features: ['Up to 5 users','3 Projects','Basic Dashboard','Task Management','Email Support'],
    cta: 'Get Started Free', highlighted: false,
  },
  {
    name: 'Pro', price: 49, period: 'per month',
    desc: 'For growing teams that need more power.',
    features: ['Up to 50 users','Unlimited Projects','Full CRM','HR & Payroll','Finance & Invoicing','Real-time Chat','Priority Support'],
    cta: 'Start Free Trial', highlighted: true, badge: 'Most Popular',
  },
  {
    name: 'Enterprise', price: 199, period: 'per month',
    desc: 'For large organizations with advanced needs.',
    features: ['Unlimited users','All Pro features','Custom Integrations','Dedicated Manager','SLA 99.9%','Custom Branding','API Access'],
    cta: 'Contact Sales', highlighted: false,
  },
]

export const TESTIMONIALS = [
  { name: 'Arjun Mehta',    role: 'CEO, TechVentures India',    avatar: 'AM', rating: 5, text: 'NexaWork replaced 6 different tools for us. Our team productivity jumped 40% in the first month.' },
  { name: 'Sarah Johnson',  role: 'Operations Director, GrowthCo', avatar: 'SJ', rating: 5, text: 'The CRM and project management integration is seamless. Track deals and deliverables in one place.' },
  { name: 'Rohan Kapoor',   role: 'Founder, Buildify',          avatar: 'RK', rating: 5, text: 'Onboarding took 15 minutes. The HR and payroll module saved us hours every week.' },
  { name: 'Emily Chen',     role: 'CFO, NovaStar Agency',       avatar: 'EC', rating: 5, text: 'Finance and invoicing module is exactly what we needed. Real-time expense tracking changed how we plan.' },
]
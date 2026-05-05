import express from 'express'
import authRoutes        from './auth.routes.js'
import dashboardRoutes   from './dashboard.routes.js'
import projectsRoutes    from './projects.routes.js'
import tasksRoutes       from './tasks.routes.js'
import crmRoutes         from './crm.routes.js'
import superadminRoutes  from './superadmin.routes.js'
import usersRoutes       from './users.routes.js'
import financeRoutes     from './finance.routes.js'
import hrRoutes          from './hr.routes.js'
import chatRoutes        from './chat.routes.js'
import filesRoutes       from './files.routes.js'
import reportsRoutes     from './reports.routes.js'
import aiRoutes          from './ai.routes.js'

const router = express.Router()

router.use('/auth',       authRoutes)
router.use('/dashboard',  dashboardRoutes)
router.use('/projects',   projectsRoutes)
router.use('/tasks',      tasksRoutes)
router.use('/crm',        crmRoutes)
router.use('/superadmin', superadminRoutes)
router.use('/users',      usersRoutes)
router.use('/finance',    financeRoutes)
router.use('/hr',         hrRoutes)
router.use('/chat',       chatRoutes)
router.use('/files',      filesRoutes)
router.use('/reports',    reportsRoutes)
router.use('/ai',         aiRoutes)

export default router

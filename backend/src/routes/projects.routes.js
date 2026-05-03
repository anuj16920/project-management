import express from 'express'
import {
  listProjects, getProject, createProject,
  updateProject, archiveProject,
  addMilestone, toggleMilestone,
  addMember, removeMember,
} from '../controllers/projects.controller.js'
import { verifyToken }  from '../middleware/authMiddleware.js'
import { attachTenant } from '../middleware/tenantMiddleware.js'

const router = express.Router()
router.use(verifyToken, attachTenant)

router.get('/',                                    listProjects)
router.get('/:id',                                 getProject)
router.post('/',                                   createProject)
router.patch('/:id',                               updateProject)
router.delete('/:id',                              archiveProject)

router.post('/:id/milestones',                     addMilestone)
router.patch('/:id/milestones/:milestoneId/toggle',toggleMilestone)

router.post('/:id/members',                        addMember)
router.delete('/:id/members/:userUid',             removeMember)

export default router
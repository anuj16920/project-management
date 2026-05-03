import express from 'express'
import {
  listTasks, getTask, createTask, updateTask, deleteTask,
  moveTask, reorderTasks,
  addComment, deleteComment,
  logTime, createSubtask,
} from '../controllers/tasks.controller.js'
import { verifyToken }  from '../middleware/authMiddleware.js'
import { attachTenant } from '../middleware/tenantMiddleware.js'

const router = express.Router()
router.use(verifyToken, attachTenant)

router.get('/',                          listTasks)
router.post('/',                         createTask)
router.get('/:id',                       getTask)
router.patch('/:id',                     updateTask)
router.delete('/:id',                    deleteTask)
router.patch('/:id/move',                moveTask)
router.post('/reorder',                  reorderTasks)

router.post('/:id/comments',             addComment)
router.delete('/:id/comments/:commentId',deleteComment)

router.post('/:id/time-logs',            logTime)
router.post('/:id/subtasks',             createSubtask)

export default router
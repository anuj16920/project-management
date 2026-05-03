import express from 'express'
import {
  getStats,
  listFolders, createFolder, renameFolder, deleteFolder,
  listFiles, getFile, getUploadUrl, confirmUpload,
  getDownloadUrl, toggleStar, updateFile, deleteFile,
} from '../controllers/files.controller.js'
import { verifyToken }  from '../middleware/authMiddleware.js'
import { attachTenant } from '../middleware/tenantMiddleware.js'

const router = express.Router()
router.use(verifyToken, attachTenant)

// Stats
router.get('/stats',                      getStats)

// Folders
router.get('/folders',                    listFolders)
router.post('/folders',                   createFolder)
router.patch('/folders/:id',              renameFolder)
router.delete('/folders/:id',             deleteFolder)

// Files
router.get('/',                           listFiles)
router.get('/:id',                        getFile)
router.post('/upload-url',                getUploadUrl)
router.post('/confirm-upload',            confirmUpload)
router.get('/:id/download',              getDownloadUrl)
router.patch('/:id/star',                toggleStar)
router.patch('/:id',                     updateFile)
router.delete('/:id',                    deleteFile)

export default router
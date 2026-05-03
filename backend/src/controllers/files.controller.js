import * as Files from '../services/files.service.js'
import { success, error } from '../utils/response.js'

// Stats
export const getStats = async (req, res) => {
  try {
    return success(res, await Files.getStorageStats(req.tenantId))
  } catch (err) {
    return error(res, err.message, 500)
  }
}

// Folders
export const listFolders = async (req, res) => {
  try {
    return success(res, await Files.listFolders(req.tenantId, req.query.parent_id))
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const createFolder = async (req, res) => {
  try {
    if (!req.body.name) return error(res, 'name required', 400)
    return success(res, await Files.createFolder(req.tenantId, req.user.uid, req.body), 'Folder created', 201)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const renameFolder = async (req, res) => {
  try {
    if (!req.body.name) return error(res, 'name required', 400)
    return success(res, await Files.renameFolder(req.tenantId, req.params.id, req.body.name), 'Renamed')
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const deleteFolder = async (req, res) => {
  try {
    await Files.deleteFolder(req.tenantId, req.params.id)
    return success(res, null, 'Folder deleted')
  } catch (err) {
    return error(res, err.message, 500)
  }
}

// Files
export const listFiles = async (req, res) => {
  try {
    return success(res, await Files.listFiles(req.tenantId, req.query))
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const getFile = async (req, res) => {
  try {
    return success(res, await Files.getFile(req.tenantId, req.params.id))
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const getUploadUrl = async (req, res) => {
  try {
    if (!req.body.fileName) return error(res, 'fileName required', 400)
    return success(res, await Files.getUploadUrl(req.tenantId, req.user.uid, req.body))
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const confirmUpload = async (req, res) => {
  try {
    if (!req.body.storage_path || !req.body.original_name) {
      return error(res, 'storage_path and original_name required', 400)
    }
    return success(res, await Files.confirmUpload(req.tenantId, req.user.uid, req.body), 'File uploaded', 201)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const getDownloadUrl = async (req, res) => {
  try {
    return success(res, await Files.getDownloadUrl(req.tenantId, req.params.id))
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const toggleStar = async (req, res) => {
  try {
    return success(res, await Files.toggleStar(req.tenantId, req.params.id))
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const updateFile = async (req, res) => {
  try {
    return success(res, await Files.updateFile(req.tenantId, req.params.id, req.body), 'Updated')
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const deleteFile = async (req, res) => {
  try {
    await Files.deleteFile(req.tenantId, req.params.id)
    return success(res, null, 'File deleted')
  } catch (err) {
    return error(res, err.message, 500)
  }
}

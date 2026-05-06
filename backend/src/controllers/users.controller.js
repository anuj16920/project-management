import * as UserService from '../services/users.service.js'
import { success, error } from '../utils/response.js'

export const listUsers = async (req, res) => {
  try {
    const users = await UserService.listUsers(req.tenantId, req.query)
    return success(res, users)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const createEmployee = async (req, res) => {
  try {
    const { email, fullName, password, phone, department } = req.body
    
    if (!email || !fullName || !password) {
      return error(res, 'Email, full name, and password are required', 400)
    }

    const user = await UserService.createEmployee(req.tenantId, {
      email, fullName, password, phone, department
    })
    
    return success(res, user, 'Employee created successfully', 201)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const createClient = async (req, res) => {
  try {
    const { email, fullName, password, phone, companyName } = req.body
    
    if (!email || !fullName || !password) {
      return error(res, 'Email, full name, and password are required', 400)
    }

    const user = await UserService.createClient(req.tenantId, {
      email, fullName, password, phone, companyName
    })
    
    return success(res, user, 'Client created successfully', 201)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const createHR = async (req, res) => {
  try {
    const { email, fullName, password, phone } = req.body

    if (!email || !fullName || !password) {
      return error(res, 'Email, full name, and password are required', 400)
    }

    const user = await UserService.createHR(req.tenantId, { email, fullName, password, phone })
    return success(res, user, 'HR staff created successfully', 201)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

export const deleteUser = async (req, res) => {
  try {
    await UserService.deleteUser(req.params.id)
    return success(res, null, 'User deleted successfully')
  } catch (err) {
    return error(res, err.message, 500)
  }
}

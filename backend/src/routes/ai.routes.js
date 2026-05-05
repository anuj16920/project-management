import express from 'express'
import supabaseAdmin    from '../config/supabase.admin.js'
import { verifyToken }  from '../middleware/authMiddleware.js'
import { attachTenant } from '../middleware/tenantMiddleware.js'
import { success, error } from '../utils/response.js'

const router = express.Router()
router.use(verifyToken, attachTenant)

// List AI chat history for user
router.get('/history', async (req, res) => {
  try {
    const { data, error: err } = await supabaseAdmin
      .from('ai_conversations')
      .select('*')
      .eq('tenant_id', req.tenantId)
      .eq('user_uid',  req.user.uid)
      .order('created_at', { ascending: false })
      .limit(50)
    if (err) return success(res, [])
    return success(res, data || [])
  } catch { return success(res, []) }
})

// Save AI conversation message
router.post('/chat', async (req, res) => {
  try {
    const { message, response: aiResponse } = req.body
    if (!message) return error(res, 'Message required', 400)

    const { data, error: err } = await supabaseAdmin
      .from('ai_conversations')
      .insert({
        tenant_id: req.tenantId,
        user_uid:  req.user.uid,
        message,
        response:  aiResponse || 'AI service not configured',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (err) return success(res, { response: 'AI service not configured', id: null })
    return success(res, data)
  } catch { return success(res, { response: 'AI service not configured', id: null }) }
})

export default router

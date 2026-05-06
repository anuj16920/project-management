import supabase from './src/config/supabase.admin.js'

const alters = [
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS title TEXT`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS description TEXT`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR'`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal NUMERIC(14,2) DEFAULT 0`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_percent NUMERIC(5,2) DEFAULT 18`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(14,2) DEFAULT 0`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount NUMERIC(14,2) DEFAULT 0`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total NUMERIC(14,2) DEFAULT 0`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT`,
  `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT`,
]

// Supabase JS client doesn't support raw DDL — we use the REST API directly
const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
  process.exit(1)
}

for (const sql of alters) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql })
  })
  const body = await res.text()
  console.log(`[${res.status}] ${sql.slice(0, 60)}... => ${body}`)
}

// Verify final state
console.log('\n--- Verifying columns ---')
const cols = ['total', 'paid_at', 'invoice_number', 'subtotal', 'tax_amount']
for (const col of cols) {
  const { error } = await supabase.from('invoices').select(col).limit(0)
  console.log(col + ':', error ? `MISSING (${error.message})` : 'OK')
}

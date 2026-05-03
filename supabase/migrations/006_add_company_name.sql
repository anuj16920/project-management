-- Add company_name column for client profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON profiles(company_name);

-- ============================================
-- FIX: Replace sk_official with lgu_reviewer in user_role enum
-- ============================================

-- Add lgu_reviewer to enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lgu_reviewer';

-- If you have existing sk_official users, run this:
-- UPDATE profiles SET role = 'lgu_reviewer' WHERE role = 'sk_official';
-- ALTER TYPE user_role DROP VALUE IF EXISTS 'sk_official';

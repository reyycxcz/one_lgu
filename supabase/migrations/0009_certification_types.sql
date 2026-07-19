-- ============================================
-- ADD: Barangay Certificate + Scholarship Certificate types
-- ============================================
ALTER TYPE certification_type ADD VALUE IF NOT EXISTS 'barangay_certificate';
ALTER TYPE certification_type ADD VALUE IF NOT EXISTS 'scholarship_certificate';

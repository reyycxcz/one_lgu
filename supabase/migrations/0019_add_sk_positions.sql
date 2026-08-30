-- Add SK positions to the barangay_position enum type
alter type barangay_position add value if not exists 'sk_chairman';
alter type barangay_position add value if not exists 'sk_secretary';
alter type barangay_position add value if not exists 'sk_treasurer';

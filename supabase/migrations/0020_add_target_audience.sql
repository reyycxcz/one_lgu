-- Add target_audience column to document_requests table with default set to 'barangay_official'
alter table document_requests 
  add column if not exists target_audience text not null default 'barangay_official' 
  constraint chk_document_requests_target_audience check (target_audience in ('barangay_official', 'sk_official', 'both'));

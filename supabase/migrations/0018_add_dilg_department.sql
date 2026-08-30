-- Add DILG department to the lgu_department enum type
alter type lgu_department add value if not exists 'dilg_office';

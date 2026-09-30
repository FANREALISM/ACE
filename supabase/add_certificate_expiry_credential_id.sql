-- ============================================
-- Info tambahan sertifikat — keduanya OPSIONAL (nullable, tanpa default
-- wajib), konsisten dengan issue_date/credential_url yang sudah ada.
-- ============================================

alter table certificates
  add column if not exists expiry_date date,
  add column if not exists credential_id text;

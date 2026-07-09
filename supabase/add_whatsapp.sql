-- ============================================
-- Tambah nomor WhatsApp ke profile — kanal kontak utama yang lebih
-- lazim dipakai daripada email untuk portofolio developer Indonesia.
-- Simpan format internasional TANPA tanda '+' (mis. 6281234567890)
-- supaya langsung valid dipakai di URL wa.me/<nomor>.
-- ============================================

alter table profile
  add column if not exists whatsapp_number text;

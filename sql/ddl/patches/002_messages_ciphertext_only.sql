-- Remove plaintext columns so only ciphertext remains at rest (run after 01_tables if upgrading).

alter table public.messages drop column if exists original_text;
alter table public.messages drop column if exists decrypted_text;

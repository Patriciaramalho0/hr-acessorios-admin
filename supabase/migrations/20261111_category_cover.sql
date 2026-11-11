-- Autorizado pela usuária em 11/11/2026: capa opcional por categoria.
-- Alteração aditiva. Não altera dados existentes, tabelas ou políticas RLS.
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;

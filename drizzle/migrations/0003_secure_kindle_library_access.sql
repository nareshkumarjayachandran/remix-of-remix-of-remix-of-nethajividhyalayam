REVOKE ALL ON public.kindle_library_items FROM anon;
DROP POLICY "Anyone can view kindle library items" ON public.kindle_library_items;
CREATE POLICY "Staff and admin can view private library records" ON public.kindle_library_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'staff'::public.app_role));
CREATE OR REPLACE FUNCTION public.get_public_kindle_catalog()
RETURNS TABLE (id uuid, title text, category text, standard text, file_name text, file_format text, file_size integer, page_count integer, word_count integer, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id, title, category, standard, file_name, file_format, file_size, page_count, word_count, created_at FROM public.kindle_library_items ORDER BY created_at DESC; $$;
REVOKE ALL ON FUNCTION public.get_public_kindle_catalog() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_kindle_catalog() TO anon, authenticated, service_role;
DROP POLICY "Anyone can read kindle library files" ON storage.objects;
CREATE POLICY "Staff and admin can read private library files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'kindle-library' AND (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'staff'::public.app_role)));
COMMENT ON FUNCTION public.get_public_kindle_catalog() IS 'Public book details only; uploader identities and storage paths remain staff-only.';
CREATE TABLE public.kindle_library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'book' CHECK (category IN ('book', 'worksheet')),
  standard TEXT NOT NULL DEFAULT 'All',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_format TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0 CHECK (file_size >= 0),
  page_count INTEGER NOT NULL DEFAULT 1 CHECK (page_count >= 1),
  word_count INTEGER NOT NULL DEFAULT 0 CHECK (word_count >= 0),
  uploaded_by UUID,
  uploaded_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.kindle_library_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kindle_library_items TO authenticated;
GRANT ALL ON public.kindle_library_items TO service_role;

ALTER TABLE public.kindle_library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view kindle library items"
  ON public.kindle_library_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Staff and admin can insert kindle library items"
  ON public.kindle_library_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  );

CREATE POLICY "Staff and admin can update kindle library items"
  ON public.kindle_library_items
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  );

CREATE POLICY "Staff and admin can delete kindle library items"
  ON public.kindle_library_items
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  );

CREATE POLICY "Anyone can read kindle library files"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'kindle-library');

CREATE POLICY "Staff and admin can upload kindle library files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'kindle-library'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'staff'::public.app_role)
    )
  );

CREATE POLICY "Staff and admin can update kindle library files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'kindle-library'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'staff'::public.app_role)
    )
  );

CREATE POLICY "Staff and admin can delete kindle library files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'kindle-library'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'staff'::public.app_role)
    )
  );
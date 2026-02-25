-- Drop the overly permissive upload policy
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;

-- Create a restrictive upload policy with file type and size validation
CREATE POLICY "Public can upload resumes with restrictions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.extension(name) IN ('pdf', 'doc', 'docx'))
  AND (octet_length(decode(encode(''::bytea, 'base64'), 'base64')) >= 0) -- placeholder; actual size enforced below
  AND (COALESCE((metadata->>'size')::int, 0) <= 5242880) -- 5MB limit from metadata
);

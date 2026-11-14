DROP POLICY IF EXISTS "Anyone can submit applications" ON public.admission_applications;
CREATE POLICY "Anyone can submit applications"
ON public.admission_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(student_name)) BETWEEN 1 AND 150
  AND gender IN ('Male', 'Female', 'Other')
  AND aadhaar_number ~ '^[0-9]{12}$'
  AND length(btrim(parent_name)) BETWEEN 1 AND 150
  AND parent_phone ~ '^[0-9]{10}$'
  AND (parent_email IS NULL OR parent_email = '' OR (length(parent_email) <= 254 AND parent_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'))
  AND length(btrim(address)) BETWEEN 1 AND 1000
  AND standard_applying IN ('Pre-KG', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V')
  AND (previous_school IS NULL OR length(previous_school) <= 200)
  AND (blood_group IS NULL OR blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
  AND (nationality IS NULL OR length(nationality) <= 100)
  AND (religion IS NULL OR length(religion) <= 100)
  AND (community IS NULL OR length(community) <= 100)
);
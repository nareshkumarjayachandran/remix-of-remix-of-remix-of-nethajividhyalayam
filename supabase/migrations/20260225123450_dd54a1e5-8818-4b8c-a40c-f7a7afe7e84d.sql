
-- ============================================================
-- FIX 1: Lock down admission_applications SELECT to staff/admin
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view applications" ON admission_applications;

CREATE POLICY "Staff and admin can view applications" ON admission_applications
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- ============================================================
-- FIX 2: Remove public SELECT policies on students table
-- ============================================================
DROP POLICY IF EXISTS "Public can view students for fee verification" ON students;
DROP POLICY IF EXISTS "Authenticated staff can view students" ON students;

CREATE POLICY "Staff and admin can view students" ON students
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- ============================================================
-- FIX 3: Remove open INSERT on pending_fee_payments, 
--        will be handled via edge function with service role
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit fee payment" ON pending_fee_payments;

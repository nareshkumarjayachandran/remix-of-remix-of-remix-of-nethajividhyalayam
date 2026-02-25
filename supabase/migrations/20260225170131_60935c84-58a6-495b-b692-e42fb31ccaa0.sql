
-- 1. Fix fee_structure: restrict SELECT to admin/staff only
DROP POLICY IF EXISTS "Anyone authenticated can view fee structure" ON public.fee_structure;
CREATE POLICY "Admin and staff can view fee structure"
ON public.fee_structure FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- 2. Remove redundant SELECT policies (ALL policies already cover SELECT)
DROP POLICY IF EXISTS "Staff and admin can view students" ON public.students;
DROP POLICY IF EXISTS "Staff and admin can view payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Admin and staff can view cash register" ON public.cash_register;
DROP POLICY IF EXISTS "Admin and staff can view expenses" ON public.school_expenses;
DROP POLICY IF EXISTS "Admin and staff can view profiles" ON public.staff_profiles;

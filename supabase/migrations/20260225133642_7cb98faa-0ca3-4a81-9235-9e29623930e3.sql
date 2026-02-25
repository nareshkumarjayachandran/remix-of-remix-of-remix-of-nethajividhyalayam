
-- Fix fee_payments: restrict SELECT to admin/staff only
DROP POLICY IF EXISTS "Authenticated can view payments" ON public.fee_payments;
CREATE POLICY "Staff and admin can view payments"
ON public.fee_payments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Fix school_expenses: restrict SELECT to admin/staff only
DROP POLICY IF EXISTS "Authenticated can view expenses" ON public.school_expenses;
CREATE POLICY "Admin and staff can view expenses"
ON public.school_expenses FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Fix cash_register: restrict SELECT to admin/staff only
DROP POLICY IF EXISTS "Authenticated can view cash register" ON public.cash_register;
CREATE POLICY "Admin and staff can view cash register"
ON public.cash_register FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Fix staff_profiles: restrict SELECT to authenticated admin/staff only
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.staff_profiles;
CREATE POLICY "Admin and staff can view profiles"
ON public.staff_profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

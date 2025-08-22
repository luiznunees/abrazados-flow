-- Critical Security Fix: Lock down RLS policies and implement proper RBAC

-- 1. Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Fix the backdoor admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;

-- 4. Lock down registrations table - CRITICAL FIX
DROP POLICY IF EXISTS "Users can view registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can update registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can read their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can insert registrations" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.registrations;

-- New secure policies for registrations
CREATE POLICY "Users can view own registrations"
ON public.registrations FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can insert registrations"
ON public.registrations FOR INSERT
TO authenticated
WITH CHECK (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admins can manage all registrations"
ON public.registrations FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Lock down payments table - CRITICAL FIX
DROP POLICY IF EXISTS "Users can read their own payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;

-- New secure policies for payments
CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can insert payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Secure admin_stats view
DROP POLICY IF EXISTS "Allow public read access to admin_stats" ON public.admin_stats;

CREATE POLICY "Only admins can view stats"
ON public.admin_stats FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 7. Fix user_roles policies
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 8. Update triggers for user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
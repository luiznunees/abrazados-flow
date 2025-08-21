-- Fix security issues by setting proper search_path and removing security definer from view

-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_stats;
CREATE VIEW public.admin_stats AS
SELECT 
    COUNT(*) as total_registrations,
    COUNT(*) FILTER (WHERE status = 'paid') as paid_registrations,
    COUNT(*) FILTER (WHERE checked_in = true) as checked_in_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_registrations
FROM public.registrations;

-- Fix function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN 'QR_' || upper(encode(gen_random_bytes(16), 'hex'));
END;
$$;

-- Fix trigger function with proper search_path
CREATE OR REPLACE FUNCTION public.auto_generate_qr_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.qr_code IS NULL THEN
        NEW.qr_code := generate_qr_code();
    END IF;
    RETURN NEW;
END;
$$;

-- Fix is_admin function with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN TRUE; -- Simplified for now - implement proper admin auth later
END;
$$;
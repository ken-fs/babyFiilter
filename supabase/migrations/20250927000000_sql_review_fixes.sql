-- Hardening and security/grants fixes after SQL review
-- - Ensure RLS is enabled where policies exist
-- - Add appropriate grants for client access
-- - Safely add a unique constraint on customers.user_id
-- - Harden updated_at helper with deterministic search_path

-- Ensure required extensions (used elsewhere in migrations)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Enable RLS for tables that define policies but never enabled RLS
ALTER TABLE IF EXISTS public.name_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saved_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.popular_names ENABLE ROW LEVEL SECURITY;

-- 2) Grants: keep strict but usable defaults
-- Saved names are user-owned data: allow authenticated clients to operate under RLS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.saved_names TO authenticated;

-- Name generation logs: usually service_role writes, users can read their own
GRANT SELECT ON TABLE public.name_generation_logs TO authenticated;

-- Popular names: intended to be publicly readable
GRANT SELECT ON TABLE public.popular_names TO anon, authenticated;

-- Ensure service_role retains full access
GRANT ALL ON TABLE public.saved_names TO service_role;
GRANT ALL ON TABLE public.name_generation_logs TO service_role;
GRANT ALL ON TABLE public.popular_names TO service_role;

-- 3) Safely enforce 1:1 relationship between customers and auth.users
DO $$
BEGIN
  -- Only add the unique constraint if there are no duplicates
  IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'customers_user_id_unique'
          AND conrelid = 'public.customers'::regclass
  ) THEN
    IF EXISTS (
        SELECT user_id FROM public.customers
        GROUP BY user_id HAVING COUNT(*) > 1
    ) THEN
      RAISE NOTICE 'Skipped adding UNIQUE(customers.user_id) due to existing duplicates.';
    ELSE
      ALTER TABLE public.customers
        ADD CONSTRAINT customers_user_id_unique UNIQUE(user_id);
    END IF;
  END IF;
END$$;

-- 4) Recreate updated_at helper with hardened search_path (for SECURITY DEFINER usage)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- 5) Normalize trigger syntax to EXECUTE FUNCTION (optional, safe idempotent refresh)
-- Customers
DROP TRIGGER IF EXISTS handle_customers_updated_at ON public.customers;
CREATE TRIGGER handle_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Subscriptions
DROP TRIGGER IF EXISTS handle_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER handle_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Saved names
DROP TRIGGER IF EXISTS handle_saved_names_updated_at ON public.saved_names;
CREATE TRIGGER handle_saved_names_updated_at
    BEFORE UPDATE ON public.saved_names
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Popular names
DROP TRIGGER IF EXISTS handle_popular_names_updated_at ON public.popular_names;
CREATE TRIGGER handle_popular_names_updated_at
    BEFORE UPDATE ON public.popular_names
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- IP usage logs (if present)
DROP TRIGGER IF EXISTS handle_ip_usage_logs_updated_at ON public.ip_usage_logs;
CREATE TRIGGER handle_ip_usage_logs_updated_at
    BEFORE UPDATE ON public.ip_usage_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Completion notice
DO $$
BEGIN
  RAISE NOTICE 'Applied SQL review fixes: RLS enabled, grants adjusted, user_id uniqueness enforced where safe, triggers normalized.';
END$$;


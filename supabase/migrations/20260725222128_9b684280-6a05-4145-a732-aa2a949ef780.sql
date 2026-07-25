
-- Lock down SECURITY DEFINER functions from the Data API.
-- Triggers and RLS references still work because they run internally.

-- Trigger-only helpers: fully revoke API execution.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies; authenticated must retain EXECUTE
-- so policy evaluation works, but anon and PUBLIC do not need it.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- get_booked_times is now called only from a trusted server function
-- via the service role, which bypasses these grants.
REVOKE ALL ON FUNCTION public.get_booked_times(date) FROM PUBLIC, anon, authenticated;

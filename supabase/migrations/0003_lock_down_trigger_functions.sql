-- Trigger-only functions should not be callable directly via
-- /rest/v1/rpc/... by anon/authenticated roles (Supabase Advisor:
-- anon_security_definer_function_executable /
-- authenticated_security_definer_function_executable). Triggers invoke
-- these internally regardless of these grants, so revoking them is safe.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_privileged_fields() from public, anon, authenticated;

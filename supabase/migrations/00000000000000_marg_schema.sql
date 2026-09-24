-- Marg's own schema in the shared "Rochak's Hobby" Supabase project.
-- See docs/shared-supabase-db.md. Applied by scripts/db-migrate.sh.
create schema if not exists marg;
comment on schema marg is 'Marg (AI learning app) — github.com/rochak779/Marg';

grant usage on schema marg to anon, authenticated, service_role;

grant all on all tables    in schema marg to anon, authenticated, service_role;
grant all on all routines  in schema marg to anon, authenticated, service_role;
grant all on all sequences in schema marg to anon, authenticated, service_role;

alter default privileges for role postgres in schema marg
  grant all on tables    to anon, authenticated, service_role;
alter default privileges for role postgres in schema marg
  grant all on routines  to anon, authenticated, service_role;
alter default privileges for role postgres in schema marg
  grant all on sequences to anon, authenticated, service_role;

-- The runner's history table is internal; keep it off the Data API.
revoke all on marg._migrations from anon, authenticated;

-- The files below already ran against public via `supabase db push`, before
-- the shared-project rules existed. Mark them applied so the runner skips
-- them; 20260924000000_move_to_marg_schema moves their objects into marg.
-- (So a from-scratch rebuild from these files is not supported.)
insert into marg._migrations (version) values
  ('20260822080700_extensions'),
  ('20260822080716_foundation_schema'),
  ('20260822090000_learning_write_functions'),
  ('20260822100000_phase_d_lifecycle'),
  ('20260822100100_profile_avatar'),
  ('20260822110000_duel_results'),
  ('20260822120000_module_6_range'),
  ('20260823000000_feedback'),
  ('20260823010000_feedback_context')
on conflict (version) do nothing;

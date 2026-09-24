@AGENTS.md

# Database: shared Supabase project

Marg's tables live in the `marg` schema of a Supabase project shared with other apps. Read `docs/shared-supabase-db.md` before any DB work. Never run `supabase db push` / `db reset --linked` / `db pull`; apply migrations with `npm run db:migrate`.

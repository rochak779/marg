-- User-selectable avatar. Stores a DiceBear seed, not an image -- the
-- avatar itself is generated deterministically from this string on render,
-- both server- and client-side, so there is no image upload/storage to
-- manage. Null means "use the account's own user_id as the seed", which
-- gives every account a stable, unique-looking default with no extra state.
alter table public.profiles
  add column avatar_seed text;

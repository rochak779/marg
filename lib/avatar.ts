import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

// Deterministic, generated avatars (DiceBear) instead of uploaded images --
// no storage/upload infra needed. Same seed always renders the same avatar,
// both server- and client-side, so this works equally in SSR markup and in
// the picker grid.
export function avatarDataUri(seed: string) {
  return createAvatar(avataaars, { seed, size: 64 }).toDataUri();
}

// A small, fixed set of candidate seeds derived from the account's own ID,
// used for the "pick one" grid. Stable across renders/reloads since they're
// derived from userId, not random each time.
export function avatarChoices(userId: string, count = 8) {
  return Array.from({ length: count }, (_, index) => `${userId}-${index}`);
}

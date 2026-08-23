import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

// Deterministic, generated avatars (DiceBear) instead of uploaded images --
// no storage/upload infra needed. Same seed always renders the same avatar,
// both server- and client-side, so this works equally in SSR markup and in
// the picker grid.

// Fixed seed for new accounts before they've picked an avatar in settings.
// A per-user seed (e.g. the user's id) renders arbitrary traits -- hair,
// facial hair, accessories -- which isn't appropriate as an unrequested
// default. This one seed always renders the same gender/age-neutral avatar
// below, pinned with explicit options rather than left to the seed.
export const DEFAULT_AVATAR_SEED = 'marg-default';

const DEFAULT_AVATAR_OPTIONS = {
  backgroundColor: ['e0dffe'],
  top: ['shortFlat'],
  clothing: ['hoodie'],
  facialHairProbability: 0,
  accessoriesProbability: 0,
  skinColor: ['edb98a'],
  hairColor: ['4a312c'],
  eyebrows: ['defaultNatural'],
  mouth: ['default'],
  eyes: ['default'],
} as const;

export function avatarDataUri(seed: string) {
  const options = seed === DEFAULT_AVATAR_SEED ? DEFAULT_AVATAR_OPTIONS : {};
  return createAvatar(avataaars, { seed, size: 64, ...options }).toDataUri();
}

// A small, fixed set of candidate seeds derived from the account's own ID,
// used for the "pick one" grid. Stable across renders/reloads since they're
// derived from userId, not random each time.
export function avatarChoices(userId: string, count = 8) {
  return Array.from({ length: count }, (_, index) => `${userId}-${index}`);
}

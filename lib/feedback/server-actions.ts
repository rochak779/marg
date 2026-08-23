'use server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export type SubmitFeedbackResult = { ok: true } | { ok: false; error: string };

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().max(2000).optional(),
});

// Writes go through the submit_feedback RPC (security definer), same
// pattern as record_duel_result — never a direct table insert from here.
export async function submitFeedback(
  input: unknown,
): Promise<SubmitFeedbackResult> {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('submit_feedback', {
    p_rating: parsed.data.rating,
    p_message: parsed.data.message ?? null,
  });
  if (error) {
    console.error('submit_feedback failed', { code: error.code });
    return { ok: false, error: 'unavailable' };
  }

  return { ok: true };
}

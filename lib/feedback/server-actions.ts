'use server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { captureServerEvent } from '@/lib/analytics/posthog-server';

export type SubmitFeedbackResult = { ok: true } | { ok: false; error: string };

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().max(2000).optional(),
  // Set only by the quiz-result prompt (Day 1/Day 2), so that submission can
  // be told apart from a generic Settings > Help & feedback rating. Left
  // undefined there, both stay null in the row.
  moduleId: z.number().int().optional(),
  unitId: z.string().min(1).optional(),
});

// Writes go through the submit_feedback RPC (security definer), same
// pattern as record_duel_result — never a direct table insert from here.
export async function submitFeedback(
  input: unknown,
): Promise<SubmitFeedbackResult> {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.rpc('submit_feedback', {
    p_rating: parsed.data.rating,
    p_message: parsed.data.message ?? null,
    p_module_id: parsed.data.moduleId ?? null,
    p_unit_id: parsed.data.unitId ?? null,
  });
  if (error) {
    console.error('submit_feedback failed', { code: error.code });
    return { ok: false, error: 'unavailable' };
  }

  // Rating + context only — never the free-text message, which is
  // user-generated content and stays in Supabase, not PostHog.
  if (user) {
    await captureServerEvent(user.id, 'feedback_submitted', {
      rating: parsed.data.rating,
      ...(parsed.data.moduleId !== undefined && {
        moduleId: parsed.data.moduleId,
      }),
      ...(parsed.data.unitId !== undefined && { unitId: parsed.data.unitId }),
    });
  }

  return { ok: true };
}

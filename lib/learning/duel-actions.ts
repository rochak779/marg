'use server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { DUEL_QUESTION_COUNT, XP_BY_OUTCOME } from './duel';

export type DuelSummary = {
  wins: number;
  streak: number;
  rank: number | null;
  totalPlayers: number;
};

export type DuelActionResult = { ok: true } | { ok: false; error: string };

export async function getDuelSummary(): Promise<DuelSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { wins: 0, streak: 0, rank: null, totalPlayers: 0 };

  const [resultsResponse, rankResponse] = await Promise.all([
    supabase
      .from('duel_results')
      .select('outcome, played_at')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false }),
    supabase.rpc('get_duel_rank'),
  ]);

  if (resultsResponse.error) {
    console.error('getDuelSummary read failed', { code: resultsResponse.error.code });
  }
  if (rankResponse.error) {
    console.error('getDuelSummary read failed', { code: rankResponse.error.code });
  }

  const history = resultsResponse.data ?? [];
  const rankRows = rankResponse.data;
  const wins = history.filter((row) => row.outcome === 'win').length;
  let streak = 0;
  for (const row of history) {
    if (row.outcome !== 'win') break;
    streak += 1;
  }
  const rankRow = rankRows?.[0];
  const rank = rankRow && rankRow.rank > 0 ? rankRow.rank : null;
  const totalPlayers = rankRow?.total_players ?? 0;
  return { wins, streak, rank, totalPlayers };
}

const recordDuelSchema = z.object({
  moduleId: z.number().int().positive(),
  questionIds: z.array(z.string()).length(DUEL_QUESTION_COUNT),
  userScore: z.number().int().min(0).max(100),
  userTimeMs: z.number().int().min(0),
  botScore: z.number().int().min(0).max(100),
  outcome: z.enum(['win', 'loss', 'draw']),
});
// The function still takes `unknown` and validates defensively (it's a
// server action, reachable from any client), but callers can type-check
// what they build against this shape before passing it in.
export type RecordDuelResultInput = z.infer<typeof recordDuelSchema>;

export async function recordDuelResult(
  input: unknown,
): Promise<DuelActionResult> {
  const parsed = recordDuelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const xpAwarded = XP_BY_OUTCOME[parsed.data.outcome];

  const { error } = await supabase.rpc('record_duel_result', {
    p_module_id: parsed.data.moduleId,
    p_question_ids: parsed.data.questionIds,
    p_user_score: parsed.data.userScore,
    p_user_time_ms: parsed.data.userTimeMs,
    p_bot_score: parsed.data.botScore,
    p_outcome: parsed.data.outcome,
    p_xp_awarded: xpAwarded,
  });
  if (error) {
    console.error('record_duel_result failed', { code: error.code });
    return { ok: false, error: 'unavailable' };
  }
  return { ok: true };
}

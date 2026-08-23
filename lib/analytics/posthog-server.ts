import 'server-only';
import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

function getPostHogServerClient(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;
  if (!client) {
    client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      // Vercel functions are short-lived — flush immediately rather than
      // batching, so an event isn't lost when the function freezes.
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

// Used from Server Actions / Route Handlers, where events happen server-side
// (auth, duels) and there's no client-side track() call to reach them.
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties: Record<string, string | number | boolean> = {},
) {
  const posthog = getPostHogServerClient();
  if (!posthog) return;
  posthog.capture({ distinctId, event, properties });
  await posthog.shutdown();
}

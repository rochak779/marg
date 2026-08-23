import posthog from 'posthog-js';

// Client-side PostHog init. Runs before hydration (Next.js instrumentation
// client convention) so posthog.capture() calls made anywhere else in the
// app during first render never race an uninitialized client.
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // fired manually by PostHogPageView, see app/layout.tsx
    capture_pageleave: true,
    // Off deliberately: autocapture would serialize DOM attributes/input
    // values (quiz answers, settings fields) into event properties, and
    // session replay would record lesson content wholesale. Neither has
    // had the PII/consent review needed to turn it on. See PRD analytics
    // notes before flipping either of these.
    autocapture: false,
    disable_session_recording: true,
  });
}

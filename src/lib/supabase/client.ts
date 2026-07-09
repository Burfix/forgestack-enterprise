// Target path in repo: src/lib/supabase/client.ts
//
// Browser-side client for the login page and any client components that
// need to call supabase.auth directly (sign in, sign out, magic link).

import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

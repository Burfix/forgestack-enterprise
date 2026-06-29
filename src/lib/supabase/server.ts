import { createClient } from '@supabase/supabase-js'

/**
 * Phase 1: service-role client — bypasses RLS while auth is not yet built.
 * Phase 2: replace with createServerClient from @supabase/ssr, reading
 *          cookies() and using the anon key with JWT app_metadata claims.
 *
 * Never import this in client components. Server-only.
 */
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — add to .env.local'
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

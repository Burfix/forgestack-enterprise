// Target path in repo: src/lib/supabase/server.ts
//
// Phase 2: real session-aware client, cookie-based, RLS-enforced.
// Replaces the Phase 1 service-role client that bypassed RLS entirely.
//
// Server-only. Never import in client components.

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Use this for all normal request handling — server components, server
 * actions, route handlers. Requests are made as the logged-in user, and
 * RLS policies apply exactly as they would for that user in the database.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — add to .env.local'
    )
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component that can't set cookies — safe to
          // ignore as long as middleware.ts is refreshing the session.
        }
      },
    },
  })
}

/**
 * Bypasses RLS entirely. Named deliberately so it's never reached for by
 * accident — reserved for background jobs, scheduled tasks, and admin
 * scripts that have no logged-in user to act as. Do NOT use this in normal
 * request-handling code paths; that defeats the point of Phase 2 auth.
 */
export function createServiceRoleSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — add to .env.local'
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

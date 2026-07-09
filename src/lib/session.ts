// Target path in repo: src/lib/session.ts
//
// Phase 2: organisation comes from the authenticated user's active
// user_roles grant, not a hardcoded env var. Replaces APP_ORG_SLUG.

import { createServerSupabaseClient } from './supabase/server'

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getOrganisationId(): Promise<string> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('organisation_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .not('organisation_id', 'is', null)
    .order('granted_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !data?.organisation_id) {
    throw new Error(
      `No active organisation role found for user ${user.id} — grant a role in user_roles first.`
    )
  }

  return data.organisation_id
}

/** Active role names for the current user, e.g. ['super_admin']. Empty if none. */
export async function getCurrentRoles(): Promise<string[]> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)

  return (data ?? []).map((r) => r.role)
}

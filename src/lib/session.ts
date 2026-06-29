import { createServerSupabaseClient } from './supabase/server'

/**
 * Phase 1: resolves organisation_id by looking up APP_ORG_SLUG from env.
 * Phase 2: replace with JWT app_metadata.organisation_id claim parsing.
 *
 * Set APP_ORG_SLUG=sfi-group in .env.local for Phase 1.
 */
export async function getOrganisationId(): Promise<string> {
  const slug = process.env.APP_ORG_SLUG
  if (!slug) {
    throw new Error('APP_ORG_SLUG env var is required — add to .env.local')
  }
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('organisations')
    .select('id')
    .eq('slug', slug)
    .single()
  if (error || !data) {
    throw new Error(`Organisation with slug "${slug}" not found`)
  }
  return data.id
}

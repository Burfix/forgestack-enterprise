'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOrganisationId } from '@/lib/session'

export async function approveWorkOrder(
  workOrderId: string
): Promise<{ success: boolean; approvedAt: string; error?: string }> {
  const supabase = createServerSupabaseClient()
  const orgId = await getOrganisationId()
  const now = new Date().toISOString()

  // Phase 1: use SFI-003 (ops manager) as the approver proxy.
  // Phase 2: replace with session.user from JWT claims.
  const { data: approverEmployee } = await supabase
    .from('employees')
    .select('id, email')
    .eq('organisation_id', orgId)
    .eq('employee_number', 'SFI-003')
    .single()

  const approverId = approverEmployee?.id ?? null
  const approverEmail = approverEmployee?.email ?? 'system@forgestack.io'

  const { error: updateError } = await supabase
    .from('work_orders')
    .update({
      status: 'manager_approved',
      manager_approved_at: now,
      manager_approved_by: approverId,
      updated_at: now,
    })
    .eq('id', workOrderId)
    .eq('organisation_id', orgId)

  if (updateError) {
    return { success: false, approvedAt: now, error: updateError.message }
  }

  await supabase.from('audit_logs').insert({
    organisation_id: orgId,
    actor_id: approverId,
    actor_email: approverEmail,
    action: 'work_order.approved',
    entity_type: 'work_orders',
    entity_id: workOrderId,
    after_state: { status: 'manager_approved', approved_at: now },
  })

  return { success: true, approvedAt: now }
}

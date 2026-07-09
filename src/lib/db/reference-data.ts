// Shared organisation reference data — sites, departments, employee roles.
// Used by any form that needs to populate a dropdown with these (recruitment's
// New Vacancy form today; an eventual "add employee" form would reuse this
// rather than duplicating the same three queries).

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface SiteOption {
  id: string
  name: string
  region: string | null
}

export interface DepartmentOption {
  id: string
  name: string
}

export interface EmployeeRoleOption {
  id: string
  title: string
  level: string | null
}

export async function getSites(organisationId: string): Promise<SiteOption[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('sites')
    .select('id, name, region')
    .eq('organisation_id', organisationId)
    .is('deleted_at', null)
    .order('name')

  if (error) throw new Error(`Failed to load sites: ${error.message}`)
  return data ?? []
}

export async function getDepartments(organisationId: string): Promise<DepartmentOption[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .eq('organisation_id', organisationId)
    .is('deleted_at', null)
    .order('name')

  if (error) throw new Error(`Failed to load departments: ${error.message}`)
  return data ?? []
}

export async function getEmployeeRoles(organisationId: string): Promise<EmployeeRoleOption[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('employee_roles')
    .select('id, title, level')
    .eq('organisation_id', organisationId)
    .is('deleted_at', null)
    .order('title')

  if (error) throw new Error(`Failed to load employee roles: ${error.message}`)
  return data ?? []
}

export interface HiringManagerOption {
  id: string
  first_name: string
  last_name: string
}

export interface ContractTypeOption {
  id: string
  name: string
}

export interface HireTypeOption {
  id: string
  name: string
}

/** Employees eligible to be listed as a vacancy's hiring manager — manager, supervisor, or executive level. */
export async function getHiringManagers(organisationId: string): Promise<HiringManagerOption[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('employees')
    .select('id, first_name, last_name, role:employee_roles!inner(level)')
    .eq('organisation_id', organisationId)
    .is('deleted_at', null)
    .in('role.level', ['manager', 'supervisor', 'executive'])
    .order('first_name')

  if (error) throw new Error(`Failed to load hiring managers: ${error.message}`)
  return (data ?? []).map((r) => ({ id: r.id, first_name: r.first_name, last_name: r.last_name }))
}

export async function getContractTypes(organisationId: string): Promise<ContractTypeOption[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('hr_contract_types')
    .select('id, name')
    .eq('organisation_id', organisationId)
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(`Failed to load contract types: ${error.message}`)
  return data ?? []
}

export async function getHireTypes(organisationId: string): Promise<HireTypeOption[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('hr_hire_types')
    .select('id, name')
    .eq('organisation_id', organisationId)
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(`Failed to load hire types: ${error.message}`)
  return data ?? []
}

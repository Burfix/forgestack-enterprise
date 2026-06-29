import type { EmployeeRow, ReadinessScore } from '@/types/hr'

export interface EnrichedEmployee extends EmployeeRow {
  readiness: ReadinessScore
  expiredCount: number
  expiringSoonCount: number
  mandatoryIssueCount: number
}

export interface ReadinessTier {
  label: string
  range: string
  colour: string
  count: number
}

export interface DeptStat {
  name: string
  avg: number
  count: number
}

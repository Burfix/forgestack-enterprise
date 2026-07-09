// Plain constant, deliberately isolated from workflow-detail.ts (which
// imports the server-only Supabase client via next/headers). Client
// components need this label map but must never pull in that server module
// into their bundle — see candidate-stage-detail.tsx.
export const DOCUMENT_LABELS: Record<string, string> = {
  id: 'ID',
  banking_details: 'Banking details',
  certificates: 'Certificates',
  tax_details: 'Tax details',
  signed_documents: 'Signed documents',
  police_clearance: 'Police clearance',
}

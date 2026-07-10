// Plain constant, deliberately isolated from workflow-detail.ts (which
// imports the server-only Supabase client via next/headers). Client
// components need this label map but must never pull in that server module
// into their bundle — see candidate-stage-detail.tsx.
//
// Keys MUST match the candidate_documents_document_type_check constraint
// exactly (id_document, banking_details, certificates, tax_documents,
// signed_offer, police_clearance, other). A mismatch here silently breaks
// document seeding at the document_collection/police_clearance stages —
// caught in production verification 2026-07-10, see migration
// fix_document_type_values_in_transition_function.
export const DOCUMENT_LABELS: Record<string, string> = {
  id_document: 'ID',
  banking_details: 'Banking details',
  certificates: 'Certificates',
  tax_documents: 'Tax details',
  signed_offer: 'Signed documents',
  police_clearance: 'Police clearance',
}

// Delivery worker for the recruitment notification outbox. Triggered by
// Vercel Cron (see vercel.json) on a schedule, not by any user action.
//
// Nothing here can block a stage transition — that already happened and
// committed before this route ever runs. This route's only job is: scan for
// new SLA breaches, then attempt to send whatever's sitting in the queue,
// recording exactly what happened (sent / skipped / failed-with-reason) so
// nothing silently disappears.

import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_ATTEMPTS = 3
const BATCH_SIZE = 50

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD

  if (!host || !port || !user || !password) return null

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass: password },
  })
}

export async function GET(request: Request) {
  // Fail closed: an unconfigured CRON_SECRET must never mean "no auth
  // required". This route can trigger real email sends, so treat a missing
  // secret as a misconfiguration to reject, not a check to skip.
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured. Set it in Vercel environment variables before this route can run.' },
      { status: 500 },
    )
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleSupabaseClient()

  // 1. Enqueue any new SLA warning/escalation notifications. Stage-entry
  // notifications are already enqueued synchronously by
  // fs_recruitment_transition_stage — this only covers the time-based ones.
  const { data: scanCount, error: scanError } = await supabase.rpc('fs_scan_recruitment_sla_notifications')
  if (scanError) {
    return NextResponse.json({ error: `SLA scan failed: ${scanError.message}` }, { status: 500 })
  }

  // 2. Process the send queue.
  const { data: pending, error: fetchError } = await supabase
    .from('recruitment_notifications')
    .select('id, recipient_email, subject, body, attempts')
    .eq('status', 'pending')
    .order('created_at')
    .limit(BATCH_SIZE)

  if (fetchError) {
    return NextResponse.json({ error: `Could not load notification queue: ${fetchError.message}` }, { status: 500 })
  }

  const transporter = getTransporter()
  let sent = 0
  let failed = 0
  let skipped = 0

  for (const notification of pending ?? []) {
    if (!notification.recipient_email) {
      // Shouldn't happen — rows without an email are inserted as 'skipped'
      // already — but guard anyway rather than attempting a send to nowhere.
      await supabase
        .from('recruitment_notifications')
        .update({ status: 'skipped', last_error: 'No recipient email at send time.' })
        .eq('id', notification.id)
      skipped += 1
      continue
    }

    if (!transporter) {
      await supabase
        .from('recruitment_notifications')
        .update({
          status: 'failed',
          attempts: notification.attempts + 1,
          last_error: 'SMTP is not configured (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD missing). Add these in Vercel environment variables to enable delivery.',
        })
        .eq('id', notification.id)
      failed += 1
      continue
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: notification.recipient_email,
        subject: notification.subject,
        text: notification.body,
      })
      await supabase
        .from('recruitment_notifications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', notification.id)
      sent += 1
    } catch (err) {
      const attempts = notification.attempts + 1
      await supabase
        .from('recruitment_notifications')
        .update({
          status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
          attempts,
          last_error: err instanceof Error ? err.message : 'Unknown delivery error',
        })
        .eq('id', notification.id)
      failed += 1
    }
  }

  return NextResponse.json({
    slaNotificationsQueued: scanCount ?? 0,
    processed: (pending ?? []).length,
    sent,
    failed,
    skipped,
  })
}

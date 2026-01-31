import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  mapWhatsAppError,
  isCriticalError,
  isOptOutError
} from '@/lib/whatsapp-errors'
import { settingsDb } from '@/lib/supabase-db'

// Get or generate webhook verify token (Supabase settings preferred, env var fallback)
async function getVerifyToken(): Promise<string> {
  try {
    const storedToken = await settingsDb.get('webhook_verify_token')
    if (storedToken) return storedToken

    const newToken = crypto.randomUUID()
    await settingsDb.set('webhook_verify_token', newToken)
    return newToken
  } catch {
    return process.env.WEBHOOK_VERIFY_TOKEN?.trim() || 'not-configured'
  }
}

// Meta Webhook Verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  const MY_VERIFY_TOKEN = await getVerifyToken()

  if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// Webhook Event Receiver
export async function POST(request: NextRequest) {
  const body = await request.json()
  if (body.object !== 'whatsapp_business_account') return NextResponse.json({ status: 'ignored' })

  console.log('📨 Webhook received:', JSON.stringify(body))

  try {
    const entries = body.entry || []
    for (const entry of entries) {
      const changes = entry.changes || []
      for (const change of changes) {
        // Find instance based on recipient phone number ID
        const recipientPhoneId = change.value?.metadata?.phone_number_id
        let instanceId: string | undefined

        if (recipientPhoneId) {
          const { data: instance } = await supabase
            .from('instances')
            .select('id')
            .eq('phone_number_id', recipientPhoneId)
            .single()
          instanceId = instance?.id
        }

        // 1. Process Status Updates
        const statuses = change.value?.statuses || []
        for (const statusUpdate of statuses) {
          const { id: messageId, status: msgStatus, errors } = statusUpdate
          const { data: contactRecord } = await supabase
            .from('campaign_contacts')
            .select('id, status, campaign_id, phone')
            .eq('message_id', messageId)
            .single()

          if (!contactRecord) continue

          // Progression check
          const ord = { pending: 0, sent: 1, delivered: 2, read: 3, failed: 4 }
          const currOrd = ord[contactRecord.status as keyof typeof ord] ?? 0
          const newOrd = ord[msgStatus as keyof typeof ord] ?? 0
          if (newOrd <= currOrd && msgStatus !== 'failed') continue

          const { campaign_id: campaignId, phone } = contactRecord

          switch (msgStatus) {
            case 'delivered':
              const { data: delRows } = await supabase
                .from('campaign_contacts')
                .update({ status: 'delivered', delivered_at: new Date().toISOString() })
                .eq('campaign_id', campaignId)
                .eq('phone', phone)
                .neq('status', 'delivered')
                .neq('status', 'read')
                .select('id')

              if (delRows?.length) {
                const { data: camp } = await supabase.from('campaigns').select('delivered').eq('id', campaignId).single()
                if (camp) await supabase.from('campaigns').update({ delivered: (camp.delivered || 0) + 1 }).eq('id', campaignId)

                if (instanceId) {
                  await supabase.from('account_alerts').update({ dismissed: true }).eq('type', 'payment').eq('instance_id', instanceId).eq('dismissed', false)
                }
              }
              break

            case 'read':
              const { data: rdRows } = await supabase
                .from('campaign_contacts')
                .update({ status: 'read', read_at: new Date().toISOString() })
                .eq('campaign_id', campaignId)
                .eq('phone', phone)
                .neq('status', 'read')
                .select('id')

              if (rdRows?.length) {
                const { data: camp } = await supabase.from('campaigns').select('read').eq('id', campaignId).single()
                if (camp) await supabase.from('campaigns').update({ read: (camp.read || 0) + 1 }).eq('id', campaignId)
              }
              break

            case 'failed':
              const errorCode = errors?.[0]?.code || 0
              const mappedErr = mapWhatsAppError(errorCode)
              const { data: fRows } = await supabase
                .from('campaign_contacts')
                .update({ status: 'failed', failed_at: new Date().toISOString(), failure_code: errorCode, failure_reason: mappedErr.userMessage })
                .eq('campaign_id', campaignId)
                .eq('phone', phone)
                .select('id')

              if (fRows?.length) {
                const { data: camp } = await supabase.from('campaigns').select('failed').eq('id', campaignId).single()
                if (camp) await supabase.from('campaigns').update({ failed: (camp.failed || 0) + 1 }).eq('id', campaignId)
              }

              if (isCriticalError(errorCode) && instanceId) {
                await supabase.from('account_alerts').upsert({
                  id: `alert_${errorCode}_${instanceId}_${Date.now()}`,
                  type: mappedErr.category,
                  code: errorCode,
                  message: mappedErr.userMessage,
                  instance_id: instanceId
                })
              }
              break
          }
        }

        // 2. Process Messages
        const messages = change.value?.messages || []
        for (const msg of messages) {
          console.log(`📩 Message from ${msg.from} on instance ${instanceId}`)
        }
      }
    }
  } catch (e) {
    console.error('Webhook error:', e)
  }
  return NextResponse.json({ status: 'ok' })
}

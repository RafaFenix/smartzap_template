import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export interface AccountAlert {
  id: string
  instanceId?: string | null
  type: string
  code: number | null
  message: string
  details: string | null
  dismissed: boolean
  created_at: string
}

/**
 * GET /api/account/alerts
 * Get active (non-dismissed) account alerts
 * OPTIMIZED: Uses Supabase with caching
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceId = searchParams.get('instanceId')

    let query = supabase
      .from('account_alerts')
      .select('*')
      .eq('dismissed', false)

    if (instanceId) {
      query = query.eq('instance_id', instanceId)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      if (error.message.includes('does not exist')) {
        return NextResponse.json({ alerts: [] })
      }
      throw error
    }

    const alerts: AccountAlert[] = (data || []).map(row => ({
      id: row.id,
      instanceId: row.instance_id,
      type: row.type,
      code: row.code,
      message: row.message,
      details: row.details,
      dismissed: row.dismissed,
      created_at: row.created_at
    }))

    return NextResponse.json({ alerts }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
    return NextResponse.json({ alerts: [], error: (error as Error).message })
  }
}

/**
 * POST /api/account/alerts
 * Create a new account alert (mainly for testing)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, code, message, details, instanceId } = body

    if (!type || !message) {
      return NextResponse.json(
        { error: 'type e message são obrigatórios' },
        { status: 400 }
      )
    }

    const id = `alert_${code || 'manual'}_${Date.now()}`
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('account_alerts')
      .insert({
        id,
        type,
        code: code || null,
        message,
        details: details ? JSON.stringify(details) : null,
        dismissed: false,
        instance_id: instanceId || null,
        created_at: now
      })

    if (error) throw error

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Failed to create alert:', error)
    return NextResponse.json(
      { error: 'Falha ao criar alerta', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/account/alerts
 * Dismiss an alert (mark as dismissed)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('id')
    const dismissAll = searchParams.get('all') === 'true'
    const instanceId = searchParams.get('instanceId')

    if (dismissAll) {
      let query = supabase
        .from('account_alerts')
        .update({ dismissed: true })
        .neq('dismissed', true)

      if (instanceId) {
        query = query.eq('instance_id', instanceId)
      }

      const { error } = await query

      if (error) throw error
      return NextResponse.json({ success: true, message: 'Alertas dispensados' })
    }

    if (!alertId) {
      return NextResponse.json(
        { error: 'id é obrigatório' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('account_alerts')
      .update({ dismissed: true })
      .eq('id', alertId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to dismiss alert:', error)
    return NextResponse.json(
      { error: 'Falha ao dispensar alerta', details: (error as Error).message },
      { status: 500 }
    )
  }
}

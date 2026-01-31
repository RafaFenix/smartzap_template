import { NextResponse } from 'next/server'
import { dashboardDb } from '@/lib/supabase-db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceId = searchParams.get('instanceId') || undefined

    // Fetch stats from dashboardDb with instance filtering
    const stats = await dashboardDb.getStats(instanceId)

    return NextResponse.json(stats, {
      headers: {
        // Cache no CDN por 15s, serve stale enquanto revalida em background
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

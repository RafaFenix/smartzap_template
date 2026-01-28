import { NextRequest, NextResponse } from 'next/server'
import { instanceDb } from '@/lib/supabase-db'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const instance = await instanceDb.getById(id)
        if (!instance) {
            return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
        }

        // For now, return the current status from DB
        // In a real scenario, we would call the Meta API here to verify the token/connection
        return NextResponse.json({
            status: instance.status,
            details: {
                lastChecked: new Date().toISOString(),
                phoneNumberId: instance.phoneNumberId
            }
        })
    } catch (error) {
        console.error('Error checking instance health:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

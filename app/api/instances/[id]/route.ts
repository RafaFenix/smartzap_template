import { NextRequest, NextResponse } from 'next/server'
import { instanceDb } from '@/lib/supabase-db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const instance = await instanceDb.getById(params.id)
        if (!instance) {
            return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
        }
        return NextResponse.json(instance)
    } catch (error) {
        console.error('Error getting instance:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const instance = await instanceDb.update(params.id, body)
        if (!instance) {
            return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
        }
        return NextResponse.json(instance)
    } catch (error) {
        console.error('Error updating instance:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await instanceDb.delete(params.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting instance:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

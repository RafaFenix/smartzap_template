import { NextRequest, NextResponse } from 'next/server'
import { instanceDb } from '@/lib/supabase-db'

export async function GET() {
    try {
        const instances = await instanceDb.getAll()
        return NextResponse.json(instances)
    } catch (error) {
        console.error('Error listing instances:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, phoneNumberId, accessToken, businessAccountId, clientName, description, color } = body

        if (!name || !phoneNumberId || !accessToken) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const instance = await instanceDb.create({
            name,
            phoneNumberId,
            accessToken,
            businessAccountId,
            status: 'active',
            clientName,
            description,
            color
        })

        return NextResponse.json(instance)
    } catch (error) {
        console.error('Error creating instance:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

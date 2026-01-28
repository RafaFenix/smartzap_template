import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export const runtime = 'nodejs'

const INSTANCES_SQL = `
-- Habilita extensão de UUID se não estiver ativa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Cria a tabela de Instâncias (Números)
CREATE TABLE IF NOT EXISTS instances (
  id TEXT PRIMARY KEY DEFAULT concat('inst_', replace(uuid_generate_v4()::text, '-', '')::text),
  name TEXT NOT NULL,
  phone_number_id TEXT NOT NULL,
  business_account_id TEXT,
  access_token TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_instances_phone_number_id ON instances(phone_number_id);

-- 2. Adiciona a coluna instance_id nas tabelas existentes para suportar múltiplos números
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS instance_id TEXT REFERENCES instances(id) ON DELETE CASCADE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS instance_id TEXT REFERENCES instances(id) ON DELETE CASCADE;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS instance_id TEXT REFERENCES instances(id) ON DELETE CASCADE;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS instance_id TEXT REFERENCES instances(id) ON DELETE CASCADE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_campaigns_instance_id ON campaigns(instance_id);
CREATE INDEX IF NOT EXISTS idx_contacts_instance_id ON contacts(instance_id);
CREATE INDEX IF NOT EXISTS idx_bots_instance_id ON bots(instance_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_instance_id ON ai_agents(instance_id);

-- 3. Habilita o Realtime para a nova tabela
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'instances') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE instances;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add to publication';
END $$;
`

export async function POST(request: NextRequest) {
    let client: Client | null = null

    try {
        const body = await request.json()
        const { dbPassword, connectionString: providedConnectionString } = body

        let connectionString = providedConnectionString

        if (!connectionString) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1]

            if (!projectRef || !dbPassword) {
                return NextResponse.json({
                    error: 'DATABASE_URL não encontrada. Por favor, forneça o Connection String ou a senha do banco.',
                    needsInput: true
                }, { status: 400 })
            }

            // Construct connection string assuming 'postgres' user
            connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`
        }

        client = new Client({
            connectionString,
            ssl: { rejectUnauthorized: false }
        })

        await client.connect()
        await client.query(INSTANCES_SQL)
        await client.end()

        return NextResponse.json({
            success: true,
            message: 'Tabela instances criada com sucesso!'
        })

    } catch (error: any) {
        console.error('Migration error:', error)
        return NextResponse.json({
            error: error.message,
            hint: 'Verifique se a senha do banco de dados está correta.'
        }, { status: 500 })
    } finally {
        if (client) {
            await client.end().catch(() => { })
        }
    }
}

// GET method to provide a simple diagnostic/UI if needed
export async function GET() {
    return NextResponse.json({
        message: 'Para criar as tabelas, envie um POST para esta rota com { "dbPassword": "sua-senha" }'
    })
}

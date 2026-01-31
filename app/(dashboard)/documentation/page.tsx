'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Book,
    Settings,
    Smartphone,
    Database,
    Zap,
    MessageSquare,
    Users,
    FileText,
    Shield,
    Code,
    Workflow
} from 'lucide-react';

export default function DocumentationPage() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Documentação do Sistema</h1>
                <p className="text-gray-400">Guia completo de arquitetura, configuração e uso do SmartZap.</p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-zinc-900/50 p-1 border border-white/5">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-primary-600">Visão Geral</TabsTrigger>
                    <TabsTrigger value="configuration" className="data-[state=active]:bg-primary-600">Configuração</TabsTrigger>
                    <TabsTrigger value="manual" className="data-[state=active]:bg-primary-600">Manual do Usuário</TabsTrigger>
                    <TabsTrigger value="technical" className="data-[state=active]:bg-primary-600">Técnico</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    <Card className="glass-panel border-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Book className="w-5 h-5 text-primary-400" />
                                O que é o SmartZap?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-gray-300">
                            <p>
                                O SmartZap é uma plataforma profissional de **Gestão de Campanhas e Atendimento via WhatsApp**, projetada para operar no modelo **Agency Mode** (Agência).
                            </p>
                            <p>
                                Diferente de disparadores comuns, ele utiliza a **WhatsApp Business API Oficial** da Meta, garantindo:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400">
                                <li><strong>Segurança:</strong> Menor risco de bloqueio comparado a automações não oficiais.</li>
                                <li><strong>Escala:</strong> Capacidade de enviar milhares de mensagens com alta entregabilidade.</li>
                                <li><strong>Interatividade:</strong> Suporte a botões, listas e templates ricos.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="glass-panel border-white/5">
                            <CardHeader>
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    Multi-Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400">
                                    Gerencie múltiplos números de WhatsApp de diferentes clientes em um único painel administrativo centralizado.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="glass-panel border-white/5">
                            <CardHeader>
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <Workflow className="w-4 h-4 text-emerald-400" />
                                    Automação
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400">
                                    Crie fluxos de conversa e campanhas de disparo em massa com agendamento e relatórios detalhados.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="glass-panel border-white/5">
                            <CardHeader>
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-purple-400" />
                                    Segurança
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400">
                                    Dados isolados lógicamente por instância. Cada cliente tem seus contatos e campanhas separados.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* CONFIGURATION TAB */}
                <TabsContent value="configuration" className="space-y-6 mt-6">
                    <Card className="glass-panel border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">Infraestrutura Necessária</CardTitle>
                            <CardDescription>O sistema depende de serviços serverless para funcionar.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 font-semibold text-white">
                                        <Database className="w-4 h-4 text-emerald-400" />
                                        1. Banco de Dados (Supabase)
                                    </div>
                                    <p className="text-xs text-gray-400">Responsável por armazenar campanhas, contatos, logs e configurações.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 font-semibold text-white">
                                        <Zap className="w-4 h-4 text-red-400" />
                                        2. Cache & Filas (Upstash)
                                    </div>
                                    <p className="text-xs text-gray-400">Redis gerencia o cache e QStash gerencia as filas de disparo assíncrono.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-panel border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">Conectando uma Instância (WhatsApp)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ol className="list-decimal pl-5 space-y-3 text-gray-300">
                                <li>
                                    Acesse o <a href="https://developers.facebook.com/" target="_blank" className="text-primary-400 underline">Meta for Developers</a> e crie um App do tipo "Business".
                                </li>
                                <li>
                                    Adicione o produto "WhatsApp" ao seu app.
                                </li>
                                <li>
                                    Gere um <strong>System User Token</strong> (Token Permanente) nas configurações do Business Manager com a permissão <code>whatsapp_business_messaging</code>.
                                </li>
                                <li>
                                    No SmartZap, vá em <strong>Meus Clientes &gt; Adicionar Novo Cliente</strong>.
                                </li>
                                <li>
                                    Insira o <strong>Phone Number ID</strong>, o Token gerado e defina um Nome e Cor para o cliente.
                                </li>
                            </ol>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MANUAL TAB */}
                <TabsContent value="manual" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="glass-panel border-white/5 bg-zinc-900/50">
                                <CardHeader>
                                    <CardTitle className="text-sm uppercase text-gray-500 font-bold tracking-wider">Módulos</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer text-gray-300 text-sm font-medium">1. Gestão de Clientes</div>
                                    <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer text-gray-300 text-sm font-medium">2. Contatos & Tags</div>
                                    <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer text-gray-300 text-sm font-medium">3. Templates (HSM)</div>
                                    <div className="p-2 hover:bg-white/5 rounded-lg cursor-pointer text-gray-300 text-sm font-medium">4. Campanhas</div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <Card className="glass-panel border-white/5">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Smartphone className="w-5 h-5 text-primary-400" />
                                        1. Gestão de Clientes (Agency Mode)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-gray-400 space-y-2">
                                    <p>Este é o coração do sistema para o administrador. Aqui você centraliza todos os números conectados.</p>
                                    <p><strong>Troca de Contexto:</strong> Ao clicar em "Gerenciar" em um card de cliente, todo o painel (Dash, Campanhas, Contatos) muda para mostrar APENAS os dados daquele cliente.</p>
                                </CardContent>
                            </Card>

                            <Card className="glass-panel border-white/5">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-yellow-400" />
                                        3. Templates (HSM)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-gray-400 space-y-2">
                                    <p>O WhatsApp exige que mensagens iniciadas pela empresa usem templates pré-aprovados.</p>
                                    <p>Crie seus templates no Gerenciador do WhatsApp no Facebook e sincronize-os aqui para usar em campanhas.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TECHNICAL TAB */}
                <TabsContent value="technical" className="space-y-6 mt-6">
                    <Card className="glass-panel border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Code className="w-5 h-5 text-pink-400" />
                                Arquitetura do Sistema
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-2">Isolamento Lógico (Row Level Logic)</h3>
                                <p className="text-sm text-gray-400">
                                    O sistema utiliza um padrão de <code>instance_id</code> em todas as tabelas críticas (contacts, campaigns).
                                    A camada de serviço (Service Layer) intercepta todas as chamadas ao banco e injeta automaticamente o ID da instância atual,
                                    garantindo que dados nunca vazem entre clientes.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-white/10 bg-zinc-950">
                                    <code className="text-xs text-blue-300">stack tecnológica</code>
                                    <ul className="mt-2 space-y-1 text-sm text-gray-400">
                                        <li>• Next.js 14 (App Router)</li>
                                        <li>• TypeScript</li>
                                        <li>• Tailwind CSS + Shadcn/ui</li>
                                        <li>• Supabase (PostgreSQL)</li>
                                        <li>• Redis + QStash (Serverless Queue)</li>
                                    </ul>
                                </div>
                                <div className="p-4 rounded-xl border border-white/10 bg-zinc-950">
                                    <code className="text-xs text-green-300">variáveis de ambiente</code>
                                    <ul className="mt-2 space-y-1 text-sm text-gray-400">
                                        <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
                                        <li><code>SUPABASE_SERVICE_ROLE_KEY</code></li>
                                        <li><code>KV_REST_API_URL</code> (Redis)</li>
                                        <li><code>QSTASH_TOKEN</code></li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

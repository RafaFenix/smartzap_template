
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { instanceService } from '@/services/instanceService';
import { useInstance } from '@/components/providers/InstanceProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Smartphone } from 'lucide-react';

export default function ConnectInstancePage() {
    const router = useRouter();
    const { refreshInstances, switchInstance } = useInstance();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumberId: '',
        businessAccountId: '',
        accessToken: '',
        // Agency Metadata
        clientName: '',
        description: '',
        color: 'zinc'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phoneNumberId || !formData.accessToken) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        setIsLoading(true);

        try {
            const newInstance = await instanceService.create({
                name: formData.name,
                phoneNumberId: formData.phoneNumberId,
                businessAccountId: formData.businessAccountId,
                accessToken: formData.accessToken,
                clientName: formData.clientName || formData.name,
                description: formData.description,
                color: formData.color
            });

            toast.success('Cliente conectado com sucesso!');
            await refreshInstances();
            switchInstance(newInstance.id);
            router.push('/settings');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao conectar número. Verifique as credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    const colors = [
        { value: 'zinc', class: 'bg-zinc-500' },
        { value: 'red', class: 'bg-red-500' },
        { value: 'orange', class: 'bg-orange-500' },
        { value: 'amber', class: 'bg-amber-500' },
        { value: 'green', class: 'bg-green-500' },
        { value: 'emerald', class: 'bg-emerald-500' },
        { value: 'teal', class: 'bg-teal-500' },
        { value: 'cyan', class: 'bg-cyan-500' },
        { value: 'blue', class: 'bg-blue-500' },
        { value: 'indigo', class: 'bg-indigo-500' },
        { value: 'violet', class: 'bg-violet-500' },
        { value: 'purple', class: 'bg-purple-500' },
        { value: 'fuchsia', class: 'bg-fuchsia-500' },
        { value: 'pink', class: 'bg-pink-500' },
        { value: 'rose', class: 'bg-rose-500' },
    ];

    return (
        <div className="max-w-2xl mx-auto py-10">
            <Card className="glass-panel border-white/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Smartphone className="w-6 h-6 text-primary-500" />
                        Adicionar Novo Cliente
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Conecte um novo número de WhatsApp para gerenciar.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {/* Client Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-300 border-b border-white/10 pb-2">Informações do Cliente</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="clientName" className="text-gray-300">Nome do Cliente</Label>
                                    <Input
                                        id="clientName"
                                        placeholder="Ex: Empresa X"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                                        className="bg-zinc-900/50 border-white/10 text-white placeholder:text-gray-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-300">Identificador Interno (Slug)</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: empresa-x-suporte"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        className="bg-zinc-900/50 border-white/10 text-white placeholder:text-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-gray-300">Descrição (Opcional)</Label>
                                <Input
                                    id="description"
                                    placeholder="Ex: Número principal de atendimento ao cliente"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="bg-zinc-900/50 border-white/10 text-white placeholder:text-gray-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-300">Cor de Identificação</Label>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                                            className={`w-6 h-6 rounded-full transition-all ${color.class} ${formData.color === color.value
                                                    ? 'ring-2 ring-white scale-110'
                                                    : 'opacity-60 hover:opacity-100 hover:scale-110'
                                                }`}
                                            title={color.value}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Connection Info Section */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-sm font-medium text-gray-300 border-b border-white/10 pb-2">Credenciais da Meta (WhatsApp API)</h3>

                            <div className="space-y-2">
                                <Label htmlFor="phoneId" className="text-gray-300">Phone Number ID</Label>
                                <Input
                                    id="phoneId"
                                    placeholder="ID do número no Meta for Developers"
                                    value={formData.phoneNumberId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                                    required
                                    className="bg-zinc-900/50 border-white/10 text-white placeholder:text-gray-500 font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="wabaId" className="text-gray-300">Business Account ID (Opcional)</Label>
                                <Input
                                    id="wabaId"
                                    placeholder="ID da conta empresarial WhatsApp"
                                    value={formData.businessAccountId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, businessAccountId: e.target.value }))}
                                    className="bg-zinc-900/50 border-white/10 text-white placeholder:text-gray-500 font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="token" className="text-gray-300">Access Token (Permanente)</Label>
                                <Input
                                    id="token"
                                    type="password"
                                    placeholder="Token de acesso do sistema (User/System User)"
                                    value={formData.accessToken}
                                    onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                                    required
                                    className="bg-zinc-900/50 border-white/10 text-white placeholder:text-gray-500 font-mono"
                                />
                                <p className="text-xs text-gray-500">
                                    Recomendamos usar um System User Token com permissões `whatsapp_business_messaging`.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t border-white/5 pt-6">
                        <Button type="button" variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white hover:bg-white/5">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary-600 hover:bg-primary-500">
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Conectando...
                                </>
                            ) : (
                                'Conectar Cliente'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}


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
        accessToken: ''
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
                accessToken: formData.accessToken
            });

            toast.success('Número conectado com sucesso!');
            await refreshInstances();
            switchInstance(newInstance.id);
            router.push('/settings/instances');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao conectar número. Verifique as credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="w-6 h-6 text-primary-500" />
                        Conectar Novo Número
                    </CardTitle>
                    <CardDescription>
                        Adicione um novo número de WhatsApp para gerenciar.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Instância (Identificador)</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Matriz, Suporte, Vendas"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneId">Phone Number ID</Label>
                            <Input
                                id="phoneId"
                                placeholder="ID do número no Meta for Developers"
                                value={formData.phoneNumberId}
                                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="wabaId">Business Account ID (Opcional)</Label>
                            <Input
                                id="wabaId"
                                placeholder="ID da conta empresarial WhatsApp"
                                value={formData.businessAccountId}
                                onChange={(e) => setFormData(prev => ({ ...prev, businessAccountId: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="token">Access Token (Permanente)</Label>
                            <Input
                                id="token"
                                type="password"
                                placeholder="Token de acesso do sistema (User/System User)"
                                value={formData.accessToken}
                                onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Recomendamos usar um System User Token com permissões `whatsapp_business_messaging`.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Conectando...
                                </>
                            ) : (
                                'Conectar Número'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

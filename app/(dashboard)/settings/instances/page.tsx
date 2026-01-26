'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { instanceService } from '@/services/instanceService';
import { useInstance } from '@/components/providers/InstanceProvider';
import { Instance } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Smartphone,
    PlusCircle,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Settings as SettingsIcon
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function InstancesManagementPage() {
    const router = useRouter();
    const { instances, currentInstance, refreshInstances, switchInstance } = useInstance();
    const [isLoading, setIsLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<Instance | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadInstances();
    }, []);

    const loadInstances = async () => {
        setIsLoading(true);
        try {
            await refreshInstances();
        } catch (error) {
            console.error('Failed to load instances:', error);
            toast.error('Erro ao carregar instâncias');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            await instanceService.delete(deleteTarget.id);
            toast.success('Número removido com sucesso');
            await refreshInstances();

            // If deleted instance was the current one, switch to another or redirect
            if (currentInstance?.id === deleteTarget.id && instances.length > 1) {
                const nextInstance = instances.find(i => i.id !== deleteTarget.id);
                if (nextInstance) {
                    switchInstance(nextInstance.id);
                }
            }
        } catch (error) {
            console.error('Failed to delete instance:', error);
            toast.error('Erro ao remover número');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    const getStatusBadge = (status: Instance['status']) => {
        const statusConfig = {
            active: { label: 'Ativo', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
            disconnected: { label: 'Desconectado', icon: XCircle, className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
            error: { label: 'Erro', icon: AlertCircle, className: 'bg-red-500/10 text-red-400 border-red-500/20' },
        };

        const config = statusConfig[status];
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={`${config.className} flex items-center gap-1 w-fit`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Carregando instâncias...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        Gerenciar Números
                    </h1>
                    <p className="text-gray-400">
                        Gerencie todos os números de WhatsApp conectados ao sistema
                    </p>
                </div>
                <Button onClick={() => router.push('/settings/connect')} className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Adicionar Número
                </Button>
            </div>

            {/* Instances Grid */}
            {instances.length === 0 ? (
                <Card className="glass-panel border-white/5">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Smartphone className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhum número conectado</h3>
                        <p className="text-gray-400 mb-6 text-center max-w-md">
                            Conecte seu primeiro número de WhatsApp para começar a enviar campanhas e gerenciar contatos.
                        </p>
                        <Button onClick={() => router.push('/settings/connect')} className="gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Conectar Primeiro Número
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {instances.map((instance) => (
                        <Card
                            key={instance.id}
                            className={`glass-panel border-white/5 hover:border-white/10 transition-all ${currentInstance?.id === instance.id ? 'ring-2 ring-primary-500/50' : ''
                                }`}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary-500/20 border border-primary-500/20">
                                            <Smartphone className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg text-white">{instance.name}</CardTitle>
                                            {currentInstance?.id === instance.id && (
                                                <Badge variant="outline" className="mt-1 bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                    Em Uso
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Status */}
                                <div>
                                    {getStatusBadge(instance.status)}
                                </div>

                                {/* Info */}
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">Phone Number ID:</span>
                                        <p className="text-gray-300 font-mono text-xs truncate">
                                            {instance.phoneNumberId}
                                        </p>
                                    </div>
                                    {instance.businessAccountId && (
                                        <div>
                                            <span className="text-gray-500">Business Account:</span>
                                            <p className="text-gray-300 font-mono text-xs truncate">
                                                {instance.businessAccountId}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500">Criado em:</span>
                                        <p className="text-gray-300 text-xs">
                                            {new Date(instance.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t border-white/5">
                                    {currentInstance?.id !== instance.id && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => {
                                                switchInstance(instance.id);
                                                toast.success(`Alternado para ${instance.name}`);
                                            }}
                                        >
                                            <SettingsIcon className="w-3 h-3 mr-1" />
                                            Usar
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
                                        onClick={() => setDeleteTarget(instance)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover Número</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{deleteTarget?.name}</strong>?
                            <br />
                            <br />
                            Esta ação não pode ser desfeita. Todas as campanhas, contatos e mensagens associadas a este número serão removidas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Removendo...' : 'Remover'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

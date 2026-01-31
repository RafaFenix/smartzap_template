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
    Settings as SettingsIcon,
    Users,
    Palette
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

export function InstancesList() {
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
            toast.success('Cliente removido com sucesso');
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
            toast.error('Erro ao remover cliente');
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

    const getColorClass = (color?: string) => {
        switch (color) {
            case 'red': return 'bg-red-500/20 text-red-400 border-red-500/20';
            case 'orange': return 'bg-orange-500/20 text-orange-400 border-orange-500/20';
            case 'amber': return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
            case 'green': return 'bg-green-500/20 text-green-400 border-green-500/20';
            case 'emerald': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
            case 'teal': return 'bg-teal-500/20 text-teal-400 border-teal-500/20';
            case 'cyan': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20';
            case 'blue': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            case 'indigo': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20';
            case 'violet': return 'bg-violet-500/20 text-violet-400 border-violet-500/20';
            case 'purple': return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
            case 'fuchsia': return 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/20';
            case 'pink': return 'bg-pink-500/20 text-pink-400 border-pink-500/20';
            case 'rose': return 'bg-rose-500/20 text-rose-400 border-rose-500/20';
            default: return 'bg-zinc-700 text-gray-400 border-zinc-600'; // zinc/default
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Carregando seus clientes...</p>
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
                        Meus Clientes
                    </h1>
                    <p className="text-gray-400">
                        Gerencie as contas de WhatsApp dos seus clientes
                    </p>
                </div>
                <Button onClick={() => router.push('/settings/connect')} className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Adicionar Cliente
                </Button>
            </div>

            {/* Instances Grid */}
            {instances.length === 0 ? (
                <Card className="glass-panel border-white/5">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Users className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhum cliente conectado</h3>
                        <p className="text-gray-400 mb-6 text-center max-w-md">
                            Adicione o primeiro número de WhatsApp do seu cliente para começar a gerenciar.
                        </p>
                        <Button onClick={() => router.push('/settings/connect')} className="gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Adicionar Cliente
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
                                    <div className="flex items-center gap-3 w-full">
                                        <div className={`p-2.5 rounded-xl border ${getColorClass(instance.color)}`}>
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg text-white truncate pr-2" title={instance.name}>
                                                    {instance.clientName || instance.name}
                                                </CardTitle>
                                                {currentInstance?.id === instance.id && (
                                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 shrink-0">
                                                        Selecionado
                                                    </Badge>
                                                )}
                                            </div>
                                            {instance.clientName && instance.name !== instance.clientName && (
                                                <p className="text-xs text-gray-400 truncate mt-0.5">{instance.name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                {instance.description && (
                                    <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                                        {instance.description}
                                    </p>
                                )}

                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    {getStatusBadge(instance.status)}
                                    <span className="text-xs text-gray-500">
                                        {new Date(instance.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>


                                {/* Info */}
                                <div className="space-y-2 text-sm pt-2 border-t border-white/5">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-xs">Phone ID:</span>
                                        <span className="text-gray-300 font-mono text-xs truncate max-w-[120px]" title={instance.phoneNumberId}>
                                            {instance.phoneNumberId}
                                        </span>
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
                                                toast.success(`Gerenciando: ${instance.clientName || instance.name}`);
                                            }}
                                        >
                                            <SettingsIcon className="w-3 h-3 mr-1" />
                                            Gerenciar
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20 px-3"
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
                        <AlertDialogTitle>Remover Cliente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{deleteTarget?.clientName || deleteTarget?.name}</strong>?
                            <br />
                            <br />
                            Esta ação não pode ser desfeita. Todas as campanhas, contatos e mensagens deste cliente serão apagadas permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Removendo...' : 'Remover Cliente'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

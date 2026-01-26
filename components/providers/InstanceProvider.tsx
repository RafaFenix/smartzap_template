
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Instance } from '@/types';
import { instanceService } from '@/services/instanceService';
import { toast } from 'sonner';

interface InstanceContextType {
    currentInstance: Instance | null;
    instances: Instance[];
    isLoading: boolean;
    switchInstance: (instanceId: string) => void;
    refreshInstances: () => Promise<void>;
}

const InstanceContext = createContext<InstanceContextType | undefined>(undefined);

export function InstanceProvider({ children }: { children: React.ReactNode }) {
    const [currentInstance, setCurrentInstance] = useState<Instance | null>(null);
    const [instances, setInstances] = useState<Instance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchInstances = async () => {
        try {
            const data = await instanceService.list();
            setInstances(data);

            // Auto-select first instance if none selected
            if (data.length > 0 && !currentInstance) {
                // Try to get from localStorage
                const savedId = localStorage.getItem('smartzap_instance_id');
                const found = data.find(i => i.id === savedId) || data[0];
                setCurrentInstance(found);
            } else if (data.length === 0) {
                setCurrentInstance(null);
            }
        } catch (error) {
            console.error('Failed to fetch instances:', error);
            toast.error('Erro ao carregar instâncias');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInstances();
    }, []);

    const switchInstance = (instanceId: string) => {
        const found = instances.find(i => i.id === instanceId);
        if (found) {
            setCurrentInstance(found);
            localStorage.setItem('smartzap_instance_id', found.id);
            toast.success(`Alternado para ${found.name}`);
            // Ideally we should also invalidate queries (React Query) here
            // queryClient.invalidateQueries()
            window.location.reload(); // Simple brute-force reload to ensure all data refreshes
        }
    };

    const refreshInstances = async () => {
        await fetchInstances();
    };

    return (
        <InstanceContext.Provider value={{
            currentInstance,
            instances,
            isLoading,
            switchInstance,
            refreshInstances
        }}>
            {children}
        </InstanceContext.Provider>
    );
}

export function useInstance() {
    const context = useContext(InstanceContext);
    if (context === undefined) {
        throw new Error('useInstance must be used within an InstanceProvider');
    }
    return context;
}

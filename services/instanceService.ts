
import { Instance } from '../types';

export const instanceService = {
    /**
     * List all configured instances
     */
    list: async (): Promise<Instance[]> => {
        const response = await fetch('/api/instances');
        if (!response.ok) {
            console.error('Failed to fetch instances');
            return [];
        }
        return response.json();
    },

    /**
     * Get a specific instance by ID
     */
    get: async (id: string): Promise<Instance | undefined> => {
        const response = await fetch(`/api/instances/${id}`);
        if (!response.ok) {
            return undefined;
        }
        return response.json();
    },

    /**
     * Create a new instance (Connect new WhatsApp number)
     */
    create: async (data: { name: string; phoneNumberId: string; accessToken: string; businessAccountId?: string }): Promise<Instance> => {
        const response = await fetch('/api/instances', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create instance');
        }

        return response.json();
    },

    /**
     * Update an instance
     */
    update: async (id: string, data: Partial<Instance>): Promise<Instance> => {
        const response = await fetch(`/api/instances/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update instance');
        }

        return response.json();
    },

    /**
     * Delete an instance
     */
    delete: async (id: string): Promise<void> => {
        const response = await fetch(`/api/instances/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete instance');
        }
    },

    /**
     * Get server-side health/status of the instance connection
     */
    checkConnection: async (id: string): Promise<{ status: 'active' | 'disconnected' | 'error'; details?: any }> => {
        const response = await fetch(`/api/instances/${id}/health`);
        if (!response.ok) {
            return { status: 'error' };
        }
        return response.json();
    }
};

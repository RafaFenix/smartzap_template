import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { useRealtimeQuery } from './useRealtimeQuery';
import { useInstance } from '../components/providers/InstanceProvider';

// Polling interval: 30 seconds (fallback when Realtime unavailable)
const POLLING_INTERVAL = 30000;

export const useDashboardController = (initialData?: { stats: any, recentCampaigns: any[] }) => {
  const { currentInstance } = useInstance();
  const instanceId = currentInstance?.id;

  // Stats with Realtime updates
  const statsQuery = useRealtimeQuery({
    queryKey: ['dashboardStats', instanceId],
    queryFn: () => dashboardService.getStats(instanceId),
    initialData: initialData?.stats,
    refetchInterval: POLLING_INTERVAL,
    staleTime: 15000,
    gcTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: 'always',
    // Realtime configuration
    table: 'campaigns',
    events: ['INSERT', 'UPDATE'],
    debounceMs: 500,
  });

  // Recent campaigns with Realtime updates
  const recentCampaignsQuery = useRealtimeQuery({
    queryKey: ['recentCampaigns', instanceId],
    queryFn: () => dashboardService.getRecentCampaigns(instanceId),
    initialData: initialData?.recentCampaigns,
    refetchInterval: POLLING_INTERVAL,
    staleTime: 20000,
    gcTime: 120000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Realtime configuration
    table: 'campaigns',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    debounceMs: 500,
  });

  return {
    stats: statsQuery.data,
    recentCampaigns: recentCampaignsQuery.data,
    isLoading: (statsQuery.isLoading && !statsQuery.data) || !instanceId,
    isFetching: statsQuery.isFetching || recentCampaignsQuery.isFetching,
    isError: statsQuery.isError || recentCampaignsQuery.isError,
    refetch: () => {
      statsQuery.refetch();
      recentCampaignsQuery.refetch();
    }
  };
};


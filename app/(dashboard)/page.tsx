// import { getDashboardStatsServer } from '@/lib/data/dashboard'
import { DashboardView } from '@/components/features/dashboard/DashboardView'
import { DashboardClientWrapper } from './DashboardClientWrapper'

// Server Component
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // We disable server-side pre-fetching to ensure data isolation.
  // The client-side hook will fetch data based on the selected instance.
  const initialData = {
    stats: {
      sent24h: '0',
      deliveryRate: '0%',
      activeCampaigns: '0',
      failedMessages: '0',
      chartData: []
    },
    recentCampaigns: []
  }

  return (
    <DashboardClientWrapper initialData={initialData} />
  )
}

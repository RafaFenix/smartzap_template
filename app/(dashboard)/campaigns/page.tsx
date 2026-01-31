// import { getCampaignsServer } from '@/lib/data/campaigns'
import { CampaignsClientWrapper } from './CampaignsClientWrapper'

// Server Component
export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
  // We disable server-side pre-fetching to ensure data isolation.
  // The client-side hook useCampaignsController will fetch data based on the selected instance.
  const initialData: any[] = []

  return (
    <CampaignsClientWrapper initialData={initialData} />
  )
}

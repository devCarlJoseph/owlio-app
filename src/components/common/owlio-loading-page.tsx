import { OwlioPageState } from '@/components/common/owlio-page-state'

/** Universal full-page loader. Keep in-page data skeletons inside their layouts. */
export function OwlioLoadingPage({
  title = 'Getting your space ready',
  description = 'Just a moment while Owlio gets everything ready for you.',
}: { title?: string; description?: string }) {
  return <OwlioPageState tone="loading" title={title} description={description} />
}

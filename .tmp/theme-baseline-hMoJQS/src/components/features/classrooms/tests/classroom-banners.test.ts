import { describe, expect, it } from 'vitest'
import { getClassroomBannerUrl } from '../utils/classroom-covers'

const packagedBanners = import.meta.glob('/public/classroom-banners/*.png', { eager: true, query: '?url', import: 'default' })

describe('automatic classroom banners', () => {
  it('keeps a classroom’s banner stable regardless of other classrooms being opened', () => {
    const original = getClassroomBannerUrl('classroom-permanent-id')
    getClassroomBannerUrl('another-classroom')
    getClassroomBannerUrl('newly-created-classroom')
    expect(getClassroomBannerUrl('classroom-permanent-id')).toBe(original)
  })

  it('assigns varied, bundled artwork to new classroom IDs without missing assets', () => {
    const banners = new Set(Array.from({ length: 30 }, (_, index) => getClassroomBannerUrl(`new-class-${index}`)))
    expect(banners.size).toBe(3)
    for (const banner of banners) {
      expect(banner.startsWith('/classroom-banners/')).toBe(true)
      expect(Object.keys(packagedBanners)).toContain(`/public${banner}`)
    }
  })
})

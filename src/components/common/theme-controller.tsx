import { useEffect } from 'react'
import { watchTheme } from '@/lib/theme'

export function ThemeController() {
  useEffect(watchTheme, [])
  return null
}

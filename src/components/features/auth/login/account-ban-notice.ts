import axios from 'axios'

export type AccountBanNotice =
  | { kind: 'temporary'; expiresAt: string }
  | { kind: 'permanent' | 'unspecified' }

export function readAccountBanNotice(error: unknown): AccountBanNotice | null {
  if (!axios.isAxiosError<{ code?: unknown; restriction?: unknown }>(error)) return null
  const response = error.response
  if (response?.status !== 403 || response.data?.code !== 'ACCOUNT_BANNED') return null
  const restriction = response.data.restriction
  if (typeof restriction === 'object' && restriction !== null && 'kind' in restriction) {
    if (restriction.kind === 'permanent') return { kind: 'permanent' }
    if (
      restriction.kind === 'temporary' &&
      'expiresAt' in restriction &&
      typeof restriction.expiresAt === 'string' &&
      Number.isFinite(Date.parse(restriction.expiresAt))
    ) {
      return { kind: 'temporary', expiresAt: restriction.expiresAt }
    }
  }
  return { kind: 'unspecified' }
}

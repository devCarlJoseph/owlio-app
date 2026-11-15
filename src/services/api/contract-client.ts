import { z } from 'zod'
import api from '@/lib/axios'
import { mutateApiWithCsrf } from './auth.service'
import { operations, type Operation, type OperationBody, type OperationData, type OperationParams } from './generated-contract'

type Query = Record<string, string | number | boolean | undefined>
type Options<K extends Operation> = {
  params?: OperationParams<K>
  body?: OperationBody<K>
  query?: Query
  signal?: AbortSignal
}
type CollectionOperation = { [K in Operation]: K extends `GET ${string}`
  ? 'nextCursor' extends keyof OperationData<K>
    ? OperationData<K> extends { items: unknown[]; nextCursor?: string | null } ? K : never
    : never
  : never }[Operation]

/** The API remains the only authority for identity, permissions and persisted records. */
export async function requestOperation<K extends Operation>(operation: K, options: Options<K> = {}): Promise<OperationData<K>> {
  const contract = operations[operation]
  const [method, template] = operation.split(' ')
  const params = contract.params.parse(options.params ?? {}) as Record<string, unknown>
  const route = template.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = params[key]
    if (typeof value !== 'string' || !value) throw new Error('Missing resource identifier.')
    return encodeURIComponent(value)
  })
  if (options.signal?.aborted) throw new DOMException('Request aborted', 'AbortError')
  let data: unknown
  if (method === 'GET') {
    const response = await api.get<unknown>(route, { params: options.query, signal: options.signal })
    data = z.object({ status: z.literal('success'), data: z.unknown() }).parse(response.data).data
  } else {
    const body = contract.body.parse(options.body ?? {})
    data = await mutateApiWithCsrf(method as 'POST' | 'PUT' | 'PATCH' | 'DELETE', route, body)
  }
  return contract.response.parse(data) as OperationData<K>
}

/** UUID collections only. Calendar and gradebook cursors use dedicated clients. */
export async function collectOperation<K extends CollectionOperation>(operation: K, options: Options<K> = {}): Promise<OperationData<K> extends { items: (infer T)[] } ? T[] : never> {
  const result: unknown[] = []
  const seen = new Set<string>()
  let cursor: string | null = null
  do {
    const page = await requestOperation(operation, { ...options, query: { ...options.query, limit: 50, ...(cursor ? { cursor } : {}) } })
    const parsed = z.object({ items: z.array(z.unknown()), nextCursor: z.string().nullable().optional() }).parse(page)
    result.push(...parsed.items)
    cursor = parsed.nextCursor ?? null
    if (cursor && seen.has(cursor)) throw new Error('The API returned a repeated page cursor.')
    if (cursor) seen.add(cursor)
  } while (cursor)
  return result as OperationData<K> extends { items: (infer T)[] } ? T[] : never
}

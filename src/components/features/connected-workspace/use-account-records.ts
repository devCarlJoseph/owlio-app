import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiErrorMessage } from '@/services/api/api-error'

export function useAccountRecords<T>(load: (signal?: AbortSignal) => Promise<T[]>) {
  const [records, setRecords] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const generation = useRef(0)
  useEffect(() => {
    const controller = new AbortController()
    const request = ++generation.current
    load(controller.signal).then(items => {
      if (!controller.signal.aborted && request === generation.current) setRecords(items)
    }).catch(cause => {
      if (!controller.signal.aborted && request === generation.current) {
        setRecords([])
        setError(getApiErrorMessage(cause, 'Could not load your records.'))
      }
    }).finally(() => {
      if (!controller.signal.aborted && request === generation.current) setLoading(false)
    })
    return () => controller.abort()
  }, [load, revision])
  const reload = useCallback(() => {
    setRecords([])
    setLoading(true)
    setError('')
    setRevision(value => value + 1)
  }, [])
  return { records, setRecords, loading, error, reload }
}

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getGoogleLinkStatus, startGoogleLink } from '@/services/api/auth.service'
import type { GoogleLinkStatus } from '@/services/api/api.types'

export function AccountSecurityView() {
  const [googleStatus, setGoogleStatus] = useState<GoogleLinkStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void getGoogleLinkStatus()
      .then((status) => {
        if (active) setGoogleStatus(status)
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError, 'Could not load connected sign-in methods.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const linkGoogle = async () => {
    setLinking(true)
    setError(null)
    try {
      const { authorizationUrl } = await startGoogleLink()
      window.location.assign(authorizationUrl)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not start Google account linking.'))
      setLinking(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Account security</h2>
        <p className="mt-1 text-sm text-slate-600">Manage how you sign in to Owlio.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Google sign-in</CardTitle>
          <CardDescription>
            Connect Google to sign in without entering your Owlio password. Google is only linked after you authorize it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {loading ? (
            <p role="status" className="text-sm text-slate-500">Checking linked accounts…</p>
          ) : googleStatus?.linked ? (
            <p role="status" className="text-sm text-slate-700">
              Google is connected.
            </p>
          ) : (
            <Button type="button" disabled={linking} onClick={() => void linkGoogle()}>
              {linking ? 'Connecting…' : 'Connect Google'}
            </Button>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

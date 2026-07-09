// Target path in repo: src/app/login/page.tsx
//
// Supports both email/password and magic link, per your call. Built with
// the shadcn primitives already in src/components/ui/* — no new UI library.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<{ kind: 'idle' | 'error' | 'sent'; message?: string }>({
    kind: 'idle',
  })
  const [loading, setLoading] = useState(false)

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus({ kind: 'idle' })

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (error) {
      setStatus({ kind: 'error', message: error.message })
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus({ kind: 'idle' })

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (error) {
      setStatus({ kind: 'error', message: error.message })
      return
    }
    setStatus({ kind: 'sent', message: `Check ${email} for your sign-in link.` })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm p-8">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded bg-[#E8640A] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-slate-900">ForgeStack</p>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-none">Enterprise</p>
          </div>
        </div>

        <Tabs defaultValue="password">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="password" className="flex-1">Password</TabsTrigger>
            <TabsTrigger value="magic-link" className="flex-1">Magic link</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magic-link">
            <form onSubmit={handleMagicLink} className="space-y-4">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send magic link'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {status.kind === 'error' && (
          <p className="mt-4 text-sm text-red-600">{status.message}</p>
        )}
        {status.kind === 'sent' && (
          <p className="mt-4 text-sm text-green-600">{status.message}</p>
        )}
      </Card>
    </div>
  )
}

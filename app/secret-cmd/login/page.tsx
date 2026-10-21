'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Alert, Btn } from '@/components/admin/AdminUI'

/**
 * Halaman login admin — SENGAJA di luar route group (protected), bukan
 * di dalamnya, supaya tidak ikut kena guard yang mengharuskan login
 * (kalau ikut, akan jadi redirect loop tak berujung: belum login ->
 * redirect ke sini -> halaman ini juga butuh login -> redirect lagi).
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLoginSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    setIsLoggingIn(true)
    setErrorMessage(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setErrorMessage('Email atau password salah.')
      setIsLoggingIn(false)
      return
    }

    router.push('/secret-cmd')
    // router.refresh() memaksa server components (yang cek auth lewat
    // getUser()) re-evaluate status login — tanpa ini, navigasi client-
    // side bisa saja masih pakai cache lama yang menganggap belum login.
    router.refresh()
  }

  return (
    <div className="adm-root flex min-h-screen items-center justify-center px-4">
      <main className="adm-content w-full max-w-sm">
        <form
          onSubmit={handleLoginSubmit}
          aria-labelledby="login-title"
          className="adm-panel space-y-5 p-7 sm:p-8"
        >
          <div>
            <p className="adm-crumb mb-2">[ AUTH_GATE ]</p>
            <h1 id="login-title" className="adm-h1 adm-caret">
              Admin Access
            </h1>
            <p className="adm-mono mt-3 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-adm-amber">
              <span
                aria-hidden="true"
                className="adm-dot"
                data-pulse="true"
                style={{ ['--tag' as string]: 'var(--adm-amber)' }}
              />
              Restricted · identifikasi diperlukan
            </p>
          </div>

          {errorMessage && <Alert>{errorMessage}</Alert>}

          <div>
            <label htmlFor="login-email" className="adm-label">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(changeEvent) => setEmail(changeEvent.target.value)}
              required
              className="adm-input"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="adm-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(changeEvent) => setPassword(changeEvent.target.value)}
              required
              className="adm-input"
            />
          </div>
          <Btn type="submit" disabled={isLoggingIn} className="w-full">
            {isLoggingIn ? 'MEMPROSES...' : 'LOGIN'}
          </Btn>
        </form>
      </main>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        onSubmit={handleLoginSubmit}
        className="w-full max-w-sm p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
      >
        <h1 className="text-xl font-semibold text-white mb-6">
          Admin Access
        </h1>

        {errorMessage && (
          <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(changeEvent) => setEmail(changeEvent.target.value)}
          required
          className="w-full mb-3 px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(changeEvent) => setPassword(changeEvent.target.value)}
          required
          className="w-full mb-4 px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
        >
          {isLoggingIn ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

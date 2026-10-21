'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Trash2 } from 'lucide-react'

/**
 * Komponen UI bersama untuk Admin Console (tema Sci-Fi / Hacker Console).
 * Semua gaya ada di app/secret-cmd/admin.css (kelas .adm-*) dan token
 * warna di tailwind.config.ts (text-adm-*, border-adm-*). Tanpa library
 * UI eksternal.
 */

/* ---------- PageHeader ---------- */

interface PageHeaderProps {
  /** Kode modul gaya terminal, mis. "EDIT_DATA" → tampil "[ EDIT_DATA ]". */
  code: string
  title: string
  description?: string
  /** Slot kanan (biasanya tombol aksi utama). */
  actions?: React.ReactNode
}

export function PageHeader({ code, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="adm-crumb mb-2">[ {code} ]</p>
        <h1 className="adm-h1 adm-caret">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-adm-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </header>
  )
}

/* ---------- Panel ---------- */

interface PanelProps {
  /** Judul kecil bergaya terminal di atas panel. */
  title?: string
  children: React.ReactNode
  className?: string
}

export function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <section className={`adm-panel p-5 sm:p-6 ${className}`}>
      {title && (
        <h2 className="adm-panel-title mb-5">
          <span aria-hidden="true">▸</span>[ {title} ]
        </h2>
      )}
      {children}
    </section>
  )
}

/* ---------- Button ---------- */

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'success' | 'violet' | 'amber'

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'md' | 'sm'
  /** Ikon di kiri teks. */
  icon?: React.ReactNode
  /** Bungkus label dengan [ ] ala terminal. Default true. */
  brackets?: boolean
}

export function Btn({
  variant = 'primary',
  size = 'md',
  icon,
  brackets = true,
  className = '',
  children,
  type = 'button',
  ...rest
}: BtnProps) {
  return (
    <button
      type={type}
      data-variant={variant === 'primary' ? undefined : variant}
      data-size={size === 'md' ? undefined : size}
      className={`adm-btn ${className}`}
      {...rest}
    >
      {icon}
      <span>
        {brackets && <span aria-hidden="true">[ </span>}
        {children}
        {brackets && <span aria-hidden="true"> ]</span>}
      </span>
    </button>
  )
}

/* ---------- Tombol ikon (aksi di kartu) ---------- */

interface IconBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Label aksesibel — WAJIB (tombol ini tidak punya teks terlihat). */
  label: string
  tone?: 'default' | 'danger'
}

export function IconBtn({ label, tone = 'default', children, className = '', ...rest }: IconBtnProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-tone={tone === 'danger' ? 'danger' : undefined}
      className={`adm-iconbtn ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ---------- Hapus dengan konfirmasi dua langkah ---------- */

interface ConfirmDeleteButtonProps {
  /** Nama item untuk label aksesibel, mis. judul proyek. */
  itemName: string
  onConfirm: () => void | Promise<void>
}

/**
 * Pengganti window.confirm(): klik pertama "mempersenjatai" tombol
 * (berubah merah + teks KONFIRMASI?), klik kedua dalam 4 detik benar-benar
 * menghapus. Tidak ada dialog bawaan browser (yang tidak bisa ditata dan
 * sering diblokir di mobile), dan tetap aman dari salah-klik. Reset
 * otomatis kalau timeout atau fokus pindah.
 */
export function ConfirmDeleteButton({ itemName, onConfirm }: ConfirmDeleteButtonProps) {
  const [isArmed, setIsArmed] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  function disarm() {
    setIsArmed(false)
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function handleClick() {
    if (!isArmed) {
      setIsArmed(true)
      timerRef.current = window.setTimeout(disarm, 4000)
      return
    }
    disarm()
    void onConfirm()
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onBlur={disarm}
        data-armed={isArmed ? 'true' : undefined}
        data-tone="danger"
        aria-label={
          isArmed ? `Konfirmasi hapus ${itemName}` : `Hapus ${itemName}`
        }
        title={isArmed ? 'Klik lagi untuk menghapus' : `Hapus ${itemName}`}
        className="adm-iconbtn"
      >
        <Trash2 size={15} aria-hidden="true" />
        {isArmed && <span>Yakin?</span>}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {isArmed ? `Klik sekali lagi untuk menghapus ${itemName}` : ''}
      </span>
    </>
  )
}

/* ---------- Alert ---------- */

interface AlertProps {
  tone?: 'error' | 'success'
  children: React.ReactNode
}

export function Alert({ tone = 'error', children }: AlertProps) {
  const isError = tone === 'error'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      data-tone={isError ? undefined : 'success'}
      className="adm-alert"
    >
      <span className="adm-alert-code">
        {isError ? (
          <AlertTriangle size={14} aria-hidden="true" className="inline -mt-0.5" />
        ) : (
          <CheckCircle2 size={14} aria-hidden="true" className="inline -mt-0.5" />
        )}{' '}
        {isError ? 'ERR' : 'OK'}
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  )
}

/* ---------- Tag status ---------- */

interface StatusTagProps {
  tone?: 'cyan' | 'green' | 'amber' | 'red' | 'violet' | 'muted'
  /** Titik status di kiri. */
  dot?: boolean
  pulse?: boolean
  children: React.ReactNode
}

export function StatusTag({ tone = 'cyan', dot = false, pulse = false, children }: StatusTagProps) {
  return (
    <span data-tone={tone === 'cyan' ? undefined : tone} className="adm-tag">
      {dot && (
        <span
          aria-hidden="true"
          className="adm-dot"
          data-pulse={pulse ? 'true' : undefined}
        />
      )}
      {children}
    </span>
  )
}

/* ---------- Loading & kosong ---------- */

export function LoadingState({ label = 'MEMUAT_DATA' }: { label?: string }) {
  return (
    <p className="adm-loading" role="status">
      <Loader2 size={14} aria-hidden="true" className="mr-2 inline animate-spin" />
      <span>[ {label}... ]</span>
    </p>
  )
}

export function EmptyState({ code = 'NO_DATA', children }: { code?: string; children: React.ReactNode }) {
  return (
    <div className="adm-panel flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="adm-crumb !text-adm-dim">[ {code} ]</p>
      <p className="text-sm text-adm-muted">{children}</p>
    </div>
  )
}

/* ---------- Grid kartu ---------- */

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</ul>
}

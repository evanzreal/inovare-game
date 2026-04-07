'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const VENDEDORAS = [
  'Andressa', 'Luana', 'Giovana', 'Beatriz',
  'Vitoria', 'Tamara', 'Adrielle', 'Lais'
]

const EMAIL_MAP: Record<string, string> = {
  Andressa: 'andressa@inovareseguros.com.br',
  Luana:    'luana@inovareseguros.com.br',
  Giovana:  'giovana@inovareseguros.com.br',
  Beatriz:  'beatriz@inovareseguros.com.br',
  Vitoria:  'vitoria@inovareseguros.com.br',
  Tamara:   'tamara@inovareseguros.com.br',
  Adrielle: 'adrielle@inovareseguros.com.br',
  Lais:     'lais@inovareseguros.com.br',
}

export default function LoginPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) { setError('Selecione seu nome'); return }
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: EMAIL_MAP[selected],
      password,
    })

    if (authError) {
      setError('Senha incorreta. Tente novamente.')
      setLoading(false)
      return
    }

    // Small delay to let Supabase finish writing session to localStorage
    await new Promise(r => setTimeout(r, 300))
    router.push('/perfil')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}>

      {/* Logo / título */}
      <div className="mb-10 text-center">
        <div className="text-4xl font-black tracking-widest mb-1"
          style={{ color: 'var(--accent2)', letterSpacing: '0.15em' }}>
          VENDAS.EXE
        </div>
        <div className="text-xs tracking-widest uppercase"
          style={{ color: 'var(--muted)' }}>
          Sistema de Gamificação · Inovare
        </div>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
        {/* Seleção de vendedora */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--muted)' }}>
            Quem é você?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {VENDEDORAS.map(nome => (
              <button
                key={nome}
                type="button"
                onClick={() => setSelected(nome)}
                className="py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-150"
                style={{
                  background: selected === nome ? 'var(--accent)' : 'var(--surface)',
                  border: `1px solid ${selected === nome ? 'var(--accent2)' : 'var(--border)'}`,
                  color: selected === nome ? '#fff' : 'var(--muted)',
                  boxShadow: selected === nome ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                }}
              >
                {nome}
              </button>
            ))}
          </div>
        </div>

        {/* Senha */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--muted)' }}>
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full py-3 px-4 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
        </div>

        {error && (
          <div className="text-sm text-center py-2 px-4 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selected || !password}
          className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-150 disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            color: '#fff',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)',
          }}
        >
          {loading ? 'Entrando...' : 'Entrar no Jogo →'}
        </button>
      </form>
    </div>
  )
}

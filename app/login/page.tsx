'use client'

import { useState, useEffect } from 'react'
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

// Partículas flutuantes decorativas
function Particles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${4 + (i % 4) * 3}px`,
            height: `${4 + (i % 4) * 3}px`,
            left: `${8 + i * 8}%`,
            top: `${10 + (i * 17) % 80}%`,
            background: i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#06b6d4' : '#eab308',
            animation: `floatParticle ${4 + i % 4}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.15; }
          50% { transform: translateY(-18px) scale(1.2); opacity: 0.35; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes glitch {
          0%, 94%, 100% { transform: translate(0); }
          95% { transform: translate(-2px, 1px); }
          97% { transform: translate(2px, -1px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(168,85,247,0.4); box-shadow: 0 0 12px rgba(168,85,247,0.2); }
          50% { border-color: rgba(168,85,247,0.9); box-shadow: 0 0 24px rgba(168,85,247,0.5); }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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

    await new Promise(r => setTimeout(r, 300))
    router.push('/perfil')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a0f 60%)' }}>

      <Particles />

      {/* Scanline sutil */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

      {/* Glow central no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)' }} />

      <div className={`relative z-10 w-full max-w-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Trophy + título */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4" style={{ animation: 'floatParticle 3s ease-in-out infinite', display: 'inline-block' }}>
            🏆
          </div>

          {/* VENDAS.EXE com efeito glitch */}
          <div className="relative mb-2">
            <h1
              className="text-5xl font-black tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 40%, #06b6d4 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 3s linear infinite, glitch 6s ease-in-out infinite',
                letterSpacing: '0.12em',
                fontFamily: 'system-ui',
              }}>
              VENDAS
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5))' }} />
              <span className="text-sm font-black tracking-[0.3em] px-2"
                style={{ color: '#a855f7', fontFamily: 'monospace' }}>
                .EXE
              </span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(168,85,247,0.5), transparent)' }} />
            </div>
          </div>

          <div className="text-xs tracking-[0.25em] uppercase mt-3"
            style={{ color: 'rgba(148,163,184,0.6)', fontFamily: 'monospace' }}>
            ▸ ARENA DE VENDAS · INOVARE ◂
          </div>

          {/* Badges decorativos */}
          <div className="flex justify-center gap-3 mt-4">
            {['⚡ LIVE', '🎮 SEASON 1', '🔥 ATIVO'].map(b => (
              <span key={b} className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7' }}>
                {b}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">

          {/* Seleção de jogador */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(148,163,184,0.7)', fontFamily: 'monospace' }}>
              <span style={{ color: '#a855f7' }}>▸</span>
              SELECIONE SEU PERSONAGEM
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VENDEDORAS.map(nome => (
                <button
                  key={nome}
                  type="button"
                  onClick={() => setSelected(nome)}
                  className="py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: selected === nome
                      ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(168,85,247,0.2))'
                      : 'rgba(18,18,26,0.8)',
                    border: `1px solid ${selected === nome ? '#a855f7' : 'rgba(42,42,58,0.8)'}`,
                    color: selected === nome ? '#fff' : 'rgba(148,163,184,0.7)',
                    boxShadow: selected === nome ? '0 0 20px rgba(124,58,237,0.35), inset 0 0 20px rgba(124,58,237,0.05)' : 'none',
                    transform: selected === nome ? 'scale(1.02)' : 'scale(1)',
                    animation: selected === nome ? 'borderPulse 2s ease-in-out infinite' : 'none',
                  }}>
                  {selected === nome && (
                    <span className="absolute top-1 right-2 text-xs" style={{ color: '#a855f7' }}>▸</span>
                  )}
                  {nome}
                </button>
              ))}
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(148,163,184,0.7)', fontFamily: 'monospace' }}>
              <span style={{ color: '#06b6d4' }}>▸</span>
              CÓDIGO DE ACESSO
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full py-3.5 px-4 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(18,18,26,0.8)',
                border: '1px solid rgba(42,42,58,0.8)',
                color: '#f1f5f9',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
              }}
              onFocus={e => {
                e.target.style.border = '1px solid rgba(168,85,247,0.6)'
                e.target.style.boxShadow = '0 0 16px rgba(124,58,237,0.2)'
              }}
              onBlur={e => {
                e.target.style.border = '1px solid rgba(42,42,58,0.8)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {error && (
            <div className="text-sm text-center py-2.5 px-4 rounded-xl font-mono"
              style={{
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.3)',
              }}>
              ⚠ {error}
            </div>
          )}

          {/* Botão entrar */}
          <button
            type="submit"
            disabled={loading || !selected || !password}
            className="w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase relative overflow-hidden transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? 'rgba(124,58,237,0.5)'
                : 'linear-gradient(135deg, #7c3aed, #a855f7, #06b6d4)',
              backgroundSize: '200% auto',
              color: '#fff',
              boxShadow: (!loading && selected && password)
                ? '0 0 30px rgba(124,58,237,0.5), 0 4px 20px rgba(0,0,0,0.3)'
                : 'none',
              animation: (!loading && selected && password) ? 'shimmer 2s linear infinite' : 'none',
              letterSpacing: '0.15em',
            }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span style={{ display: 'inline-block', animation: 'floatParticle 0.6s ease-in-out infinite' }}>◈</span>
                CARREGANDO...
              </span>
            ) : (
              '▶  ENTRAR NO JOGO'
            )}
          </button>
        </form>

        {/* Rodapé */}
        <div className="text-center mt-8 text-xs"
          style={{ color: 'rgba(148,163,184,0.3)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          INOVARE SEGUROS © 2026 · v1.0
        </div>
      </div>
    </div>
  )
}

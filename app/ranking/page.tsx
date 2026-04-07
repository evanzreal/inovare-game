'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  getRankingGeral, getSemanaAtiva, formatPontos, formatReal,
  type VendedoraComPontos,
} from '@/lib/game-data'
import Link from 'next/link'

type RankedVendedora = VendedoraComPontos & { rank: number }

const PODIUM = [
  { icon: '👑', color: '#eab308', bg: 'rgba(234,179,8,0.1)',  border: 'rgba(234,179,8,0.35)' },
  { icon: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.25)' },
  { icon: '🥉', color: '#c2763a', bg: 'rgba(194,118,58,0.08)', border: 'rgba(194,118,58,0.25)' },
]

function BottomNav({ active }: { active: 'perfil' | 'ranking' }) {
  const { push } = useRouter()
  async function logout() { await supabase.auth.signOut(); push('/login') }
  return (
    <div className="fixed bottom-0 left-0 right-0 flex border-t z-20"
      style={{
        background: 'rgba(12,12,20,0.95)',
        borderColor: 'rgba(42,42,58,0.8)',
        backdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
      <Link href="/perfil" className="flex-1 py-3 flex flex-col items-center gap-1">
        <span className="text-xl">⬜</span>
        <span className="text-xs font-bold" style={{ color: active === 'perfil' ? '#a855f7' : 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>PERFIL</span>
      </Link>
      <button className="flex-1 py-3 flex flex-col items-center gap-1">
        <span className="text-xl">🏆</span>
        <span className="text-xs font-bold" style={{ color: active === 'ranking' ? '#a855f7' : 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>RANKING</span>
      </button>
      <button onClick={logout} className="flex-1 py-3 flex flex-col items-center gap-1">
        <span className="text-xl">🚪</span>
        <span className="text-xs" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>SAIR</span>
      </button>
    </div>
  )
}

export default function RankingPage() {
  const router = useRouter()
  const [ranking, setRanking] = useState<RankedVendedora[]>([])
  const [meId, setMeId] = useState<string | null>(null)
  const [semana, setSemana] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: v } = await supabase.from('game_vendedoras').select('id').eq('auth_user_id', user.id).single()
      if (v) setMeId(v.id)
      const s = await getSemanaAtiva()
      setSemana(s)
      setRanking(await getRankingGeral(s))
      setLoading(false)
    }
    load()
  }, [router])

  const totalVendas = ranking.reduce((s, v) => s + v.real_vendas, 0)
  const metaTotal = ranking.reduce((s, v) => s + v.meta_vendas, 0)
  const pctColetivo = metaTotal > 0 ? Math.round((totalVendas / metaTotal) * 100) : 0
  const modoСаos = pctColetivo >= 150

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a0f 60%)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4" style={{ animation: 'float 2s ease-in-out infinite' }}>🏆</div>
        <div className="text-xs tracking-widest" style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
          ▸ CARREGANDO RANKING...
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  )

  return (
    <div className="min-h-dvh pb-20"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a0f 60%)' }}>

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto w-full max-w-lg">

        {/* Header */}
        <div className="px-4 sm:px-6 pt-5 pb-4">
          <div className="font-black tracking-widest text-sm"
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #a855f7 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontFamily: 'monospace',
            }}>
            VENDAS.EXE
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1" style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>
            🏆 RANKING
            <span className="text-sm ml-2 font-bold" style={{ color: 'rgba(148,163,184,0.4)' }}>
              · SEM {semana}
            </span>
          </div>
        </div>

        <div className="px-4 sm:px-6 flex flex-col gap-4">

          {/* Meta coletiva */}
          <div className="rounded-2xl p-4 sm:p-5"
            style={{
              background: modoСаos ? 'rgba(234,179,8,0.06)' : 'rgba(34,197,94,0.06)',
              border: `1px solid ${modoСаos ? 'rgba(234,179,8,0.35)' : 'rgba(34,197,94,0.3)'}`,
            }}>
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs font-black uppercase tracking-widest flex items-center gap-2"
                style={{ color: modoСаos ? '#eab308' : '#22c55e', fontFamily: 'monospace' }}>
                {modoСаos ? '🌪 MODO CAOS ATIVO!' : '🤝 META COLETIVA'}
              </div>
              <div className="text-sm font-black" style={{ color: modoСаos ? '#eab308' : '#22c55e', fontFamily: 'monospace' }}>
                {pctColetivo}%
              </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(42,42,58,0.8)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(pctColetivo, 100)}%`,
                  background: modoСаos
                    ? 'linear-gradient(90deg, #22c55e, #eab308, #f97316)'
                    : 'linear-gradient(90deg, #22c55e, #06b6d4)',
                }} />
            </div>
            <div className="text-xs mt-2" style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
              {totalVendas} VENDAS DE {metaTotal} · TIME INTEIRO
            </div>
          </div>

          {/* Pódio top 3 */}
          {ranking.length >= 3 && (
            <div className="grid grid-cols-3 gap-2">
              {ranking.slice(0, 3).map((v, i) => {
                const p = PODIUM[i]
                const isMe = v.id === meId
                return (
                  <div key={v.id} className="rounded-2xl p-3 sm:p-4 text-center relative overflow-hidden"
                    style={{
                      background: isMe ? 'rgba(124,58,237,0.15)' : p.bg,
                      border: `1px solid ${isMe ? 'rgba(168,85,247,0.6)' : p.border}`,
                      boxShadow: isMe ? '0 0 20px rgba(124,58,237,0.3)' : `0 0 12px ${p.color}22`,
                    }}>
                    <div className="text-2xl sm:text-3xl mb-1">{p.icon}</div>
                    <div className="text-xs font-black truncate mb-1"
                      style={{ color: isMe ? '#a855f7' : p.color, fontFamily: 'monospace' }}>
                      {v.nome.toUpperCase()}
                    </div>
                    <div className="text-sm sm:text-base font-black" style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>
                      {formatPontos(v.pontos_total)}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>PTS</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Lista completa */}
          <div className="flex flex-col gap-2">
            {ranking.map(v => {
              const isMe = v.id === meId
              const p = v.rank <= 3 ? PODIUM[v.rank - 1] : null
              return (
                <div key={v.id} className="rounded-2xl px-4 py-3 sm:py-4 flex items-center gap-3"
                  style={{
                    background: isMe ? 'rgba(124,58,237,0.1)' : 'rgba(18,18,26,0.9)',
                    border: `1px solid ${isMe ? 'rgba(168,85,247,0.5)' : 'rgba(42,42,58,0.7)'}`,
                    boxShadow: isMe ? '0 0 16px rgba(124,58,237,0.2)' : 'none',
                  }}>

                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0 font-black"
                    style={{ color: p?.color ?? 'rgba(148,163,184,0.35)', fontSize: p ? '1.25rem' : '0.8rem', fontFamily: 'monospace' }}>
                    {p?.icon ?? `#${v.rank}`}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm sm:text-base truncate"
                        style={{ color: isMe ? '#a855f7' : '#f1f5f9', fontFamily: 'monospace' }}>
                        {v.nome.toUpperCase()}
                      </span>
                      {isMe && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-black flex-shrink-0"
                          style={{ background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7', fontFamily: 'monospace' }}>
                          VOCÊ
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs mt-1 flex-wrap" style={{ color: 'rgba(148,163,184,0.45)', fontFamily: 'monospace' }}>
                      <span>🎯 {v.real_vendas} VND</span>
                      <span>💰 {formatReal(v.real_faturamento)}</span>
                      {v.streak_atual > 0 && <span>🔥 {v.streak_atual}SEM</span>}
                    </div>
                  </div>

                  {/* Pontos */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-base sm:text-lg"
                      style={{ color: isMe ? '#a855f7' : '#f1f5f9', fontFamily: 'monospace' }}>
                      {formatPontos(v.pontos_total)}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(148,163,184,0.35)', fontFamily: 'monospace' }}>PTS</div>
                  </div>
                </div>
              )
            })}
          </div>

          {ranking.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-sm font-bold" style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
                A SEMANA AINDA NÃO COMEÇOU
              </p>
              <p className="text-xs mt-2" style={{ color: 'rgba(148,163,184,0.3)' }}>Os pontos aparecerão aqui em breve.</p>
            </div>
          )}

          <div className="h-2" />
        </div>
      </div>

      <BottomNav active="ranking" />

      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
      `}</style>
    </div>
  )
}

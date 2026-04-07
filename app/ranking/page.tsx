'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  getRankingGeral,
  getSemanaAtiva,
  formatPontos,
  formatReal,
  type VendedoraComPontos,
} from '@/lib/game-data'
import Link from 'next/link'

type RankedVendedora = VendedoraComPontos & { rank: number }

const RANK_STYLES = [
  { bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.4)',  color: '#eab308', icon: '👑' },
  { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', color: '#94a3b8', icon: '🥈' },
  { bg: 'rgba(180,120,60,0.1)',  border: 'rgba(180,120,60,0.3)', color: '#b4783c', icon: '🥉' },
]

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

      const { data: v } = await supabase
        .from('game_vendedoras')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      if (v) setMeId(v.id)

      const s = await getSemanaAtiva()
      setSemana(s)
      const rank = await getRankingGeral(s)
      setRanking(rank)
      setLoading(false)
    }
    load()
  }, [router])

  const totalPontos = ranking.reduce((s, v) => s + v.real_vendas, 0)
  const metaTotal = ranking.reduce((s, v) => s + v.meta_vendas, 0)
  const pctColetivo = metaTotal > 0 ? Math.round((totalPontos / metaTotal) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 float">🏆</div>
          <div className="text-sm tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
            Carregando ranking...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-24" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--accent2)' }}>
          VENDAS.EXE
        </div>
        <div className="text-lg font-black" style={{ color: 'var(--text)' }}>
          Ranking · Semana {semana}
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Meta coletiva */}
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#22c55e' }}>
              🤝 Meta Coletiva
            </div>
            <div className="text-sm font-black" style={{ color: '#22c55e' }}>
              {pctColetivo}%
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(pctColetivo, 100)}%`,
                background: pctColetivo >= 150
                  ? 'linear-gradient(90deg, #22c55e, #eab308)'
                  : 'linear-gradient(90deg, #22c55e, #06b6d4)'
              }} />
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            {totalPontos} vendas de {metaTotal} · time inteiro
            {pctColetivo >= 150 && (
              <span className="ml-2 font-bold" style={{ color: '#eab308' }}>🌪 MODO CAOS!</span>
            )}
          </div>
        </div>

        {/* Top 3 */}
        <div className="grid grid-cols-3 gap-2">
          {ranking.slice(0, 3).map((v, i) => {
            const style = RANK_STYLES[i]
            const isMe = v.id === meId
            return (
              <div key={v.id} className="rounded-2xl p-3 text-center relative"
                style={{
                  background: style.bg,
                  border: `1px solid ${isMe ? 'var(--accent2)' : style.border}`,
                  boxShadow: isMe ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                }}>
                <div className="text-2xl mb-1">{style.icon}</div>
                <div className="text-xs font-black truncate" style={{ color: isMe ? 'var(--accent2)' : style.color }}>
                  {v.nome}
                </div>
                <div className="text-sm font-black mt-1" style={{ color: 'var(--text)' }}>
                  {formatPontos(v.pontos_total)}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>pts</div>
              </div>
            )
          })}
        </div>

        {/* Lista completa */}
        <div className="flex flex-col gap-2">
          {ranking.map(v => {
            const isMe = v.id === meId
            const rankStyle = v.rank <= 3 ? RANK_STYLES[v.rank - 1] : null
            return (
              <div key={v.id} className="rounded-2xl p-4 flex items-center gap-4"
                style={{
                  background: isMe ? 'rgba(124,58,237,0.1)' : 'var(--surface)',
                  border: `1px solid ${isMe ? 'var(--accent2)' : 'var(--border)'}`,
                  boxShadow: isMe ? '0 0 12px rgba(124,58,237,0.25)' : 'none',
                }}>
                {/* Rank */}
                <div className="text-xl font-black w-8 text-center flex-shrink-0"
                  style={{ color: rankStyle?.color ?? 'var(--muted)' }}>
                  {rankStyle?.icon ?? `#${v.rank}`}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold truncate" style={{ color: isMe ? 'var(--accent2)' : 'var(--text)' }}>
                      {v.nome}
                    </span>
                    {isMe && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'var(--accent)', color: '#fff' }}>
                        você
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    <span>🎯 {v.real_vendas} vendas</span>
                    <span>💰 {formatReal(v.real_faturamento)}</span>
                    {v.streak_atual > 0 && <span>🔥 {v.streak_atual}sem</span>}
                  </div>
                </div>

                {/* Pontos */}
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-base" style={{ color: isMe ? 'var(--accent2)' : 'var(--text)' }}>
                    {formatPontos(v.pontos_total)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>pts</div>
                </div>
              </div>
            )
          })}
        </div>

        {ranking.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
            <div className="text-4xl mb-3">🎮</div>
            <p className="text-sm">A semana ainda não começou.</p>
            <p className="text-xs mt-1">Os pontos aparecerão aqui em breve.</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 flex border-t"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Link href="/perfil" className="flex-1 py-4 flex flex-col items-center gap-1">
          <span className="text-xl">🎯</span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Perfil</span>
        </Link>
        <button className="flex-1 py-4 flex flex-col items-center gap-1">
          <span className="text-xl">🏆</span>
          <span className="text-xs font-bold" style={{ color: 'var(--accent2)' }}>Ranking</span>
        </button>
        <Link href="/login" onClick={async () => supabase.auth.signOut()} className="flex-1 py-4 flex flex-col items-center gap-1">
          <span className="text-xl">🚪</span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Sair</span>
        </Link>
      </div>
    </div>
  )
}

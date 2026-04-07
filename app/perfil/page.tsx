'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  getVendedoraComPontos,
  getRankingGeral,
  getEventosDaVendedora,
  getSemanaAtiva,
  MOTOR_CONFIG,
  formatPontos,
  formatReal,
  pctMeta,
  type VendedoraComPontos,
  type PointEventFull,
} from '@/lib/game-data'
import Link from 'next/link'

type RankedVendedora = VendedoraComPontos & { rank: number }

export default function PerfilPage() {
  const router = useRouter()
  const [vendedora, setVendedora] = useState<VendedoraComPontos | null>(null)
  const [ranking, setRanking] = useState<RankedVendedora[]>([])
  const [eventos, setEventos] = useState<PointEventFull[]>([])
  const [semana, setSemana] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const s = await getSemanaAtiva()
      setSemana(s)

      const [v, rank] = await Promise.all([
        getVendedoraComPontos(user.id, s),
        getRankingGeral(s),
      ])

      setVendedora(v)
      setRanking(rank)

      if (v) {
        const ev = await getEventosDaVendedora(v.id, s)
        setEventos(ev)
      }

      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center"
        style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 float">🎮</div>
          <div className="text-sm tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
            Carregando dados...
          </div>
        </div>
      </div>
    )
  }

  if (!vendedora) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--muted)' }}>Perfil não encontrado.</p>
          <button onClick={handleLogout} className="mt-4 text-sm underline" style={{ color: 'var(--accent2)' }}>
            Sair
          </button>
        </div>
      </div>
    )
  }

  const myRank = ranking.find(r => r.id === vendedora.id)?.rank ?? '-'
  const leader = ranking[0]
  const ptsDiff = leader && leader.id !== vendedora.id
    ? leader.pontos_total - vendedora.pontos_total
    : 0

  const pctVendas = pctMeta(vendedora.real_vendas, vendedora.meta_vendas)
  const pctFat = pctMeta(vendedora.real_faturamento, vendedora.meta_faturamento)

  const motores = [
    { key: 'individual',  pts: vendedora.pontos_individual },
    { key: 'performance', pts: vendedora.pontos_performance },
    { key: 'coletivo',   pts: vendedora.pontos_coletivo },
    { key: 'velocidade', pts: vendedora.pontos_velocidade },
    { key: 'sorte',      pts: vendedora.pontos_sorte },
    { key: 'superacao',  pts: vendedora.pontos_superacao },
  ]

  return (
    <div className="min-h-dvh pb-24" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <div className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--accent2)' }}>
            VENDAS.EXE
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            Semana {semana} · Abr 2026
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: 'var(--muted)' }}>Seus pontos</div>
          <div className="text-xl font-black" style={{ color: 'var(--cyan)' }}>
            {formatPontos(vendedora.pontos_total)}
          </div>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Card principal */}
        <div className="rounded-2xl p-6 text-center relative overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {/* Glow bg */}
          <div className="absolute inset-0 opacity-10"
            style={{ background: 'radial-gradient(circle at 50% 0%, var(--accent), transparent 70%)' }} />

          <div className="relative">
            {/* Avatar emoji */}
            <div className="text-5xl mb-3 float">🎯</div>

            <div className="text-xl font-black uppercase tracking-wide mb-1" style={{ color: 'var(--text)' }}>
              {vendedora.nome}
            </div>
            <div className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              RANK <span className="font-black text-base" style={{ color: 'var(--accent2)' }}>#{myRank}</span> DO TIME
            </div>

            <div className="text-5xl font-black mb-1"
              style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formatPontos(vendedora.pontos_total)}
            </div>
            <div className="text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--muted)' }}>
              Pontos totais da semana
            </div>

            {/* Barra de progresso para o líder */}
            {ptsDiff > 0 && (
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                {pctMeta(vendedora.pontos_total, leader.pontos_total)}% da meta →{' '}
                faltam <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>{formatPontos(ptsDiff)} pts</span> para #1
              </div>
            )}
            {ptsDiff === 0 && (
              <div className="text-xs font-bold pulse-glow rounded-full px-4 py-1 inline-block"
                style={{ color: '#fff', background: 'var(--accent)', border: '1px solid var(--accent2)' }}>
                👑 Líder do time!
              </div>
            )}
          </div>
        </div>

        {/* Grid de motores */}
        <div className="grid grid-cols-3 gap-2">
          {motores.map(({ key, pts }) => {
            const cfg = MOTOR_CONFIG[key]
            return (
              <div key={key} className="rounded-xl p-3 flex flex-col items-center gap-1"
                style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
                <span className="text-xl">{cfg.icon}</span>
                <div className="text-xs font-semibold" style={{ color: cfg.color }}>
                  {cfg.label}
                </div>
                <div className="text-base font-black" style={{ color: 'var(--text)' }}>
                  {formatPontos(pts)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progresso das metas */}
        <div className="rounded-2xl p-4 flex flex-col gap-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Metas da semana
          </div>

          {/* Vendas */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text)' }}>Vendas</span>
              <span style={{ color: 'var(--muted)' }}>
                {vendedora.real_vendas} / {vendedora.meta_vendas}
                {vendedora.real_vendas >= vendedora.meta_vendas && <span className="ml-1">✅</span>}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pctVendas}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }} />
            </div>
            <div className="text-xs mt-1 text-right" style={{ color: 'var(--muted)' }}>{pctVendas}%</div>
          </div>

          {/* Faturamento */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text)' }}>Faturamento</span>
              <span style={{ color: 'var(--muted)' }}>
                {formatReal(vendedora.real_faturamento)} / {formatReal(vendedora.meta_faturamento)}
                {vendedora.real_faturamento >= vendedora.meta_faturamento && <span className="ml-1">✅</span>}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pctFat}%`, background: 'linear-gradient(90deg, #06b6d4, #22c55e)' }} />
            </div>
            <div className="text-xs mt-1 text-right" style={{ color: 'var(--muted)' }}>{pctFat}%</div>
          </div>

          {/* CRM */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text)' }}>CRM 100%</span>
            <span className="text-sm font-bold"
              style={{ color: vendedora.real_crm ? 'var(--green)' : 'var(--muted)' }}>
              {vendedora.real_crm ? '✅ Completo' : '⏳ Pendente'}
            </span>
          </div>
        </div>

        {/* Recordes pessoais */}
        <div className="rounded-2xl p-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
            Recordes pessoais 🏅
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Vendas</div>
              <div className="text-lg font-black" style={{ color: 'var(--yellow)' }}>
                {vendedora.max_vendas_semana}
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Fat.</div>
              <div className="text-lg font-black" style={{ color: 'var(--yellow)' }}>
                {formatReal(vendedora.max_faturamento_semana)}
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Contrato</div>
              <div className="text-lg font-black" style={{ color: 'var(--yellow)' }}>
                {formatReal(vendedora.max_contrato_unico)}
              </div>
            </div>
          </div>
          {vendedora.streak_atual > 0 && (
            <div className="mt-3 text-center text-sm"
              style={{ color: 'var(--accent2)' }}>
              🔥 Streak: {vendedora.streak_atual} semanas consecutivas
            </div>
          )}
        </div>

        {/* Eventos recentes */}
        {eventos.length > 0 && (
          <div className="rounded-2xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
              Últimas conquistas
            </div>
            <div className="flex flex-col gap-2">
              {eventos.map(ev => {
                const cfg = MOTOR_CONFIG[ev.motor] ?? MOTOR_CONFIG.individual
                return (
                  <div key={ev.id} className="flex items-center justify-between py-2 px-3 rounded-xl"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {cfg.icon} {ev.desafio}
                      </div>
                      {ev.memoria_calculo && (
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>{ev.memoria_calculo}</div>
                      )}
                    </div>
                    <div className="text-sm font-black" style={{ color: cfg.color }}>
                      +{formatPontos(ev.pontos)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Big Fone placeholder */}
        <div className="rounded-2xl p-4 text-center"
          style={{ background: 'rgba(249,115,22,0.08)', border: '1px dashed rgba(249,115,22,0.4)' }}>
          <div className="text-2xl mb-1">📱</div>
          <div className="text-sm font-bold" style={{ color: '#f97316' }}>BIG FONE</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            Pode acontecer a qualquer hora
          </div>
          <div className="text-xs mt-1 font-bold" style={{ color: '#f97316' }}>???</div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 flex border-t"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <button className="flex-1 py-4 flex flex-col items-center gap-1">
          <span className="text-xl">🎯</span>
          <span className="text-xs font-bold" style={{ color: 'var(--accent2)' }}>Perfil</span>
        </button>
        <Link href="/ranking" className="flex-1 py-4 flex flex-col items-center gap-1">
          <span className="text-xl">🏆</span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Ranking</span>
        </Link>
        <button onClick={handleLogout} className="flex-1 py-4 flex flex-col items-center gap-1">
          <span className="text-xl">🚪</span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Sair</span>
        </button>
      </div>
    </div>
  )
}

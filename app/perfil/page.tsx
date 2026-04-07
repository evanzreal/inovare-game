'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  getVendedoraComPontos, getRankingGeral, getEventosDaVendedora,
  getSemanaAtiva, MOTOR_CONFIG, formatPontos, formatReal, pctMeta,
  type VendedoraComPontos, type PointEventFull,
} from '@/lib/game-data'
import Link from 'next/link'

type RankedVendedora = VendedoraComPontos & { rank: number }

function GameHeader({ semana, pontos }: { semana: number; pontos: number }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-4">
      <div>
        <div className="font-black tracking-widest text-sm sm:text-base"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #a855f7 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: 'monospace',
          }}>
          VENDAS<span style={{ color: '#a855f7' }}>.EXE</span>
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
          ▸ SEMANA {semana}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs mb-0.5" style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>SEUS PTS</div>
        <div className="text-xl font-black" style={{
          background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {formatPontos(pontos)}
        </div>
      </div>
    </div>
  )
}

function BottomNav({ active }: { active: 'perfil' | 'ranking' }) {
  const { push } = useRouter()
  async function logout() {
    await supabase.auth.signOut()
    push('/login')
  }
  return (
    <div className="fixed bottom-0 left-0 right-0 flex border-t z-20"
      style={{
        background: 'rgba(12,12,20,0.95)',
        borderColor: 'rgba(42,42,58,0.8)',
        backdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
      <Link href="/perfil" className="flex-1 py-3 flex flex-col items-center gap-1 transition-all">
        <span className="text-xl">{active === 'perfil' ? '🎯' : '⬜'}</span>
        <span className="text-xs font-bold" style={{ color: active === 'perfil' ? '#a855f7' : 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>
          PERFIL
        </span>
      </Link>
      <Link href="/ranking" className="flex-1 py-3 flex flex-col items-center gap-1 transition-all">
        <span className="text-xl">{active === 'ranking' ? '🏆' : '⬜'}</span>
        <span className="text-xs font-bold" style={{ color: active === 'ranking' ? '#a855f7' : 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>
          RANKING
        </span>
      </Link>
      <button onClick={logout} className="flex-1 py-3 flex flex-col items-center gap-1 transition-all">
        <span className="text-xl">🚪</span>
        <span className="text-xs" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>SAIR</span>
      </button>
    </div>
  )
}

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
      const [v, rank] = await Promise.all([getVendedoraComPontos(user.id, s), getRankingGeral(s)])
      setVendedora(v)
      setRanking(rank)
      if (v) setEventos(await getEventosDaVendedora(v.id, s))
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a0f 60%)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4" style={{ animation: 'float 2s ease-in-out infinite' }}>🎮</div>
        <div className="text-xs tracking-widest uppercase" style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
          ▸ CARREGANDO DADOS...
        </div>
      </div>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  )

  if (!vendedora) return (
    <div className="min-h-dvh flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a0f 60%)' }}>
      <div className="text-center">
        <p style={{ color: 'rgba(148,163,184,0.6)' }}>Perfil não encontrado.</p>
        <button onClick={() => { supabase.auth.signOut(); router.push('/login') }}
          className="mt-4 text-sm underline" style={{ color: '#a855f7' }}>Sair</button>
      </div>
    </div>
  )

  const myRank = ranking.find(r => r.id === vendedora.id)?.rank ?? '-'
  const leader = ranking[0]
  const ptsDiff = leader && leader.id !== vendedora.id ? leader.pontos_total - vendedora.pontos_total : 0
  const pctVendas = pctMeta(vendedora.real_vendas, vendedora.meta_vendas)
  const pctFat = pctMeta(vendedora.real_faturamento, vendedora.meta_faturamento)

  const motores = [
    { key: 'individual', pts: vendedora.pontos_individual },
    { key: 'performance', pts: vendedora.pontos_performance },
    { key: 'coletivo', pts: vendedora.pontos_coletivo },
    { key: 'velocidade', pts: vendedora.pontos_velocidade },
    { key: 'sorte', pts: vendedora.pontos_sorte },
    { key: 'superacao', pts: vendedora.pontos_superacao },
  ]

  return (
    <div className="min-h-dvh pb-20"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a0f 60%)' }}>

      {/* Glow de fundo */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />

      {/* Container centralizado no desktop */}
      <div className="relative z-10 mx-auto w-full max-w-lg">

        <GameHeader semana={semana} pontos={vendedora.pontos_total} />

        <div className="px-4 sm:px-6 flex flex-col gap-4">

          {/* Card hero */}
          <div className="rounded-2xl p-6 text-center relative overflow-hidden"
            style={{
              background: 'rgba(18,18,26,0.9)',
              border: '1px solid rgba(168,85,247,0.25)',
              boxShadow: '0 0 40px rgba(124,58,237,0.1)',
            }}>
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.15), transparent 65%)' }} />
            <div className="relative">
              <div className="text-5xl sm:text-6xl mb-3" style={{ animation: 'float 3s ease-in-out infinite', display: 'inline-block' }}>🎯</div>
              <div className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-1"
                style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>
                {vendedora.nome}
              </div>
              <div className="text-xs mb-5 font-bold" style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
                RANK{' '}
                <span className="text-lg font-black" style={{ color: '#a855f7' }}>#{myRank}</span>
                {' '}DO TIME
              </div>

              <div className="text-5xl sm:text-6xl font-black mb-1"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 50%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  fontFamily: 'monospace',
                }}>
                {formatPontos(vendedora.pontos_total)}
              </div>
              <div className="text-xs tracking-widest mb-4" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>
                PONTOS TOTAIS DA SEMANA
              </div>

              {ptsDiff > 0 ? (
                <div className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
                  {pctMeta(vendedora.pontos_total, leader.pontos_total)}% da meta →{' '}
                  faltam <span className="font-black" style={{ color: '#a855f7' }}>{formatPontos(ptsDiff)} pts</span> para #1
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.2))',
                    border: '1px solid rgba(168,85,247,0.5)',
                    color: '#fff',
                    animation: 'borderPulse 2s ease-in-out infinite',
                  }}>
                  👑 LÍDER DO TIME!
                </div>
              )}
            </div>
          </div>

          {/* Grid motores */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {motores.map(({ key, pts }) => {
              const cfg = MOTOR_CONFIG[key]
              return (
                <div key={key} className="rounded-xl p-3 flex flex-col items-center gap-1 text-center"
                  style={{
                    background: cfg.bg,
                    border: `1px solid ${cfg.color}33`,
                  }}>
                  <span className="text-xl sm:text-2xl">{cfg.icon}</span>
                  <div className="text-xs font-bold" style={{ color: cfg.color, fontFamily: 'monospace' }}>
                    {cfg.label}
                  </div>
                  <div className="text-sm sm:text-base font-black" style={{ color: '#f1f5f9' }}>
                    {formatPontos(pts)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Metas */}
          <div className="rounded-2xl p-4 sm:p-5 flex flex-col gap-4"
            style={{ background: 'rgba(18,18,26,0.9)', border: '1px solid rgba(42,42,58,0.8)' }}>
            <div className="text-xs font-black uppercase tracking-widest flex items-center gap-2"
              style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
              <span style={{ color: '#a855f7' }}>▸</span> METAS DA SEMANA
            </div>

            {[
              { label: 'Vendas', real: vendedora.real_vendas, meta: vendedora.meta_vendas, pct: pctVendas, fmt: (v: number) => `${v}`, color: '#a855f7', color2: '#06b6d4' },
              { label: 'Faturamento', real: vendedora.real_faturamento, meta: vendedora.meta_faturamento, pct: pctFat, fmt: formatReal, color: '#06b6d4', color2: '#22c55e' },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold" style={{ color: '#f1f5f9' }}>{m.label}</span>
                  <span style={{ color: 'rgba(148,163,184,0.6)', fontFamily: 'monospace' }}>
                    {m.fmt(m.real)} / {m.fmt(m.meta)}
                    {m.real >= m.meta && m.meta > 0 && <span className="ml-2">✅</span>}
                  </span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(42,42,58,0.8)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${m.pct}%`, background: `linear-gradient(90deg, ${m.color}, ${m.color2})` }} />
                </div>
                <div className="text-xs mt-1 text-right font-bold" style={{ color: m.pct >= 100 ? '#22c55e' : 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>
                  {m.pct}%
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'rgba(42,42,58,0.5)' }}>
              <span className="text-sm font-bold" style={{ color: '#f1f5f9' }}>CRM 100%</span>
              <span className="text-sm font-black" style={{
                color: vendedora.real_crm ? '#22c55e' : 'rgba(148,163,184,0.4)',
                fontFamily: 'monospace',
              }}>
                {vendedora.real_crm ? '✅ COMPLETO' : '⏳ PENDENTE'}
              </span>
            </div>
          </div>

          {/* Recordes */}
          <div className="rounded-2xl p-4 sm:p-5"
            style={{ background: 'rgba(18,18,26,0.9)', border: '1px solid rgba(42,42,58,0.8)' }}>
            <div className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
              <span style={{ color: '#eab308' }}>▸</span> RECORDES PESSOAIS 🏅
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'VENDAS', val: `${vendedora.max_vendas_semana}` },
                { label: 'FAT.', val: formatReal(vendedora.max_faturamento_semana) },
                { label: 'CONTRATO', val: formatReal(vendedora.max_contrato_unico) },
              ].map(r => (
                <div key={r.label} className="rounded-xl p-3"
                  style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
                  <div className="text-xs mb-1" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>{r.label}</div>
                  <div className="text-base sm:text-lg font-black" style={{ color: '#eab308' }}>{r.val}</div>
                </div>
              ))}
            </div>
            {vendedora.streak_atual > 0 && (
              <div className="mt-3 text-center text-xs font-black"
                style={{ color: '#f97316', fontFamily: 'monospace' }}>
                🔥 STREAK: {vendedora.streak_atual} SEMANAS CONSECUTIVAS
              </div>
            )}
          </div>

          {/* Eventos */}
          {eventos.length > 0 && (
            <div className="rounded-2xl p-4 sm:p-5"
              style={{ background: 'rgba(18,18,26,0.9)', border: '1px solid rgba(42,42,58,0.8)' }}>
              <div className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2"
                style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
                <span style={{ color: '#06b6d4' }}>▸</span> ÚLTIMAS CONQUISTAS
              </div>
              <div className="flex flex-col gap-2">
                {eventos.map(ev => {
                  const cfg = MOTOR_CONFIG[ev.motor] ?? MOTOR_CONFIG.individual
                  return (
                    <div key={ev.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
                      <div>
                        <div className="text-sm font-bold" style={{ color: '#f1f5f9' }}>
                          {cfg.icon} {ev.desafio}
                        </div>
                        {ev.memoria_calculo && (
                          <div className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
                            {ev.memoria_calculo}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-black ml-4 flex-shrink-0" style={{ color: cfg.color, fontFamily: 'monospace' }}>
                        +{formatPontos(ev.pontos)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Big Fone */}
          <div className="rounded-2xl p-5 text-center"
            style={{
              background: 'rgba(249,115,22,0.06)',
              border: '1px dashed rgba(249,115,22,0.35)',
            }}>
            <div className="text-3xl mb-2" style={{ animation: 'float 2.5s ease-in-out infinite', display: 'inline-block' }}>📱</div>
            <div className="text-sm font-black tracking-widest mb-1" style={{ color: '#f97316', fontFamily: 'monospace' }}>
              BIG FONE
            </div>
            <div className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>
              Pode acontecer a qualquer hora
            </div>
            <div className="text-base font-black mt-1" style={{ color: '#f97316', fontFamily: 'monospace' }}>???</div>
          </div>

          <div className="h-2" />
        </div>
      </div>

      <BottomNav active="perfil" />

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes borderPulse {
          0%,100%{border-color:rgba(168,85,247,0.4);box-shadow:0 0 12px rgba(168,85,247,0.2)}
          50%{border-color:rgba(168,85,247,0.9);box-shadow:0 0 24px rgba(168,85,247,0.5)}
        }
      `}</style>
    </div>
  )
}

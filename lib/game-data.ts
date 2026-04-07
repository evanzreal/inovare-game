import { supabase } from './supabase'

export type VendedoraComPontos = {
  id: string
  nome: string
  email: string
  semana: number
  real_vendas: number
  real_faturamento: number
  maior_contrato: number
  real_crm: boolean
  pontos_individual: number
  pontos_performance: number
  pontos_coletivo: number
  pontos_velocidade: number
  pontos_sorte: number
  pontos_superacao: number
  pontos_total: number
  multiplicador: number
  meta_vendas: number
  meta_faturamento: number
  streak_atual: number
  max_vendas_semana: number
  max_faturamento_semana: number
  max_contrato_unico: number
}

export type PointEventFull = {
  id: number
  motor: string
  desafio: string
  pontos: number
  memoria_calculo: string | null
  created_at: string
}

export type MotorColors = {
  [key: string]: { bg: string; color: string; label: string; icon: string }
}

export const MOTOR_CONFIG: MotorColors = {
  individual:  { bg: 'rgba(124,58,237,0.15)',  color: '#a855f7', label: 'Individual',  icon: '🎯' },
  performance: { bg: 'rgba(234,179,8,0.15)',   color: '#eab308', label: 'Performance', icon: '🏆' },
  coletivo:    { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e', label: 'Coletivo',    icon: '🤝' },
  velocidade:  { bg: 'rgba(6,182,212,0.15)',   color: '#06b6d4', label: 'Velocidade',  icon: '⚡' },
  sorte:       { bg: 'rgba(249,115,22,0.15)',  color: '#f97316', label: 'Sorte',       icon: '🎲' },
  superacao:   { bg: 'rgba(236,72,153,0.15)', color: '#ec4899', label: 'Superação',   icon: '🚀' },
}

export async function getSemanaAtiva(): Promise<number> {
  const { data } = await supabase
    .from('game_config')
    .select('semana')
    .eq('ativa', true)
    .single()
  return data?.semana ?? 15
}

export async function getVendedoraComPontos(userId: string, semana: number): Promise<VendedoraComPontos | null> {
  // Busca dados da vendedora
  const { data: v } = await supabase
    .from('game_vendedoras')
    .select('id, nome, email')
    .eq('auth_user_id', userId)
    .single()
  if (!v) return null

  // Busca snapshot da semana
  const { data: snap } = await supabase
    .from('game_weekly_snapshot')
    .select('*')
    .eq('vendedora_id', v.id)
    .eq('semana', semana)
    .single()

  // Busca meta da semana
  const { data: meta } = await supabase
    .from('game_metas')
    .select('meta_vendas, meta_faturamento')
    .eq('vendedora_id', v.id)
    .eq('semana', semana)
    .single()

  // Busca streak
  const { data: streak } = await supabase
    .from('game_streaks')
    .select('streak_atual')
    .eq('vendedora_id', v.id)
    .single()

  // Busca recordes
  const { data: rec } = await supabase
    .from('game_records')
    .select('max_vendas_semana, max_faturamento_semana, max_contrato_unico')
    .eq('vendedora_id', v.id)
    .single()

  return {
    id: v.id,
    nome: v.nome,
    email: v.email,
    semana,
    real_vendas: snap?.real_vendas ?? 0,
    real_faturamento: snap?.real_faturamento ?? 0,
    maior_contrato: snap?.maior_contrato ?? 0,
    real_crm: snap?.real_crm ?? false,
    pontos_individual: snap?.pontos_individual ?? 0,
    pontos_performance: snap?.pontos_performance ?? 0,
    pontos_coletivo: snap?.pontos_coletivo ?? 0,
    pontos_velocidade: snap?.pontos_velocidade ?? 0,
    pontos_sorte: snap?.pontos_sorte ?? 0,
    pontos_superacao: snap?.pontos_superacao ?? 0,
    pontos_total: snap?.pontos_total ?? 0,
    multiplicador: snap?.multiplicador ?? 1.0,
    meta_vendas: meta?.meta_vendas ?? 0,
    meta_faturamento: meta?.meta_faturamento ?? 0,
    streak_atual: streak?.streak_atual ?? 0,
    max_vendas_semana: rec?.max_vendas_semana ?? 0,
    max_faturamento_semana: rec?.max_faturamento_semana ?? 0,
    max_contrato_unico: rec?.max_contrato_unico ?? 0,
  }
}

export async function getRankingGeral(semana: number): Promise<(VendedoraComPontos & { rank: number })[]> {
  const { data: vendedoras } = await supabase
    .from('game_vendedoras')
    .select('id, nome, email')

  if (!vendedoras) return []

  const snaps = await Promise.all(vendedoras.map(async v => {
    const { data: snap } = await supabase
      .from('game_weekly_snapshot')
      .select('*')
      .eq('vendedora_id', v.id)
      .eq('semana', semana)
      .single()

    const { data: meta } = await supabase
      .from('game_metas')
      .select('meta_vendas, meta_faturamento')
      .eq('vendedora_id', v.id)
      .eq('semana', semana)
      .single()

    const { data: streak } = await supabase
      .from('game_streaks')
      .select('streak_atual')
      .eq('vendedora_id', v.id)
      .single()

    const { data: rec } = await supabase
      .from('game_records')
      .select('max_vendas_semana, max_faturamento_semana, max_contrato_unico')
      .eq('vendedora_id', v.id)
      .single()

    return {
      id: v.id,
      nome: v.nome,
      email: v.email,
      semana,
      real_vendas: snap?.real_vendas ?? 0,
      real_faturamento: snap?.real_faturamento ?? 0,
      maior_contrato: snap?.maior_contrato ?? 0,
      real_crm: snap?.real_crm ?? false,
      pontos_individual: snap?.pontos_individual ?? 0,
      pontos_performance: snap?.pontos_performance ?? 0,
      pontos_coletivo: snap?.pontos_coletivo ?? 0,
      pontos_velocidade: snap?.pontos_velocidade ?? 0,
      pontos_sorte: snap?.pontos_sorte ?? 0,
      pontos_superacao: snap?.pontos_superacao ?? 0,
      pontos_total: snap?.pontos_total ?? 0,
      multiplicador: snap?.multiplicador ?? 1.0,
      meta_vendas: meta?.meta_vendas ?? 0,
      meta_faturamento: meta?.meta_faturamento ?? 0,
      streak_atual: streak?.streak_atual ?? 0,
      max_vendas_semana: rec?.max_vendas_semana ?? 0,
      max_faturamento_semana: rec?.max_faturamento_semana ?? 0,
      max_contrato_unico: rec?.max_contrato_unico ?? 0,
    }
  }))

  return snaps
    .sort((a, b) => b.pontos_total - a.pontos_total)
    .map((v, i) => ({ ...v, rank: i + 1 }))
}

export async function getEventosDaVendedora(vendedoraId: string, semana: number): Promise<PointEventFull[]> {
  const { data } = await supabase
    .from('game_points')
    .select('id, motor, desafio, pontos, memoria_calculo, created_at')
    .eq('vendedora_id', vendedoraId)
    .eq('semana', semana)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

export function formatPontos(n: number): string {
  return n.toLocaleString('pt-BR')
}

export function formatReal(n: number): string {
  if (n >= 1_000_000) return `R$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `R$${(n / 1_000).toFixed(0)}k`
  return `R$${n}`
}

export function pctMeta(real: number, meta: number): number {
  if (meta === 0) return 0
  return Math.min(Math.round((real / meta) * 100), 100)
}

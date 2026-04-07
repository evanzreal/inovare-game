import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for API routes)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Types
export type Vendedora = {
  id: string
  auth_user_id: string
  nome: string
  email: string
  rd_user_id: string | null
  avatar_url: string | null
}

export type WeeklySnapshot = {
  id: number
  vendedora_id: string
  semana: number
  real_crm: boolean
  real_vendas: number
  real_faturamento: number
  maior_contrato: number
  pontos_individual: number
  pontos_performance: number
  pontos_coletivo: number
  pontos_velocidade: number
  pontos_sorte: number
  pontos_superacao: number
  pontos_total: number
  multiplicador: number
}

export type GameMeta = {
  id: number
  vendedora_id: string
  semana: number
  meta_crm: boolean
  meta_vendas: number
  meta_faturamento: number
}

export type GameConfig = {
  id: number
  semana: number
  semana_inicio: string
  semana_fim: string
  ativa: boolean
  modo_caos: boolean
}

export type PointEvent = {
  id: number
  vendedora_id: string
  motor: string
  desafio: string
  pontos: number
  semana: number
  memoria_calculo: string | null
  created_at: string
}

export type GameRecord = {
  vendedora_id: string
  max_vendas_semana: number
  max_faturamento_semana: number
  max_contrato_unico: number
}

export type GameStreak = {
  vendedora_id: string
  streak_atual: number
  streak_max: number
}

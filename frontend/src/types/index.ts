/** Tipos que reflejan exactamente lo que devuelve la API (camelCase). */

export type CampaignStatus = 'activa' | 'exitosa' | 'fallida'
export type Role = 'user' | 'admin'

export interface User {
  id: number
  nombre: string
  email: string
  rol: Role
  creadoEn: string
}

export interface Category {
  id: number
  nombre: string
  slug: string
  descripcion: string | null
}

export interface Campaign {
  id: number
  titulo: string
  descripcion: string
  creadorId: number
  creadorNombre: string
  categoriaId: number | null
  categoria: string | null
  categoriaSlug: string | null
  metaMonto: number
  montoRecaudado: number
  /** AAAA-MM-DD */
  fechaLimite: string
  estado: CampaignStatus
  diasRestantes: number
  totalAportantes: number
  creadoEn: string
  cerradoEn: string | null
}

export interface Contribution {
  id: number
  campanaId: number
  usuarioId: number
  monto: number
  reembolsado: boolean
  reembolsadoEn: string | null
  fechaAporte: string
}

export interface MyContribution extends Contribution {
  campanaTitulo: string
  estadoCampana: CampaignStatus
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface CreateCampaignPayload {
  categoriaId: number
  titulo: string
  descripcion: string
  metaMonto: number
  fechaLimite: string
}

export interface SettlementResult {
  procesadas: number
  exitosas: number
  fallidas: number
  aportesReembolsados: number
  montoReembolsado: number
}

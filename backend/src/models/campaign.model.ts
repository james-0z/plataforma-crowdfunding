export const CAMPAIGN_STATUSES = ['activa', 'exitosa', 'fallida'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export interface Campaign {
  id: number;
  titulo: string;
  descripcion: string;
  creadorId: number;
  creadorNombre: string;
  categoriaId: number | null;
  categoria: string | null;
  categoriaSlug: string | null;
  metaMonto: number;
  montoRecaudado: number;
  /** YYYY-MM-DD, último día en que se aceptan aportes. */
  fechaLimite: string;
  estado: CampaignStatus;
  diasRestantes: number;
  totalAportantes: number;
  creadoEn: string;
  cerradoEn: string | null;
}

export interface Category {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
}

export interface Campaign {
  id: number;
  creador_id: number;
  categoria_id?: number | null;
  titulo: string;
  descripcion: string;
  meta_monto: number;
  monto_recaudado: number;
  fecha_limite: string | Date;
  estado: 'activa' | 'exitosa' | 'fallida';
  creado_en?: Date;
}

export interface CampaignDTO {
  categoriaId?: number;
  titulo: string;
  descripcion: string;
  metaMonto: number;
  fechaLimite: string;
}
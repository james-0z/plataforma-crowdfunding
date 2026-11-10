import { diffDays, todayInTz } from './dates.js';
import type { Campaign, CampaignStatus } from '../models/campaign.model.js';
import type { Contribution } from '../models/contribution.model.js';
import type { User } from '../models/user.model.js';

const iso = (value: unknown): string | null =>
  value ? new Date(value as string | Date).toISOString() : null;

export function mapUser(row: any): User {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    rol: row.rol,
    creadoEn: iso(row.creado_en)!,
  };
}

export function mapCampaign(row: any): Campaign {
  const estado: CampaignStatus = row.estado;
  const diasRestantes = estado === 'activa' ? Math.max(diffDays(todayInTz(), row.fecha_limite), 0) : 0;
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    creadorId: row.creador_id,
    creadorNombre: row.creador_nombre,
    categoriaId: row.categoria_id ?? null,
    categoria: row.categoria_nombre ?? null,
    categoriaSlug: row.categoria_slug ?? null,
    // NUMERIC llega como string desde pg; con 2 decimales y ≤ 12 dígitos Number() es exacto.
    metaMonto: Number(row.meta_monto),
    montoRecaudado: Number(row.monto_recaudado),
    fechaLimite: row.fecha_limite,
    estado,
    diasRestantes,
    totalAportantes: Number(row.total_aportantes ?? 0),
    creadoEn: iso(row.creado_en)!,
    cerradoEn: iso(row.cerrado_en),
  };
}

export function mapContribution(row: any): Contribution {
  return {
    id: row.id,
    campanaId: row.campana_id,
    usuarioId: row.usuario_id,
    monto: Number(row.monto),
    reembolsado: row.reembolsado,
    reembolsadoEn: iso(row.reembolsado_en),
    fechaAporte: iso(row.fecha_aporte)!,
  };
}

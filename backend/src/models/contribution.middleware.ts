export interface Contribution {
  id: number;
  campana_id: number;
  usuario_id: number;
  monto: number;
  reembolsado: boolean;
  fecha_aporte?: Date;
}

export interface ContributionDTO {
  campanaId: number;
  monto: number;
}
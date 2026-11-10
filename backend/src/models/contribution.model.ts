export interface Contribution {
  id: number;
  campanaId: number;
  usuarioId: number;
  monto: number;
  reembolsado: boolean;
  reembolsadoEn: string | null;
  fechaAporte: string;
}

/** Aporte con datos de la campaña, para "Mis aportes". */
export interface MyContribution extends Contribution {
  campanaTitulo: string;
  estadoCampana: 'activa' | 'exitosa' | 'fallida';
}

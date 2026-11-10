const currency = import.meta.env.VITE_CURRENCY ?? 'COP'

const moneyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
})

export const formatMoney = (value: number): string => moneyFormatter.format(value)

/** AAAA-MM-DD -> "30 nov 2026", sin pasar por UTC (evita el desfase de un día). */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number) as [number, number, number]
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(y, m - 1, d),
  )
}

/** Fecha y hora de un instante ISO, en la zona horaria del navegador. */
export const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))

/** Porcentaje real (puede superar 100). */
export const percentOf = (current: number, goal: number): number =>
  goal > 0 ? Math.floor((current / goal) * 100) : 0

/** AAAA-MM-DD de hoy en la zona horaria LOCAL (toISOString usaría UTC y desfasaría la fecha). */
export function todayLocal(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const daysLabel = (days: number): string =>
  days <= 0 ? 'Último día' : days === 1 ? 'Queda 1 día' : `Quedan ${days} días`

import { describe, expect, it } from 'vitest'
import { daysLabel, formatDate, percentOf, todayLocal } from './format'

describe('format', () => {
  it('percentOf no redondea hacia arriba (99.6 % sigue siendo 99 %)', () => {
    expect(percentOf(996, 1000)).toBe(99)
    expect(percentOf(1500, 1000)).toBe(150)
  })
  it('percentOf es seguro con meta 0', () => {
    expect(percentOf(10, 0)).toBe(0)
  })
  it('formatDate no desfasa el día', () => {
    expect(formatDate('2026-11-30')).toContain('30')
    expect(formatDate('2026-01-01')).toContain('1')
  })
  it('todayLocal devuelve AAAA-MM-DD', () => {
    expect(todayLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(todayLocal(1) > todayLocal()).toBe(true)
  })
  it('daysLabel', () => {
    expect(daysLabel(0)).toBe('Último día')
    expect(daysLabel(1)).toBe('Queda 1 día')
    expect(daysLabel(5)).toBe('Quedan 5 días')
  })
})

import type { Campaign, Contribution, MyContribution } from '@/types'
import { request } from './http'

export const contributionsApi = {
  create: (data: { campanaId: number; monto: number }) =>
    request<{ message: string; contribution: Contribution; campaign: Campaign }>('/contributions', {
      method: 'POST',
      body: data,
    }),
  mine: () => request<{ items: MyContribution[] }>('/contributions/mine').then((r) => r.items),
}

import type { Campaign, CampaignStatus, Category, CreateCampaignPayload, Page, SettlementResult } from '@/types'
import { request } from './http'

export interface CampaignFilters {
  categoria?: string
  estado?: CampaignStatus
  q?: string
  page?: number
  pageSize?: number
}

export const campaignsApi = {
  list: (filters: CampaignFilters = {}) => request<Page<Campaign>>('/campaigns', { query: { ...filters } }),
  get: (id: number) => request<Campaign>(`/campaigns/${id}`),
  mine: () => request<{ items: Campaign[] }>('/campaigns/mine').then((r) => r.items),
  create: (payload: CreateCampaignPayload) =>
    request<{ message: string; campaign: Campaign }>('/campaigns', { method: 'POST', body: payload }),
  categories: () => request<{ items: Category[] }>('/categories').then((r) => r.items),
  settle: () => request<SettlementResult>('/admin/settle', { method: 'POST' }),
}

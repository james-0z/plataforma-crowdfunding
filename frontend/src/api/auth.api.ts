import type { User } from '@/types'
import { request } from './http'

export interface SessionResponse {
  user: User
  accessToken: string
}

export const authApi = {
  register: (data: { nombre: string; email: string; password: string }) =>
    request<SessionResponse>('/auth/register', { method: 'POST', body: data, retryOn401: false }),
  login: (data: { email: string; password: string }) =>
    request<SessionResponse>('/auth/login', { method: 'POST', body: data, retryOn401: false }),
  refresh: () => request<SessionResponse>('/auth/refresh', { method: 'POST', retryOn401: false }),
  logout: () => request<void>('/auth/logout', { method: 'POST', retryOn401: false }),
}

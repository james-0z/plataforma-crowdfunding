/**
 * Cliente HTTP único. Responsabilidades:
 *  - añadir el access token (guardado SOLO en memoria) a cada petición;
 *  - enviar la cookie HttpOnly del refresh token (credentials: 'include');
 *  - ante un 401, renovar la sesión una vez y reintentar.
 */
export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(status: number, message: string, code = 'ERROR', details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

let accessToken: string | null = null
let refreshHandler: (() => Promise<boolean>) | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}
/** Lo registra el authStore para evitar una dependencia circular. */
export const setRefreshHandler = (handler: () => Promise<boolean>) => {
  refreshHandler = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined | null>
  /** false en login/registro/refresh: no tiene sentido reintentar con refresh. */
  retryOn401?: boolean
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, retryOn401 = true } = options

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const url = `${BASE_URL}${path}${params.size ? `?${params}` : ''}`

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión.', 'NETWORK_ERROR')
  }

  if (response.status === 401 && retryOn401 && refreshHandler && (await refreshHandler())) {
    return request<T>(path, { ...options, retryOn401: false })
  }

  if (response.status === 204) return undefined as T

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? 'Ocurrió un error inesperado.',
      data?.code,
      data?.details,
    )
  }
  return data as T
}

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado.'

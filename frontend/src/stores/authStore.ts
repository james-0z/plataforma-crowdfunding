import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi, type SessionResponse } from '@/api/auth.api'
import { setAccessToken, setRefreshHandler } from '@/api/http'
import type { User } from '@/types'

/**
 * Sesión: el access token vive solo en memoria (no en localStorage, a salvo de XSS persistente);
 * el refresh token va en una cookie HttpOnly que JavaScript no puede leer.
 * Al recargar la página, init() recupera la sesión pidiendo un access token nuevo.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const ready = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.rol === 'admin')

  function applySession(session: SessionResponse) {
    setAccessToken(session.accessToken)
    user.value = session.user
  }

  function clearSession() {
    setAccessToken(null)
    user.value = null
  }

  // Una sola renovación a la vez aunque fallen varias peticiones en paralelo.
  let refreshing: Promise<boolean> | null = null
  function refreshSession(): Promise<boolean> {
    refreshing ??= authApi
      .refresh()
      .then((session) => {
        applySession(session)
        return true
      })
      .catch(() => {
        clearSession()
        return false
      })
      .finally(() => {
        refreshing = null
      })
    return refreshing
  }
  setRefreshHandler(refreshSession)

  let initPromise: Promise<void> | null = null
  function init(): Promise<void> {
    initPromise ??= refreshSession().then(() => {
      ready.value = true
    })
    return initPromise
  }

  async function login(email: string, password: string) {
    applySession(await authApi.login({ email, password }))
  }

  async function register(nombre: string, email: string, password: string) {
    applySession(await authApi.register({ nombre, email, password }))
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }

  return { user, ready, isAuthenticated, isAdmin, init, login, register, logout }
})

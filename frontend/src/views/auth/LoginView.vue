<template>
  <div>
    <h2>Iniciar sesión</h2>
    <p class="subtitle">Ingresa tus credenciales para continuar.</p>

    <form class="auth-form" novalidate @submit.prevent="handleLogin">
      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

      <div class="form-group">
        <label for="email">Correo electrónico</label>
        <input id="email" v-model.trim="email" type="email" autocomplete="email" placeholder="nombre@ejemplo.com" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" autocomplete="current-password" required />
      </div>

      <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
        {{ loading ? 'Ingresando…' : 'Iniciar sesión' }}
      </button>
    </form>

    <p class="auth-footer">¿No tienes cuenta? <router-link to="/auth/registro">Regístrate aquí</router-link></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { errorMessage } from '@/api/http'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Completa el correo y la contraseña.'
    return
  }
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/dashboard/mis-campanas'
    await router.push(redirect)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form { margin-top: 1.25rem; }
.auth-footer { text-align: center; font-size: 0.9rem; margin-top: 1rem; }
</style>

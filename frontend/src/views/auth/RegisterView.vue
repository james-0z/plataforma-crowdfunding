<template>
  <div>
    <h2>Crear una cuenta</h2>
    <p class="subtitle">Regístrate para crear o financiar proyectos.</p>

    <form class="auth-form" novalidate @submit.prevent="handleRegister">
      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

      <div class="form-group">
        <label for="nombre">Nombre completo</label>
        <input id="nombre" v-model.trim="nombre" type="text" maxlength="100" autocomplete="name" placeholder="Juan Pérez" required />
      </div>
      <div class="form-group">
        <label for="email">Correo electrónico</label>
        <input id="email" v-model.trim="email" type="email" maxlength="150" autocomplete="email" placeholder="nombre@ejemplo.com" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" autocomplete="new-password" minlength="8" required />
        <small class="hint">Mínimo 8 caracteres, con letras y números.</small>
      </div>

      <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
        {{ loading ? 'Registrando…' : 'Registrarse' }}
      </button>
    </form>

    <p class="auth-footer">¿Ya tienes cuenta? <router-link to="/auth/login">Inicia sesión</router-link></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { errorMessage } from '@/api/http'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()

const nombre = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  if (nombre.value.length < 2) return void (error.value = 'El nombre debe tener al menos 2 caracteres.')
  if (password.value.length < 8 || !/[A-Za-z]/.test(password.value) || !/\d/.test(password.value)) {
    return void (error.value = 'La contraseña debe tener al menos 8 caracteres, con letras y números.')
  }
  loading.value = true
  try {
    await auth.register(nombre.value, email.value, password.value)
    await router.push('/dashboard/mis-campanas')
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

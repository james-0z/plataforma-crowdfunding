<template>
  <header class="header">
    <div class="header-container">
      <router-link to="/" class="logo">🚀 CrowdFund</router-link>

      <button class="menu-toggle" type="button" :aria-expanded="open" aria-label="Abrir menú" @click="open = !open">☰</button>

      <div class="menu" :class="{ open }" @click="open = false">
        <nav class="nav-links">
          <router-link to="/">Inicio</router-link>
          <router-link to="/campanas">Campañas</router-link>
          <router-link v-if="auth.isAuthenticated" to="/dashboard/mis-campanas">Mi panel</router-link>
        </nav>

        <div class="auth-actions">
          <template v-if="auth.isAuthenticated">
            <span class="user-name">Hola, {{ firstName }}</span>
            <router-link to="/dashboard/crear-campana" class="btn btn-primary">Crear campaña</router-link>
            <button type="button" class="btn btn-ghost" @click="handleLogout">Salir</button>
          </template>
          <template v-else>
            <router-link to="/auth/login" class="btn btn-ghost">Ingresar</router-link>
            <router-link to="/auth/registro" class="btn btn-primary">Crear cuenta</router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const open = ref(false)

const firstName = computed(() => auth.user?.nombre.split(' ')[0] ?? '')

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'home' })
}
</script>

<style scoped>
.header { background: var(--color-card-bg); border-bottom: 1px solid var(--color-border); padding: 0.75rem 1.5rem; position: sticky; top: 0; z-index: 10; }
.header-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.logo { font-size: 1.3rem; font-weight: 800; color: var(--color-primary); text-decoration: none; }
.menu { display: flex; align-items: center; gap: 2rem; flex: 1; justify-content: space-between; margin-left: 2rem; }
.nav-links { display: flex; gap: 1.5rem; }
.nav-links a { text-decoration: none; color: var(--color-text); font-weight: 500; }
.nav-links a:hover, .nav-links a.router-link-exact-active { color: var(--color-primary); }
.auth-actions { display: flex; gap: 0.75rem; align-items: center; }
.user-name { font-size: 0.9rem; color: var(--color-muted); }
.menu-toggle { display: none; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 1.2rem; padding: 0.25rem 0.6rem; cursor: pointer; }

@media (max-width: 820px) {
  .menu-toggle { display: block; }
  .menu { display: none; position: absolute; left: 0; right: 0; top: 100%; background: var(--color-card-bg); border-bottom: 1px solid var(--color-border); flex-direction: column; align-items: stretch; gap: 1rem; padding: 1rem 1.5rem; margin: 0; }
  .menu.open { display: flex; }
  .nav-links, .auth-actions { flex-direction: column; align-items: stretch; }
}
</style>

<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <router-link to="/" class="logo">🚀 CrowdFund</router-link>
      <nav class="sidebar-nav">
        <router-link to="/dashboard/mis-campanas" class="nav-item">📋 Mis campañas</router-link>
        <router-link to="/dashboard/mis-aportes" class="nav-item">💸 Mis aportes</router-link>
        <router-link v-if="auth.isAdmin" to="/dashboard/admin" class="nav-item">🛠️ Administración</router-link>
        <router-link to="/dashboard/crear-campana" class="nav-item btn-create">➕ Nueva campaña</router-link>
      </nav>
      <div class="sidebar-footer">
        <small>{{ auth.user?.email }}</small>
        <button type="button" class="logout" @click="handleLogout">Cerrar sesión</button>
      </div>
    </aside>
    <main class="dashboard-content"><router-view /></main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'home' })
}
</script>

<style scoped>
.dashboard-layout { display: flex; min-height: 100vh; }
.sidebar { width: 260px; background: var(--color-sidebar); color: #fff; padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 2rem; flex-shrink: 0; }
.logo { font-size: 1.25rem; font-weight: 700; color: #fff; text-decoration: none; }
.sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
.nav-item { color: var(--color-sidebar-text); text-decoration: none; padding: 0.7rem 1rem; border-radius: var(--radius-md); font-weight: 500; font-size: 0.95rem; }
.nav-item:hover, .nav-item.router-link-active { color: #fff; background: #334155; }
.btn-create { margin-top: 1rem; background: var(--color-primary); color: #fff; text-align: center; }
.btn-create:hover { background: var(--color-primary-hover); }
.sidebar-footer { display: flex; flex-direction: column; gap: 0.5rem; color: var(--color-sidebar-text); word-break: break-all; }
.logout { background: transparent; border: 1px solid #475569; color: #e2e8f0; padding: 0.45rem; border-radius: var(--radius-md); cursor: pointer; font: inherit; }
.logout:hover { background: #334155; }
.dashboard-content { flex: 1; padding: 2.5rem; min-width: 0; }

@media (max-width: 820px) {
  .dashboard-layout { flex-direction: column; }
  .sidebar { width: 100%; flex-direction: column; gap: 1rem; padding: 1rem; }
  .sidebar-nav { flex-direction: row; flex-wrap: wrap; flex: none; }
  .btn-create { margin-top: 0; }
  .sidebar-footer { flex-direction: row; justify-content: space-between; align-items: center; }
  .dashboard-content { padding: 1.25rem; }
}
</style>

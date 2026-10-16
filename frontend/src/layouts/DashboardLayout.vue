<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <router-link to="/" class="logo">🚀 CrowdFund</router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard/mis-campanas" class="nav-item">
          📋 Mis Campañas
        </router-link>
        <router-link to="/dashboard/mis-aportes" class="nav-item">
          💸 Mis Aportes
        </router-link>
        <router-link to="/dashboard/crear-campana" class="nav-item btn-create">
          ➕ Nueva Campaña
        </router-link>
      </nav>
    </aside>

    <main class="dashboard-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg);
}

.sidebar {
  width: 260px;
  background-color: #1e293b;
  color: white;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-header .logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  display: block;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-item {
  color: #94a3b8;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  display: block;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #ffffff;
  background-color: #334155;
}

.btn-create {
  margin-top: 1rem;
  background-color: var(--color-primary);
  color: #ffffff;
  text-align: center;
}

.btn-create:hover {
  background-color: var(--color-primary-hover);
}

.dashboard-content {
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
}
</style>
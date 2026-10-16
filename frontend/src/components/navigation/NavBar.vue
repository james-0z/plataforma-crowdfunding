<template>
  <header class="header">
    <div class="header-container">
      <router-link to="/" class="logo">
        🚀 CrowdFund
      </router-link>
      <nav class="nav-links">
        <router-link to="/">Inicio</router-link>
        <router-link to="/campanas">Campañas</router-link>
        <router-link to="/dashboard/mis-campanas">Mi Panel</router-link>
      </nav>
      <div class="auth-actions">
        <router-link to="/auth/login" class="btn-link">Ingresar</router-link>
        <router-link to="/dashboard/crear-campana" class="btn-primary">Crear Campaña</router-link>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 2rem;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--color-primary);
}

.auth-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-link {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}
</style>
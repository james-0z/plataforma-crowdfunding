<template>
  <div class="auth-layout">
    <div class="auth-card-container">
      <div class="auth-header">
        <router-link to="/" class="logo">🚀 CrowdFund</router-link>
      </div>
      <main class="auth-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-bg);
  padding: 1.5rem;
}

.auth-card-container {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.auth-header {
  text-align: center;
}

.logo {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-primary);
  text-decoration: none;
}
</style>
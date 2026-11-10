<template>
  <div class="auth-layout">
    <div class="auth-card card">
      <router-link to="/" class="logo">🚀 CrowdFund</router-link>
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.auth-layout { min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 1.5rem; }
.auth-card { width: 100%; max-width: 420px; padding: 2.25rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; }
.logo { text-align: center; font-size: 1.6rem; font-weight: 800; color: var(--color-primary); text-decoration: none; }
</style>

<template>
  <footer class="footer">
    <p>&copy; {{ year }} CrowdFund · Crowdfunding con modelo All-or-Nothing</p>
    <p class="subtitle">Si una campaña no alcanza su meta antes de la fecha límite, todos los aportes se reembolsan.</p>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.footer { background: var(--color-secondary); color: var(--color-sidebar-text); padding: 2rem 1rem; text-align: center; font-size: 0.9rem; }
.subtitle { font-size: 0.8rem; margin-top: 0.25rem; color: var(--color-muted); }
</style>

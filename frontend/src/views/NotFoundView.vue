<template>
  <div class="not-found">
    <h1>404</h1>
    <p class="subtitle">La página que buscas no existe.</p>
    <router-link to="/" class="btn btn-primary">Volver al inicio</router-link>
  </div>
</template>

<style scoped>
.not-found { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
h1 { font-size: 4rem; color: var(--color-primary); }
</style>

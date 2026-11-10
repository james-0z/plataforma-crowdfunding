<template>
  <div class="layout-container">
    <NavBar />
    <main class="main-content"><router-view /></main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from '@/components/navigation/Footer.vue'
import NavBar from '@/components/navigation/NavBar.vue'
</script>

<style scoped>
.layout-container { display: flex; flex-direction: column; min-height: 100vh; }
.main-content { flex: 1; max-width: 1200px; width: 100%; margin: 2rem auto; padding: 0 1.25rem; }
</style>

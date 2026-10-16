<template>
  <div class="list-container">
    <h2>Catálogo de Campañas</h2>
    <p class="subtitle">Descubre todos los proyectos disponibles en la plataforma.</p>

    <div class="campaigns-grid">
      <CampaignCard
        v-for="campana in todasLasCampanas"
        :key="campana.id"
        :id="campana.id"
        :title="campana.titulo"
        :description="campana.descripcion"
        :current-amount="campana.montoRecaudado"
        :goal-amount="campana.metaMonto"
        :status="campana.estado"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CampaignCard from '@/components/common/CampaignCard.vue';

interface Campana {
  id: number;
  titulo: string;
  descripcion: string;
  montoRecaudado: number;
  metaMonto: number;
  estado: 'activa' | 'exitosa' | 'fallida';
}

const todasLasCampanas = ref<Campana[]>([
  {
    id: 1,
    titulo: 'Videojuego Indie RPG 2D',
    descripcion: 'Un juego de rol con arte píxel y banda sonora orquestal.',
    montoRecaudado: 3500,
    metaMonto: 5000,
    estado: 'activa'
  },
  {
    id: 2,
    titulo: 'Teclado Mecánico Ergonómico',
    descripcion: 'Diseño ultra compacto impreso en 3D con switches personalizados.',
    montoRecaudado: 12000,
    metaMonto: 10000,
    estado: 'exitosa'
  },
  {
    id: 3,
    titulo: 'Documental Ecológico',
    descripcion: 'Registro sobre la conservación de especies nativas en ríos locales.',
    montoRecaudado: 800,
    metaMonto: 4000,
    estado: 'fallida'
  }
]);
</script>

<style scoped>
.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subtitle {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
</style>
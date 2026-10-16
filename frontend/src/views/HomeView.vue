<template>
  <div class="home-container">
    <section class="hero">
      <h2>Financia proyectos con el modelo All-or-Nothing</h2>
      <p>
        Apoya proyectos innovadores. Si la campaña alcanza su meta antes de la fecha límite, el proyecto se financia. De lo contrario, se reembolsan los aportes.
      </p>
      <router-link to="/campanas" class="btn-primary">Explorar Campañas</router-link>
    </section>

    <section class="featured-section">
      <h3>Campañas Destacadas</h3>
      <div class="campaigns-grid">
        <CampaignCard
          v-for="campana in campanasEjemplo"
          :key="campana.id"
          :id="campana.id"
          :title="campana.titulo"
          :description="campana.descripcion"
          :current-amount="campana.montoRecaudado"
          :goal-amount="campana.metaMonto"
          :status="campana.estado"
        />
      </div>
    </section>
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

const campanasEjemplo = ref<Campana[]>([
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
  }
]);
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: var(--radius-md);
}

.hero h2 {
  font-size: 2.2rem;
  color: var(--color-secondary);
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.1rem;
  max-width: 650px;
  margin: 0 auto 1.5rem auto;
  color: #475569;
}

.btn-primary {
  display: inline-block;
  background-color: var(--color-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.featured-section h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.campaigns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
</style>
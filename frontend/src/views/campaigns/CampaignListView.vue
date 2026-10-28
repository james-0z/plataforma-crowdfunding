<template>
  <div class="list-container">
    <h2>Catálogo de Campañas</h2>
    <p class="subtitle">Descubre todos los proyectos disponibles en la plataforma.</p>

    <div class="campaigns-grid">
      <CampaignCard
        v-for="campana in campaignStore.campaigns"
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
import CampaignCard from '@/components/common/CampaignCard.vue';
import { useCampaignStore } from '@/stores/campaignStore';

const campaignStore = useCampaignStore();
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
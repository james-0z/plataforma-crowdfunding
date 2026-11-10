<template>
  <article class="card campaign-card">
    <div class="top">
      <StatusBadge :status="campaign.estado" />
      <span v-if="campaign.categoria" class="category">{{ campaign.categoria }}</span>
    </div>
    <h3>{{ campaign.titulo }}</h3>
    <p class="creator">por {{ campaign.creadorNombre }}</p>
    <p class="description">{{ campaign.descripcion }}</p>

    <ProgressBar :current-amount="campaign.montoRecaudado" :goal-amount="campaign.metaMonto" />

    <div class="footer">
      <small class="muted">
        <template v-if="campaign.estado === 'activa'">{{ daysLabel(campaign.diasRestantes) }}</template>
        <template v-else>Cerró el {{ formatDate(campaign.fechaLimite) }}</template>
      </small>
      <router-link :to="{ name: 'campaign-detail', params: { id: campaign.id } }" class="btn btn-outline btn-sm">Ver más</router-link>
    </div>
  </article>
</template>

<script setup lang="ts">
import ProgressBar from '@/components/common/ProgressBar.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { Campaign } from '@/types'
import { daysLabel, formatDate } from '@/utils/format'

defineProps<{ campaign: Campaign }>()
</script>

<style scoped>
.campaign-card { display: flex; flex-direction: column; gap: 0.6rem; }
.top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.category { font-size: 0.78rem; color: var(--color-muted); }
h3 { font-size: 1.1rem; }
.creator { font-size: 0.82rem; color: var(--color-muted); }
.description {
  color: var(--color-muted); font-size: 0.9rem; flex: 1;
  display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
</style>

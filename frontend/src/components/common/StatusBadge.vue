<template>
  <span class="badge" :class="status">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CampaignStatus } from '@/types'

const props = defineProps<{ status: CampaignStatus }>()

const labels: Record<CampaignStatus, string> = {
  activa: 'Activa',
  exitosa: 'Exitosa',
  fallida: 'No alcanzó la meta',
}
const label = computed(() => labels[props.status])
</script>

<style scoped>
.badge { display: inline-block; padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; width: fit-content; }
.activa { background: #dbeafe; color: #1e40af; }
.exitosa { background: #dcfce7; color: #166534; }
.fallida { background: #fee2e2; color: #991b1b; }
</style>

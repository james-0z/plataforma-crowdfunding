<template>
  <div>
    <div class="header-actions">
      <h2>Mis campañas</h2>
      <router-link to="/dashboard/crear-campana" class="btn btn-primary">+ Nueva campaña</router-link>
    </div>

    <p v-if="error" class="alert alert-error">{{ error }}</p>
    <p v-else-if="loading" class="empty-state">Cargando…</p>
    <p v-else-if="campaigns.length === 0" class="empty-state">Aún no has creado ninguna campaña.</p>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr><th>Título</th><th>Meta</th><th>Recaudado</th><th>Aportantes</th><th>Estado</th><th>Fecha límite</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in campaigns" :key="c.id">
            <td><router-link :to="{ name: 'campaign-detail', params: { id: c.id } }"><strong>{{ c.titulo }}</strong></router-link></td>
            <td>{{ formatMoney(c.metaMonto) }}</td>
            <td>{{ formatMoney(c.montoRecaudado) }} <small class="muted">({{ percentOf(c.montoRecaudado, c.metaMonto) }}%)</small></td>
            <td>{{ c.totalAportantes }}</td>
            <td><StatusBadge :status="c.estado" /></td>
            <td>{{ formatDate(c.fechaLimite) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { campaignsApi } from '@/api/campaigns.api'
import { errorMessage } from '@/api/http'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { Campaign } from '@/types'
import { formatDate, formatMoney, percentOf } from '@/utils/format'

const campaigns = ref<Campaign[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    campaigns.value = await campaignsApi.mine()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="header-actions"><h2>Mis aportes</h2></div>

    <p v-if="error" class="alert alert-error">{{ error }}</p>
    <p v-else-if="loading" class="empty-state">Cargando…</p>
    <p v-else-if="items.length === 0" class="empty-state">
      No has realizado ningún aporte. <router-link to="/campanas">Explora campañas</router-link>
    </p>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr><th>Campaña</th><th>Monto</th><th>Fecha</th><th>Estado campaña</th><th>Situación de tu dinero</th></tr>
        </thead>
        <tbody>
          <tr v-for="a in items" :key="a.id">
            <td><router-link :to="{ name: 'campaign-detail', params: { id: a.campanaId } }"><strong>{{ a.campanaTitulo }}</strong></router-link></td>
            <td>{{ formatMoney(a.monto) }}</td>
            <td>{{ formatDateTime(a.fechaAporte) }}</td>
            <td><StatusBadge :status="a.estadoCampana" /></td>
            <td>{{ situation(a) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { contributionsApi } from '@/api/contributions.api'
import { errorMessage } from '@/api/http'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { MyContribution } from '@/types'
import { formatDateTime, formatMoney } from '@/utils/format'

const items = ref<MyContribution[]>([])
const loading = ref(true)
const error = ref('')

function situation(a: MyContribution): string {
  if (a.reembolsado) return `↩️ Reembolsado${a.reembolsadoEn ? ' el ' + formatDateTime(a.reembolsadoEn) : ''}`
  if (a.estadoCampana === 'exitosa') return '✅ Entregado al proyecto'
  return '⏳ En custodia hasta el cierre'
}

onMounted(async () => {
  try {
    items.value = await contributionsApi.mine()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
})
</script>

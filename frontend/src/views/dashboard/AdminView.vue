<template>
  <div>
    <div class="header-actions"><h2>Administración</h2></div>

    <section class="card">
      <h3>Cierre de campañas vencidas</h3>
      <p class="muted">
        El servidor revisa automáticamente las campañas vencidas cada cierto tiempo. Aquí puedes forzar el cierre ahora:
        las que alcanzaron la meta pasan a <strong>exitosas</strong> y las demás a <strong>fallidas</strong>, reembolsando todos sus aportes.
      </p>

      <p v-if="error" class="alert alert-error">{{ error }}</p>
      <div v-if="result" class="alert alert-success" role="status">
        <strong>{{ result.procesadas }}</strong> campañas procesadas:
        {{ result.exitosas }} exitosas, {{ result.fallidas }} fallidas.
        <template v-if="result.aportesReembolsados">
          Se reembolsaron {{ result.aportesReembolsados }} aportes por {{ formatMoney(result.montoReembolsado) }}.
        </template>
      </div>

      <button class="btn btn-primary" :disabled="loading" @click="settle">
        {{ loading ? 'Procesando…' : 'Procesar cierres ahora' }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { campaignsApi } from '@/api/campaigns.api'
import { errorMessage } from '@/api/http'
import type { SettlementResult } from '@/types'
import { formatMoney } from '@/utils/format'

const loading = ref(false)
const error = ref('')
const result = ref<SettlementResult | null>(null)

async function settle() {
  loading.value = true
  error.value = ''
  try {
    result.value = await campaignsApi.settle()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

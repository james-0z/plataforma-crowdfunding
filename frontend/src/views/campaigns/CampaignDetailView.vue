<template>
  <p v-if="loading" class="empty-state">Cargando campaña…</p>
  <div v-else-if="notFound" class="empty-state">
    <h2>Campaña no encontrada</h2>
    <router-link to="/campanas">Volver al catálogo</router-link>
  </div>
  <p v-else-if="error && !campaign" class="alert alert-error">{{ error }}</p>

  <div v-else-if="campaign" class="detail-container">
    <header class="detail-header">
      <StatusBadge :status="campaign.estado" />
      <h2>{{ campaign.titulo }}</h2>
      <p class="muted">
        Creada por <strong>{{ campaign.creadorNombre }}</strong>
        <template v-if="campaign.categoria"> · {{ campaign.categoria }}</template>
      </p>
    </header>

    <div class="detail-grid">
      <div class="main-info">
        <section class="card">
          <h3>Descripción del proyecto</h3>
          <p class="description-text">{{ campaign.descripcion }}</p>
        </section>

        <section class="card">
          <h3>Reglas de financiamiento</h3>
          <p>
            <strong>All-or-Nothing:</strong> los fondos solo se entregan si la campaña alcanza el 100&nbsp;% de su meta al
            llegar la fecha límite. Si no la alcanza, <strong>todos los aportes se reembolsan</strong>. La campaña sigue
            abierta hasta su fecha límite, incluso después de superar la meta.
          </p>
        </section>
      </div>

      <aside class="card funding">
        <ProgressBar :current-amount="campaign.montoRecaudado" :goal-amount="campaign.metaMonto" />

        <ul class="stats">
          <li><strong>{{ campaign.totalAportantes }}</strong><span>aportantes</span></li>
          <li v-if="campaign.estado === 'activa'"><strong>{{ campaign.diasRestantes }}</strong><span>días restantes</span></li>
        </ul>
        <p class="muted small">📅 Fecha límite: <strong>{{ formatDate(campaign.fechaLimite) }}</strong></p>

        <hr class="divider" />

        <template v-if="campaign.estado === 'exitosa'">
          <p class="alert alert-success">🎉 Campaña exitosa: alcanzó su meta y los fondos fueron liberados.</p>
        </template>
        <template v-else-if="campaign.estado === 'fallida'">
          <p class="alert alert-error">No alcanzó la meta. Todos los aportes fueron reembolsados.</p>
        </template>
        <template v-else>
          <p v-if="campaign.montoRecaudado >= campaign.metaMonto" class="alert alert-success">
            ¡Meta alcanzada! Aún puedes aportar hasta la fecha límite.
          </p>

          <p v-if="isOwner" class="alert alert-info">Esta es tu campaña: no puedes aportar a ella.</p>
          <router-link v-else-if="!auth.isAuthenticated" :to="{ name: 'login', query: { redirect: route.fullPath } }" class="btn btn-primary btn-block">
            Inicia sesión para aportar
          </router-link>

          <form v-else novalidate @submit.prevent="contribute">
            <h4>Realizar un aporte</h4>
            <div class="chips">
              <button v-for="n in [10000, 20000, 50000, 100000]" :key="n" type="button" class="chip" @click="amount = n">{{ formatMoney(n) }}</button>
            </div>
            <div class="form-group">
              <label for="monto">Monto a aportar</label>
              <input id="monto" v-model.number="amount" type="number" min="1000" step="1000" placeholder="Ej. 50000" required />
            </div>
            <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
            <p v-if="success" class="alert alert-success" role="status">{{ success }}</p>
            <button type="submit" class="btn btn-primary btn-block" :disabled="sending">
              {{ sending ? 'Procesando…' : 'Aportar a esta campaña' }}
            </button>
          </form>
        </template>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { campaignsApi } from '@/api/campaigns.api'
import { contributionsApi } from '@/api/contributions.api'
import { ApiError, errorMessage } from '@/api/http'
import ProgressBar from '@/components/common/ProgressBar.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useAuthStore } from '@/stores/authStore'
import type { Campaign } from '@/types'
import { formatDate, formatMoney } from '@/utils/format'

const route = useRoute()
const auth = useAuthStore()

const campaign = ref<Campaign | null>(null)
const loading = ref(true)
const notFound = ref(false)
const error = ref('')
const success = ref('')
const amount = ref<number | null>(null)
const sending = ref(false)

const isOwner = computed(() => !!auth.user && campaign.value?.creadorId === auth.user.id)

async function load() {
  loading.value = true
  notFound.value = false
  error.value = ''
  success.value = ''
  try {
    campaign.value = await campaignsApi.get(Number(route.params.id))
  } catch (e) {
    campaign.value = null
    if (e instanceof ApiError && e.status === 404) notFound.value = true
    else error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

async function contribute() {
  error.value = ''
  success.value = ''
  if (!amount.value || !Number.isInteger(amount.value) || amount.value < 1000) {
    error.value = `Ingresa un monto en pesos enteros, de al menos ${formatMoney(1000)}.`
    return
  }
  sending.value = true
  try {
    const result = await contributionsApi.create({ campanaId: campaign.value!.id, monto: amount.value })
    campaign.value = result.campaign // el servidor es la fuente de verdad
    success.value = `¡Gracias por tu aporte de ${formatMoney(result.contribution.monto)}!`
    amount.value = null
  } catch (e) {
    error.value = errorMessage(e)
    if (e instanceof ApiError && e.status === 409) await load().then(() => (error.value = errorMessage(e)))
  } finally {
    sending.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>

<style scoped>
.detail-header { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.detail-header h2 { font-size: clamp(1.5rem, 3vw, 2rem); }
.detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: start; }
.main-info { display: flex; flex-direction: column; gap: 1.5rem; }
.description-text { white-space: pre-line; margin-top: 0.75rem; }
.card h3 { margin-bottom: 0.5rem; }
.funding { position: sticky; top: 5rem; display: flex; flex-direction: column; gap: 1rem; }
.stats { list-style: none; display: flex; gap: 2rem; }
.stats li { display: flex; flex-direction: column; }
.stats strong { font-size: 1.4rem; color: var(--color-secondary); }
.stats span, .small { font-size: 0.85rem; }
.divider { border: none; border-top: 1px solid var(--color-border); }
.chips { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.75rem 0; }
.chip { border: 1px solid var(--color-border); background: #fff; border-radius: 999px; padding: 0.3rem 0.8rem; cursor: pointer; font: inherit; font-size: 0.85rem; }
.chip:hover { border-color: var(--color-primary); color: var(--color-primary); }
@media (max-width: 860px) { .detail-grid { grid-template-columns: 1fr; } .funding { position: static; } }
</style>
